# Command and Event Architecture

## 1. Commands

### 1.1 Command Structure

```typescript
// src/core/application/commands/base-command.ts
interface BaseCommand {
  id: string;
  timestamp: Date;
  userId: string;
  organizationId: string;
  metadata?: Record<string, unknown>;
}

// src/core/application/commands/requirement-commands.ts
interface CreateRequirementCommand extends BaseCommand {
  type: "CREATE_REQUIREMENT";
  payload: {
    projectId: string;
    title: string;
    description: string;
    priority: RequirementPriority;
    type: RequirementType;
    sourceDocIds: string[];
  };
}

interface UpdateRequirementCommand extends BaseCommand {
  type: "UPDATE_REQUIREMENT";
  payload: {
    requirementId: string;
    changes: Partial<RequirementData>;
  };
}

interface LinkDocumentCommand extends BaseCommand {
  type: "LINK_DOCUMENT";
  payload: {
    requirementId: string;
    documentId: string;
    linkType: "SOURCE" | "REFERENCE";
  };
}

// Command validation schemas
const createRequirementSchema = z.object({
  type: z.literal("CREATE_REQUIREMENT"),
  payload: z.object({
    projectId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    type: z.enum(["FUNCTIONAL", "NON_FUNCTIONAL", "CONSTRAINT"]),
    sourceDocIds: z.array(z.string().uuid()),
  }),
});
```

### 1.2 Command Bus Implementation

```typescript
// src/core/application/command-bus.ts
export class CommandBus {
  private handlers = new Map<string, CommandHandler<any>>();

  constructor(
    private readonly logger: Logger,
    private readonly eventBus: EventBus,
  ) {}

  register<T extends BaseCommand>(
    commandType: string,
    handler: CommandHandler<T>,
  ): void {
    this.handlers.set(commandType, handler);
  }

  async dispatch<T extends BaseCommand>(
    command: T,
  ): Promise<Result<any, Error>> {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      return Result.failure(
        new Error(`No handler for command type: ${command.type}`),
      );
    }

    try {
      const correlationId = command.id;
      const startTime = Date.now();

      // Log command receipt
      this.logger.info("Command received", {
        commandType: command.type,
        correlationId,
        userId: command.userId,
      });

      // Execute handler
      const result = await handler.execute(command);

      // Log command completion
      this.logger.info("Command completed", {
        commandType: command.type,
        correlationId,
        duration: Date.now() - startTime,
        success: result.isSuccess(),
      });

      return result;
    } catch (error) {
      this.logger.error("Command failed", {
        commandType: command.type,
        error,
      });
      return Result.failure(error);
    }
  }
}
```

### 1.3 Command Handler Example

```typescript
// src/core/application/handlers/create-requirement-handler.ts
export class CreateRequirementHandler
  implements CommandHandler<CreateRequirementCommand>
{
  constructor(
    private readonly repository: RequirementRepository,
    private readonly eventBus: EventBus,
    private readonly validator: RequirementValidator,
  ) {}

  async execute(
    command: CreateRequirementCommand,
  ): Promise<Result<Requirement, Error>> {
    // 1. Validate command
    const validationResult = createRequirementSchema.safeParse(command);
    if (!validationResult.success) {
      return Result.failure(new ValidationError(validationResult.error));
    }

    // 2. Create domain entity
    const requirement = new Requirement({
      ...command.payload,
      createdBy: command.userId,
      organizationId: command.organizationId,
      status: "DRAFT",
      version: 1,
    });

    // 3. Validate domain rules
    const domainValidation = await this.validator.validate(requirement);
    if (!domainValidation.isValid) {
      return Result.failure(new DomainValidationError(domainValidation.errors));
    }

    try {
      // 4. Persist changes and collect events
      const events = await this.repository.save(requirement);

      // 5. Publish events
      await this.eventBus.publishAll(events);

      return Result.success(requirement);
    } catch (error) {
      return Result.failure(error);
    }
  }
}
```

## 2. Events

### 2.1 Event Structure

```typescript
// src/core/domain/events/base-event.ts
interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  correlationId: string;
  causationId: string;
  metadata: {
    userId: string;
    organizationId: string;
    version: number;
  };
}

// src/core/domain/events/requirement-events.ts
interface RequirementCreatedEvent extends BaseEvent {
  type: "REQUIREMENT_CREATED";
  payload: {
    requirementId: string;
    projectId: string;
    title: string;
    createdBy: string;
  };
}

interface RequirementUpdatedEvent extends BaseEvent {
  type: "REQUIREMENT_UPDATED";
  payload: {
    requirementId: string;
    changes: Partial<RequirementData>;
    previousVersion: number;
  };
}

interface DocumentLinkedEvent extends BaseEvent {
  type: "DOCUMENT_LINKED";
  payload: {
    requirementId: string;
    documentId: string;
    linkType: string;
  };
}
```

### 2.2 Event Bus Implementation

