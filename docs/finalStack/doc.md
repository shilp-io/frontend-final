# Comprehensive System Architecture Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Technology Stack](#technology-stack)
3. [Core Architecture](#core-architecture)
4. [Design Patterns](#design-patterns)
5. [State Management](#state-management)
6. [Security Architecture](#security-architecture)
7. [Data Flow](#data-flow)
8. [Implementation Examples](#implementation-examples)
9. [Hosting and Deployment](#hosting-and-deployment)
10. [Stripe Payment Integration](#stripe-payment-integration)
11. [AI Integration](#ai-integration)
12. [Real-time Collaboration](#real-time-collaboration)
13. [Performance Optimization](#performance-optimization)
14. [Monitoring and Analytics](#monitoring-and-analytics)

## Introduction

This document provides a comprehensive overview of the architecture for a Systems Engineering Requirements Analysis and Management Tool. The application is designed to facilitate teamwork, AI-driven analysis, and real-time collaboration on a live canvas. The architecture is built to be stable, responsive, and scalable, leveraging modern technologies and best practices.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **State Management**: 
  - Zustand for UI state
  - React Query for server state
  - Upstash Redis for real-time sync
- **UI Components**: Tailwind CSS + shadcn/ui
- **Real-time**: WebSocket with CRDT
- **Type Safety**: TypeScript

### Backend
- **API Layer**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Cache**: Upstash Redis
- **Authentication**: Firebase Auth
- **Storage**: Supabase Storage
- **Payment**: Stripe

### Infrastructure
- **Hosting**: Vercel (MVP), Firebase (Production)
- **CDN**: Cloudflare
- **Security**: WAF + DDoS Protection
- **Monitoring**: Sentry + Vercel Analytics

## Core Architecture

### Layer Separation

1. **Presentation Layer**
```typescript
// components/requirements/RequirementCard.tsx
interface RequirementCardProps {
  requirement: Requirement;
  onUpdate: (id: string, data: Partial<Requirement>) => void;
}

export function RequirementCard({ requirement, onUpdate }: RequirementCardProps) {
  const { data: team } = useTeam(requirement.teamId);
  const permissions = usePermissions(requirement.id);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{requirement.title}</CardTitle>
        {permissions.canEdit && (
          <RequirementActions requirement={requirement} onUpdate={onUpdate} />
        )}
      </CardHeader>
    </Card>
  );
}
```

2. **Application Layer**
```typescript
// lib/requirements/actions.ts
export async function updateRequirement(
  id: string,
  data: Partial<Requirement>,
  userId: string
) {
  // Validate permissions
  const canEdit = await checkPermission(userId, id, 'edit');
  if (!canEdit) throw new Error('Unauthorized');

  // Update in database
  const { error } = await supabase
    .from('requirements')
    .update(data)
    .eq('id', id);

  if (error) throw error;

  // Sync to Redis for real-time updates
  await syncRequirementToRedis(id);

  // Notify team members
  await notifyTeamMembers(id, 'requirement_updated', userId);
}
```

3. **Domain Layer**
```typescript
// domain/requirements/validation.ts
export function validateRequirement(data: Partial<Requirement>): ValidationResult {
  const rules = {
    title: [
      { rule: 'required', message: 'Title is required' },
      { rule: 'minLength', value: 3, message: 'Title too short' },
    ],
    priority: [
      { rule: 'oneOf', value: ['low', 'medium', 'high'], message: 'Invalid priority' },
    ],
  };

  return validateAgainstRules(data, rules);
}
```

4. **Infrastructure Layer**
```typescript
// infrastructure/database/requirements.ts
export class RequirementRepository implements IRequirementRepository {
  async findById(id: string): Promise<Requirement> {
    // Try cache first
    const cached = await redis.get(`requirement:${id}`);
    if (cached) return JSON.parse(cached);

    // Fall back to database
    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Cache for next time
    await redis.set(`requirement:${id}`, JSON.stringify(data), { ex: 300 });

    return data;
  }
}
```

## Design Patterns

### 1. Repository Pattern
```typescript
// patterns/repository/requirement.ts
export interface IRequirementRepository {
  findById(id: string): Promise<Requirement>;
  findByProject(projectId: string): Promise<Requirement[]>;
  create(data: CreateRequirementDTO): Promise<Requirement>;
  update(id: string, data: Partial<Requirement>): Promise<Requirement>;
  delete(id: string): Promise<void>;
}

export class RequirementRepository implements IRequirementRepository {
  constructor(
    private readonly db: SupabaseClient,
    private readonly cache: Redis
  ) {}

  async findById(id: string): Promise<Requirement> {
    return await this.withCache(
      `requirement:${id}`,
      async () => {
        const { data, error } = await this.db
          .from('requirements')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data;
      }
    );
  }

  private async withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    const cached = await this.cache.get(key);
    if (cached) return JSON.parse(cached);

    const data = await fetchFn();
    await this.cache.set(key, JSON.stringify(data), { ex: ttl });
    
    return data;
  }
}
```

### 2. Observer Pattern (for Real-time Updates)
```typescript
// patterns/observer/requirement-updates.ts
export class RequirementUpdateObserver {
  private subscribers: Map<string, Set<(data: RequirementUpdate) => void>> =
    new Map();

  subscribe(requirementId: string, callback: (data: RequirementUpdate) => void) {
    if (!this.subscribers.has(requirementId)) {
      this.subscribers.set(requirementId, new Set());
    }
    this.subscribers.get(requirementId)!.add(callback);
  }

  unsubscribe(requirementId: string, callback: (data: RequirementUpdate) => void) {
    this.subscribers.get(requirementId)?.delete(callback);
  }

  notify(requirementId: string, update: RequirementUpdate) {
    this.subscribers.get(requirementId)?.forEach(callback => callback(update));
  }
}
```

### 3. Factory Pattern (for Requirement Creation)
```typescript
// patterns/factory/requirement-factory.ts
export class RequirementFactory {
  static create(type: RequirementType, data: RequirementDTO): Requirement {
    switch (type) {
      case 'feature':
        return new FeatureRequirement(data);
      case 'bug':
        return new BugRequirement(data);
      case 'enhancement':
        return new EnhancementRequirement(data);
      default:
        throw new Error(`Unknown requirement type: ${type}`);
    }
  }
}
```

### 4. Command Pattern (for Actions)
```typescript
// patterns/command/requirement-commands.ts
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

class UpdateRequirementCommand implements Command {
  constructor(
    private readonly id: string,
    private readonly data: Partial<Requirement>,
    private readonly previousData: Requirement
  ) {}

  async execute() {
    await requirementRepository.update(this.id, this.data);
  }

  async undo() {
    await requirementRepository.update(this.id, this.previousData);
  }
}
```

## State Management

### 1. Zustand Store Configuration
```typescript
// store/requirements.ts
interface RequirementState {
  activeRequirement: Requirement | null;
  filters: RequirementFilters;
  sortOrder: SortOrder;
  setActiveRequirement: (req: Requirement | null) => void;
  updateFilters: (filters: Partial<RequirementFilters>) => void;
  setSortOrder: (order: SortOrder) => void;
}

export const useRequirementStore = create<RequirementState>()(
  persist(
    (set) => ({
      activeRequirement: null,
      filters: defaultFilters,
      sortOrder: 'desc',
      setActiveRequirement: (req) => set({ activeRequirement: req }),
      updateFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      setSortOrder: (order) => set({ sortOrder: order }),
    }),
    {
      name: 'requirement-store',
    }
  )
);
```

### 2. React Query Integration
```typescript
// hooks/queries/requirements.ts
export function useRequirements(projectId: string) {
  const filters = useRequirementStore((state) => state.filters);
  const sortOrder = useRequirementStore((state) => state.sortOrder);

  return useQuery({
    queryKey: ['requirements', projectId, filters, sortOrder],
    queryFn: () =>
      requirementRepository.findByProject(projectId, filters, sortOrder),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRequirement(id: string) {
  return useQuery({
    queryKey: ['requirement', id],
    queryFn: () => requirementRepository.findById(id),
    staleTime: 1000 * 60 * 5,
  });
}
```

### 3. Real-time Sync with Redis
```typescript
// lib/realtime/sync.ts
export class RealtimeSync {
  private ws: WebSocket;
  private reconnectAttempts = 0;

  constructor(private readonly userId: string) {
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
  }

  private handleMessage = (event: MessageEvent) => {
    const update = JSON.parse(event.data);
    queryClient.setQueryData(['requirement', update.id], update);
  };

  private handleClose = () => {
    if (this.reconnectAttempts < 5) {
      setTimeout(() => {
        this.setupWebSocket();
        this.reconnectAttempts++;
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  };
}
```

## Security Architecture

### 1. Request Validation
```typescript
// lib/security/validation.ts
export async function validateRequest(
  req: NextApiRequest,
  config: ValidationConfig
) {
  // Rate limiting
  const rateLimitResult = await rateLimit.check(req.ip!);
  if (!rateLimitResult.success) {
    throw new ApiError(429, 'Too Many Requests');
  }

  // Authentication
  if (config.requireAuth) {
    const user = await auth(req);
    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }
  }

  // CORS
  if (!isValidOrigin(req.headers.origin)) {
    throw new ApiError(403, 'Invalid Origin');
  }

  // Input validation
  if (config.schema) {
    const result = config.schema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(400, 'Invalid Input', result.error);
    }
  }
}
```

### 2. Payment Security
```typescript
// lib/security/payments.ts
export async function validateStripeWebhook(
  body: string,
  signature: string
): Promise<boolean> {
  try {
    stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return true;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return false;
  }
}
```

## Data Flow

### 1. Create Requirement Flow
```typescript
// Example of complete data flow for requirement creation
export async function createRequirement(data: CreateRequirementDTO) {
  // 1. Validate input
  const validationResult = validateRequirement(data);
  if (!validationResult.success) {
    throw new ValidationError(validationResult.errors);
  }

  // 2. Check permissions
  const canCreate = await checkPermission(data.userId, data.projectId, 'create');
  if (!canCreate) {
    throw new UnauthorizedError();
  }

  // 3. Create in database
  const requirement = await requirementRepository.create(data);

  // 4. Update cache
  await redis.set(
    `requirement:${requirement.id}`,
    JSON.stringify(requirement),
    { ex: 300 }
  );

  // 5. Notify team members
  await notifyTeam(requirement.projectId, {
    type: 'requirement_created',
    requirementId: requirement.id,
    userId: data.userId,
  });

  // 6. Track usage
  await trackUsage(data.userId, 'requirement_created');

  return requirement;
}
```

## Implementation Examples

### 1. Real-time Collaboration Component
```typescript
// components/collaboration/RequirementEditor.tsx
export function RequirementEditor({ requirementId }: { requirementId: string }) {
  const { data: requirement } = useRequirement(requirementId);
  const [localChanges, setLocalChanges] = useState({});
  const debouncedSync = useDebouncedCallback(
    (changes) => syncChanges(requirementId, changes),
    1000
  );

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/requirements/${requirementId}`);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setLocalChanges((prev) => mergeCRDT(prev, update));
    };
    return () => ws.close();
  }, [requirementId]);

  return (
    <div className="space-y-4">
      <Input
        value={requirement?.title}
        onChange={(e) => {
          setLocalChanges((prev) => ({
            ...prev,
            title: e.target.value,
          }));
          debouncedSync({ title: e.target.value });
        }}
      />
      {/* Other fields */}
    </div>
  );
}
```

### 2. Permission-based UI
```typescript
// components/requirements/RequirementActions.tsx
export function RequirementActions({ requirement }: { requirement: Requirement }) {
  const permissions = usePermissions(requirement.id);
  const { mutate: updateRequirement } = useUpdateRequirement();

  if (!permissions.canEdit && !permissions.canDelete) {
    return null;
  }

  return (
    <div className="space-x-2">
      {permissions.canEdit && (
        <Button
          onClick={() => {
            // Show edit modal
          }}
        >
          Edit
        </Button>
      )}
      {permissions.canDelete && (
        <Button
          variant="destructive"
          onClick={() => {
            // Show delete confirmation
          }}
        >
          Delete
        </Button>
      )}
    </div>
  );
}
```

## Hosting and Deployment

### 1. Vercel (MVP)
- **Deployment**: Automatic deployment from GitHub
- **Environment Variables**: Managed via Vercel dashboard
- **Preview Environments**: Automatically created for each pull request

### 2. Firebase (Production)
- **Hosting**: Firebase Hosting with CDN
- **Functions**: Firebase Functions for server-side logic
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage for file uploads

## Stripe Payment Integration

### 1. Checkout Flow
```typescript
export async function GET(req: Request) {
  const user = auth(req);

  // Get the stripeCustomerId from your KV store
  let stripeCustomerId = await kv.get(`stripe:user:${user.id}`);

  // Create a new Stripe customer if this user doesn't have one
  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id, // DO NOT FORGET THIS
      },
    });

    // Store the relation between userId and stripeCustomerId in your KV
    await kv.set(`stripe:user:${user.id}`, newCustomer.id);
    stripeCustomerId = newCustomer.id;
  }

  // ALWAYS create a checkout with a stripeCustomerId. They should enforce this.
  const checkout = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    success_url: "https://t3.chat/success",
    ...
  });
```

### 2. Sync Stripe Data to KV
```typescript
export async function syncStripeDataToKV(customerId: string) {
  // Fetch latest subscription data from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const subData = { status: "none" };
    await kv.set(`stripe:customer:${customerId}`, subData);
    return subData;
  }

  // If a user can have multiple subscriptions, that's your problem
  const subscription = subscriptions.data[0];

  // Store complete subscription state
  const subData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodEnd: subscription.current_period_end,
    currentPeriodStart: subscription.current_period_start,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  // Store the data in your KV
  await kv.set(`stripe:customer:${customerId}`, subData);
  return subData;
}
```

### 3. Webhook Handling
```typescript
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) return NextResponse.json({}, { status: 400 });

  async function doEventProcessing() {
    if (typeof signature !== "string") {
      throw new Error("[STRIPE HOOK] Header isn't a string???");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    waitUntil(processEvent(event));
  }

  const { error } = await tryCatch(doEventProcessing());

  if (error) {
    console.error("[STRIPE HOOK] Error processing event", error);
  }

  return NextResponse.json({ received: true });
}
```

## AI Integration

### 1. Requirement Analysis
```typescript
// lib/ai/requirement-analyzer.ts
export class RequirementAnalyzer {
  async analyzeRequirement(requirement: Requirement) {
    // 1. Prepare context
    const context = await this.buildContext(requirement);

    // 2. Generate analysis
    const analysis = await this.generateAnalysis(requirement, context);

    // 3. Extract insights
    const insights = this.extractInsights(analysis);

    return {
      quality: insights.quality,
      completeness: insights.completeness,
      suggestions: insights.suggestions,
      relatedRequirements: insights.related,
    };
  }

