# Requirements Management System Documentation

## 1. Domain Layer

### 1.1 Core Entities

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: RequirementStatus;
  priority: RequirementPriority;
  type: RequirementType;
  sourceDocIds: string[]; // References to external documents
  parentId?: string; // For hierarchical requirements
  metadata: Record<string, any>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ExternalDocument {
  id: string;
  collectionId: string;
  title: string;
  description: string;
  type: DocumentType;
  status: DocumentStatus;
  version: string;
  effectiveDate: Date;
  storageUrl: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  type: CollectionType;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2 Domain Events

```typescript
interface DomainEvent {
  id: string;
  timestamp: Date;
  type: string;
  payload: unknown;
  metadata: {
    userId: string;
    organizationId: string;
    correlationId: string;
  };
}

interface RequirementCreatedEvent extends DomainEvent {
  type: 'REQUIREMENT_CREATED';
  payload: {
    requirementId: string;
    projectId: string;
    title: string;
    createdBy: string;
  };
}

interface DocumentLinkedEvent extends DomainEvent {
  type: 'DOCUMENT_LINKED';
  payload: {
    requirementId: string;
    documentId: string;
    linkType: 'SOURCE' | 'REFERENCE';
  };
}
```

## 2. Application Layer

### 2.1 Services

```typescript
class RequirementService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly storage: Storage,
    private readonly cache: UpstashRedis,
    private readonly eventBus: EventBus
  ) {}

  async createRequirement(
    command: CreateRequirementCommand
  ): Promise<Result<Requirement, Error>> {
    const schema = requirementSchema.parse(command);
    
    return await this.supabase.transaction(async (tx) => {
      // Create requirement
      const requirement = await tx
        .from('requirements')
        .insert(schema)
        .select()
        .single();

      // Update cache
      await this.cache.set(
        `requirement:${requirement.id}`,
        requirement,
        { ex: 3600 }
      );

      // Publish event
      await this.eventBus.publish({
        type: 'REQUIREMENT_CREATED',
        payload: requirement
      });

      return Result.success(requirement);
    });
  }
}
```

### 2.2 Command Handlers with Zod Validation

```typescript
const createRequirementSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string(),
  type: z.enum(['FUNCTIONAL', 'NON_FUNCTIONAL', 'CONSTRAINT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  sourceDocIds: z.array(z.string().uuid()),
  metadata: z.record(z.unknown())
});

class CreateRequirementHandler {
  async handle(
    command: z.infer<typeof createRequirementSchema>
  ): Promise<Result<Requirement, Error>> {
    const validated = createRequirementSchema.parse(command);
    return await this.requirementService.createRequirement(validated);
  }
}
```

## 3. Infrastructure Layer

### 3.1 Supabase Repository

```typescript
class RequirementRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly cache: UpstashRedis
  ) {}

  async findById(id: string): Promise<Requirement | null> {
    // Check cache first
    const cached = await this.cache.get(`requirement:${id}`);
    if (cached) return cached;

    // Query database
    const { data } = await this.supabase
      .from('requirements')
      .select()
      .eq('id', id)
      .single();

    // Update cache
    if (data) {
      await this.cache.set(`requirement:${id}`, data, { ex: 3600 });
    }

    return data;
  }

  async save(
    requirement: Requirement, 
    events: DomainEvent[]
  ): Promise<void> {
    await this.supabase.transaction(async (tx) => {
      // Save requirement
      await tx
        .from('requirements')
        .upsert(requirement);

      // Save events
      await tx
        .from('domain_events')
        .insert(events);

      // Invalidate cache
      await this.cache.del(`requirement:${requirement.id}`);
    });
  }
}
```

### 3.2 Firebase Auth Integration

```typescript
class AuthService {
  constructor(
    private readonly auth: FirebaseAdminAuth,
    private readonly supabase: SupabaseClient
  ) {}

  async validateToken(token: string): Promise<UserProfile> {
    // Verify Firebase token
    const decodedToken = await this.auth.verifyIdToken(token);

    // Get user profile from Supabase
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select()
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (!profile) {
      throw new UnauthorizedError();
    }

    return profile;
  }
}
```

## 4. Interface Layer

### 4.1 Next.js API Routes

```typescript
// pages/api/requirements/[id].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate Firebase token
  const token = req.headers.authorization?.split('Bearer ')[1];
  const user = await authService.validateToken(token);

  switch (req.method) {
    case 'GET':
      const requirement = await requirementService.findById(req.query.id);
      return res.json(requirement);

    case 'PUT':
      const result = await requirementService.updateRequirement({
        ...req.body,
        userId: user.id
      });
      return res.json(result);

    default:
      res.status(405).end();
  }
}
```

### 4.2 Zustand Store with Optimistic Updates

```typescript
interface RequirementStore {
  requirements: Map<string, Requirement>;
  pending: Map<string, OptimisticUpdate>;
  loading: boolean;
  error: Error | null;

  fetchRequirement: (id: string) => Promise<void>;
  updateRequirement: (
    id: string, 
    update: Partial<Requirement>
  ) => Promise<void>;
}

const useRequirementStore = create<RequirementStore>((set, get) => ({
  requirements: new Map(),
  pending: new Map(),
  loading: false,
  error: null,

  updateRequirement: async (id, update) => {
    // Store previous state
    const previous = get().requirements.get(id);
    
    // Apply optimistic update
    set((state) => ({
      pending: state.pending.set(id, {
        previous,
        updated: { ...previous, ...update },
        timestamp: new Date()
      })
    }));

    try {
      // Make API call
      const result = await api.updateRequirement(id, update);
      
      // Confirm update
      set((state) => ({
        requirements: state.requirements.set(id, result),
        pending: state.pending.delete(id)
      }));
    } catch (error) {
      // Rollback on failure
      set((state) => ({
        pending: state.pending.delete(id),
        error
      }));
    }
  }
}));
```

## 5. Event Handlers

### 5.1 Requirement Change Handlers

```typescript
class RequirementChangeHandler implements EventHandler {
  async handle(event: RequirementChangedEvent): Promise<void> {
    // Update related requirements
    // Invalidate caches
    // Trigger notifications
  }
}
```

### 5.2 Document Integration Handlers

```typescript
class DocumentStorageHandler implements EventHandler {
  async handle(event: DocumentUploadedEvent): Promise<void> {
    // Process document in storage
    // Extract metadata
    // Update search indices
  }
}
```

## 6. Performance Optimizations

### 6.1 Caching Strategy
- Upstash Redis for fast access to frequently used data
- Cache invalidation on writes
- Selective cache updates for partial changes
- Batch operations for bulk updates

### 6.2 Supabase Optimizations
- Proper indexing strategy
- Materialized views for complex queries
- Connection pooling
- Query optimization

### 6.3 Storage Optimization
- Efficient document storage in Supabase Storage
- Compression for large documents
- Metadata extraction and indexing
- Chunked uploads for large files