```typescript
// src/core/application/event-bus.ts
export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private priorityHandlers = new Map<string, PriorityQueue<EventHandler>>();

  constructor(private readonly logger: Logger) {}

  subscribe(
    eventType: string,
    handler: EventHandler,
    priority: number = 0,
  ): void {
    const handlers = this.handlers.get(eventType) || new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);

    // Add to priority queue if needed
    if (priority !== 0) {
      const priorityQueue =
        this.priorityHandlers.get(eventType) ||
        new PriorityQueue<EventHandler>();
      priorityQueue.add(handler, priority);
      this.priorityHandlers.set(eventType, priorityQueue);
    }
  }

  async publishAll(events: BaseEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  async publish(event: BaseEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || new Set();
    const priorityQueue = this.priorityHandlers.get(event.type);

    try {
      // Handle priority handlers first
      if (priorityQueue) {
        for (const handler of priorityQueue) {
          await this.executeHandler(handler, event);
        }
      }

      // Handle regular handlers
      const promises = Array.from(handlers).map((handler) =>
        this.executeHandler(handler, event),
      );

      await Promise.all(promises);
    } catch (error) {
      this.logger.error("Event handling failed", {
        eventType: event.type,
        error,
      });
      throw error;
    }
  }

  private async executeHandler(
    handler: EventHandler,
    event: BaseEvent,
  ): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      this.logger.error("Event handler failed", {
        handler: handler.constructor.name,
        eventType: event.type,
        error,
      });
      throw error;
    }
  }
}
```

### 2.3 Event Handler Examples

```typescript
// src/core/application/handlers/requirement-created-handler.ts
export class RequirementCreatedHandler implements EventHandler {
  constructor(
    private readonly cache: CacheManager,
    private readonly notifier: NotificationService,
  ) {}

  async handle(event: RequirementCreatedEvent): Promise<void> {
    // 1. Invalidate relevant caches
    await this.cache.invalidatePattern(`project:${event.payload.projectId}:*`);

    // 2. Send notifications
    await this.notifier.notifyProjectMembers(event.payload.projectId, {
      type: "REQUIREMENT_CREATED",
      title: `New requirement: ${event.payload.title}`,
      requirementId: event.payload.requirementId,
    });
  }
}

// src/core/application/handlers/document-linked-handler.ts
export class DocumentLinkedHandler implements EventHandler {
  constructor(
    private readonly searchIndex: SearchIndexService,
    private readonly traceability: TraceabilityService,
  ) {}

  async handle(event: DocumentLinkedEvent): Promise<void> {
    // 1. Update search index
    await this.searchIndex.updateRequirementReferences(
      event.payload.requirementId,
      event.payload.documentId,
    );

    // 2. Update traceability matrix
    await this.traceability.addLink({
      sourceId: event.payload.requirementId,
      targetId: event.payload.documentId,
      type: event.payload.linkType,
    });
  }
}
```

## 3. Event Propagation Example

```typescript
// Example of command execution and event propagation
async function processCreateRequirement(
  command: CreateRequirementCommand,
): Promise<void> {
  // 1. Command execution
  const result = await commandBus.dispatch(command);

  if (result.isFailure()) {
    logger.error("Failed to create requirement", {
      command,
      error: result.error,
    });
    return;
  }

  const requirement = result.value;

  // 2. Event creation
  const event: RequirementCreatedEvent = {
    id: uuid(),
    type: "REQUIREMENT_CREATED",
    timestamp: new Date(),
    correlationId: command.id,
    causationId: command.id,
    metadata: {
      userId: command.userId,
      organizationId: command.organizationId,
      version: requirement.version,
    },
    payload: {
      requirementId: requirement.id,
      projectId: requirement.projectId,
      title: requirement.title,
      createdBy: command.userId,
    },
  };

  // 3. Event publication
  await eventBus.publish(event);

  logger.info("Requirement created successfully", {
    requirementId: requirement.id,
    correlationId: command.id,
  });
}
```

## 4. Usage in API Routes

```typescript
// src/app/api/requirements/route.ts
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await getCurrentUser(req);

    const command: CreateRequirementCommand = {
      id: uuid(),
      type: "CREATE_REQUIREMENT",
      timestamp: new Date(),
      userId: user.id,
      organizationId: user.organizationId,
      payload: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        type: data.type,
        sourceDocIds: data.sourceDocIds,
      },
    };

    const result = await commandBus.dispatch(command);

    if (result.isFailure()) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

## 5. Testing Strategies

```typescript
// src/tests/unit/handlers/create-requirement-handler.test.ts
describe("CreateRequirementHandler", () => {
  let handler: CreateRequirementHandler;
  let repository: MockRequirementRepository;
  let eventBus: MockEventBus;
  let validator: MockRequirementValidator;

  beforeEach(() => {
    repository = new MockRequirementRepository();
    eventBus = new MockEventBus();
    validator = new MockRequirementValidator();
    handler = new CreateRequirementHandler(repository, eventBus, validator);
  });

  it("should successfully create requirement and publish event", async () => {
    const command = createMockCommand();
    const result = await handler.execute(command);

    expect(result.isSuccess()).toBe(true);
    expect(repository.save).toHaveBeenCalled();
    expect(eventBus.publishAll).toHaveBeenCalled();
  });
});
```