  private async buildContext(requirement: Requirement) {
    const project = await requirementRepository.getProject(requirement.projectId);
    const relatedReqs = await requirementRepository.findRelated(requirement.id);
    return {
      project,
      relatedRequirements: relatedReqs,
      domainKnowledge: await this.getDomainKnowledge(project.domain),
    };
  }
}
```

## Real-time Collaboration

### 1. Sync Manager
```typescript
// lib/collaboration/sync-manager.ts
export class SyncManager {
  private crdt: CRDT;
  private ws: WebSocket;
  private syncInterval: NodeJS.Timer;

  constructor(private readonly requirementId: string) {
    this.crdt = new CRDT(requirementId);
    this.setupWebSocket();
    this.setupAutoSync();
  }

  private setupWebSocket() {
    this.ws = new WebSocket(`${WS_URL}/requirements/${this.requirementId}`);
    this.ws.onmessage = this.handleRemoteUpdate;
  }

  private setupAutoSync() {
    this.syncInterval = setInterval(() => {
      this.syncToServer();
    }, 5000);
  }

  private handleRemoteUpdate = (event: MessageEvent) => {
    const update = JSON.parse(event.data);
    this.crdt.merge(update);
    this.notifySubscribers();
  };

  private async syncToServer() {
    const changes = this.crdt.getChanges();
    if (Object.keys(changes).length > 0) {
      await fetch(`/api/requirements/${this.requirementId}/sync`, {
        method: 'POST',
        body: JSON.stringify(changes),
      });
    }
  }

