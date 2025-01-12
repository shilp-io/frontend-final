# Payment and Usage Verification System

## Overview

The system uses three key services for payment and usage management:
- Stripe: Handles payments and subscriptions
- Upstash Redis: Provides real-time usage tracking and rate limiting
- Supabase: Stores persistent user data and subscription details

## Core Components

### 1. Payment Flow

The payment flow begins when a user initiates a subscription:

1. **Session Creation**
```typescript
async function createCheckoutSession(userId: string) {
  // Get or create Stripe customer
  let stripeCustomerId = await upstash.get(`stripe:user:${userId}`);
  
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: { userId }
    });
    stripeCustomerId = customer.id;
    await upstash.set(`stripe:user:${userId}`, stripeCustomerId);
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    success_url: `${process.env.DOMAIN}/payment/success`,
    cancel_url: `${process.env.DOMAIN}/payment/cancel`
  });

  return session;
}
```

2. **Webhook Processing**
```typescript
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Update subscription status in Upstash
      await upstash.set(`stripe:sub:${customerId}`, {
        status: subscription.status,
        planId: subscription.items.data[0].price.id,
        currentPeriodEnd: subscription.current_period_end
      });

      // Update persistent storage in Supabase
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: customerId,
          status: subscription.status,
          plan_id: subscription.items.data[0].price.id,
          current_period_end: subscription.current_period_end
        });
      break;
  }
}
```

### 2. Usage Tracking

1. **Rate Limiting and Usage Tracking**
```typescript
class UsageManager {
  private readonly upstash: Redis;
  
  async trackUsage(userId: string, action: string) {
    const key = `usage:${userId}:${action}:${this.getCurrentPeriod()}`;
    const count = await this.upstash.incr(key);
    
    // Set expiry to end of billing period
    const ttl = await this.upstash.ttl(key);
    if (ttl === -1) {
      const periodEnd = await this.getSubscriptionPeriodEnd(userId);
      await this.upstash.expireat(key, periodEnd);
    }
    
    return count;
  }

  async checkUsageLimit(userId: string, action: string): Promise<boolean> {
    const limits = await this.getPlanLimits(userId);
    const currentUsage = await this.getCurrentUsage(userId, action);
    return currentUsage < limits[action];
  }
}
```

2. **Plan Limits Verification**
```typescript
async function verifyUsageAndExecute(userId: string, action: string, handler: () => Promise<void>) {
  const usageManager = new UsageManager();
  
  // Check if action is allowed under current plan
  const canExecute = await usageManager.checkUsageLimit(userId, action);
  if (!canExecute) {
    throw new Error('Usage limit exceeded');
  }
  
  // Execute action and track usage
  await handler();
  await usageManager.trackUsage(userId, action);
}
```

### 3. Subscription Status Caching

1. **Cache Layer**
```typescript
class SubscriptionCache {
  async getStatus(userId: string): Promise<SubscriptionStatus> {
    // Try Upstash first
    const cached = await upstash.get(`stripe:sub:${userId}`);
    if (cached) return cached;
    
    // Fall back to Supabase
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (data) {
      // Cache in Upstash for future requests
      await upstash.set(`stripe:sub:${userId}`, data, {
        ex: 300 // 5 minute cache
      });
    }
    
    return data;
  }
}
```

## Usage Patterns

### 1. Request Flow with Usage Verification

```typescript
async function handleRequirementCreation(req: Request) {
  const userId = getUserId(req);
  
  await verifyUsageAndExecute(userId, 'create_requirement', async () => {
    // Create requirement logic
    await requirementRepository.create(req.body);
  });
}
```

### 2. Subscription Status Check

```typescript
async function checkSubscriptionAccess(userId: string, feature: string): Promise<boolean> {
  const subCache = new SubscriptionCache();
  const status = await subCache.getStatus(userId);
  
  // Check if subscription is active
  if (status.status !== 'active') {
    return false;
  }
  
  // Check if feature is included in plan
  const planFeatures = await getPlanFeatures(status.planId);
  return planFeatures.includes(feature);
}
```

## Error Handling

```typescript
async function handlePaymentError(error: Stripe.StripeError) {
  switch (error.type) {
    case 'StripeCardError':
      // Handle failed payment
      break;
    case 'StripeInvalidRequestError':
      // Handle invalid requests
      break;
    default:
      // Handle other errors
      break;
  }
  
  // Log error to monitoring
  await captureError(error);
}
```

## System Interaction Flow

1. User initiates payment → Stripe checkout session created
2. Payment successful → Webhook updates Upstash and Supabase
3. User performs action → System checks:
   - Subscription status (Upstash → Supabase fallback)
   - Usage limits (Upstash)
4. Action allowed → Execute and increment usage counter
5. Usage limits met → Notify user and prevent action

This architecture provides:
- Fast access to subscription status via Redis
- Reliable persistent storage via Supabase
- Secure payment processing via Stripe
- Real-time usage tracking and rate limiting