  destroy() {
    this.ws.close();
    clearInterval(this.syncInterval);
  }
}
```

## Performance Optimization

### 1. Query Optimization
```typescript
// lib/optimization/query-optimizer.ts
export class QueryOptimizer {
  private queryCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async optimizeQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: {
      useCache?: boolean;
      invalidatePattern?: string;
    } = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(key);

    // Check cache
    if (options.useCache) {
      const cached = this.queryCache.get(cacheKey);
      if (
        cached &&
        Date.now() - cached.timestamp < this.CACHE_TTL
      ) {
        return cached.data;
      }
    }

    // Execute query
    const result = await queryFn();

    // Update cache
    if (options.useCache) {
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
    }

    // Invalidate related queries
    if (options.invalidatePattern) {
      this.invalidatePattern(options.invalidatePattern);
    }

    return result;
  }

  private generateCacheKey(key: string): string {
    return `query:${key}`;
  }

  private invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const [key] of this.queryCache) {
      if (regex.test(key)) {
        this.queryCache.delete(key);
      }
    }
  }
}
```

### 2. Real-time Performance Monitoring
```typescript
// lib/monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: {
    queryTimes: number[];
    renderTimes: number[];
    networkRequests: number;
    errors: Error[];
  } = {
    queryTimes: [],
    renderTimes: [],
    networkRequests: 0,
    errors: [],
  };

  trackQuery(duration: number) {
    this.metrics.queryTimes.push(duration);
    this.checkQueryPerformance();
  }

  trackRender(duration: number) {
    this.metrics.renderTimes.push(duration);
    this.checkRenderPerformance();
  }

  private checkQueryPerformance() {
    const recentQueries = this.metrics.queryTimes.slice(-10);
    const avgQueryTime =
      recentQueries.reduce((a, b) => a + b, 0) / recentQueries.length;

    if (avgQueryTime > 500) {
      this.reportPerformanceIssue('query', avgQueryTime);
    }
  }

  private checkRenderPerformance() {
    const recentRenders = this.metrics.renderTimes.slice(-10);
    const avgRenderTime =
      recentRenders.reduce((a, b) => a + b, 0) / recentRenders.length;

    if (avgRenderTime > 16) {
      this.reportPerformanceIssue('render', avgRenderTime);
    }
  }

  private reportPerformanceIssue(type: string, value: number) {
    // Report to monitoring service
    console.warn(`Performance issue detected: ${type} - ${value}ms`);
  }
}
```

## Monitoring and Analytics

### 1. Sentry Integration
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}
```

### 2. Vercel Analytics
```typescript
// lib/analytics/vercel.ts
import { Analytics } from '@vercel/analytics/react';

export function trackEvent(event: string, properties: Record<string, any>) {
  Analytics.track(event, properties);
}
```

## Conclusion

This document provides a comprehensive overview of the architecture for the Systems Engineering Requirements Analysis and Management Tool. By following the outlined design patterns, state management strategies, and security implementations, the application is built to be stable, responsive, and scalable. The integration of AI, real-time collaboration, and performance optimization ensures a seamless user experience.