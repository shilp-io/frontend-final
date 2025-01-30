# Next.js Large Scale Application Folder Structure

```
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Authentication group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/                  # Dashboard group
│   │   │   ├── projects/
│   │   │   ├── requirements/
│   │   │   └── layout.tsx
│   │   ├── api/                          # API Routes
│   │   │   ├── projects/
│   │   │   ├── requirements/
│   │   │   └── trpc/                     # tRPC integration (optional)
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── core/                             # Core Domain Logic
│   │   ├── domain/                       # Domain Models & Logic
│   │   │   ├── models/
│   │   │   │   ├── project.ts
│   │   │   │   ├── requirement.ts
│   │   │   │   └── document.ts
│   │   │   ├── events/
│   │   │   │   ├── project-events.ts
│   │   │   │   └── requirement-events.ts
│   │   │   └── value-objects/
│   │   │       ├── status.ts
│   │   │       └── priority.ts
│   │   │
│   │   ├── application/                  # Application Services
│   │   │   ├── services/
│   │   │   │   ├── project-service.ts
│   │   │   │   └── requirement-service.ts
│   │   │   ├── commands/
│   │   │   │   ├── create-project.ts
│   │   │   │   └── update-requirement.ts
│   │   │   └── queries/
│   │   │       ├── get-project.ts
│   │   │       └── list-requirements.ts
│   │   │
│   │   └── ports/                        # Ports & Adapters (Interfaces)
│   │       ├── repositories/
│   │       │   ├── project-repository.ts
│   │       │   └── requirement-repository.ts
│   │       └── services/
│   │           ├── auth-service.ts
│   │           └── storage-service.ts
│   │
│   ├── infrastructure/                   # Infrastructure Layer
│   │   ├── auth/
│   │   │   ├── firebase-admin.ts
│   │   │   └── middleware.ts
│   │   ├── database/
│   │   │   ├── supabase.ts
│   │   │   └── migrations/
│   │   ├── cache/
│   │   │   └── upstash.ts
│   │   ├── storage/
│   │   │   └── supabase-storage.ts
│   │   └── repositories/
│   │       ├── supabase-project-repository.ts
│   │       └── supabase-requirement-repository.ts
│   │
│   ├── lib/                             # Shared Libraries & Utilities
│   │   ├── utils/
│   │   │   ├── date.ts
│   │   │   └── validation.ts
│   │   ├── config/
│   │   │   ├── constants.ts
│   │   │   └── env.ts
│   │   └── hooks/
│   │       ├── use-requirements.ts
│   │       └── use-projects.ts
│   │
│   ├── store/                           # Global State Management
│   │   ├── slices/
│   │   │   ├── project-store.ts
│   │   │   └── requirement-store.ts
│   │   └── middleware/
│   │       └── logger.ts
│   │
│   ├── components/                      # React Components
│   │   ├── ui/                         # Reusable UI Components
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   └── modal/
│   │   ├── features/                   # Feature-specific Components
│   │   │   ├── projects/
│   │   │   │   ├── project-list/
│   │   │   │   └── project-detail/
│   │   │   └── requirements/
│   │   │       ├── requirement-form/
│   │   │       └── requirement-table/
│   │   └── layouts/                    # Layout Components
│   │       ├── dashboard-layout/
│   │       └── auth-layout/
│   │
│   └── styles/                         # Global Styles
│       ├── globals.css
│       └── themes/
│
├── public/                             # Static Files
│   ├── images/
│   └── fonts/
│
├── tests/                              # Test Files
│   ├── unit/
│   │   ├── domain/
│   │   └── application/
│   ├── integration/
│   │   ├── api/
│   │   └── repositories/
│   └── e2e/
│       └── features/
│
├── scripts/                            # Build & Development Scripts
│   ├── seed.ts
│   └── generate-types.ts
│
├── .env.local                          # Environment Variables
├── .env.test
├── next.config.js                      # Next.js Configuration
├── tailwind.config.js                  # Tailwind Configuration
├── tsconfig.json                       # TypeScript Configuration
└── package.json
```

## Key Organizational Principles

### 1. Feature-First Organization

- Group related components, hooks, and utilities by feature
- Keep feature-specific code isolated and cohesive
- Share common code through core and lib directories

### 2. Layer Separation

- Clear separation between domain, application, and infrastructure layers
- Domain logic isolated from framework and infrastructure concerns
- Clean interfaces between layers through ports and adapters

### 3. Component Organization

- Separate reusable UI components from feature-specific components
- Group related components into directories with their tests and styles
- Use barrel files (index.ts) for clean exports

### 4. State Management

- Centralized store configuration
- Feature-based store slices
- Clear separation of concerns in middleware

### 5. Testing Structure

- Mirror src directory structure in tests
- Separate unit, integration, and e2e tests
- Colocate test utilities and mocks

## Import Conventions

```typescript
// Use absolute imports for better maintainability
import { Button } from "@/components/ui/button";
import { useRequirements } from "@/lib/hooks/use-requirements";
import { RequirementService } from "@/core/application/services";
import { Project } from "@/core/domain/models";
```

## Environment Configuration

```typescript
// src/lib/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  FIREBASE_ADMIN_PROJECT_ID: z.string(),
  UPSTASH_REDIS_URL: z.string().url(),
  UPSTASH_REDIS_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);
```

## Module Boundaries

### Domain Module Exports

```typescript
// src/core/domain/index.ts
export * from "./models";
export * from "./events";
export * from "./value-objects";
```

### Feature Module Exports

```typescript
// src/components/features/requirements/index.ts
export * from "./requirement-form";
export * from "./requirement-table";
export * from "./requirement-detail";
```

## Best Practices

1. **Module Structure**

   - Keep modules small and focused
   - Use barrel files for clean exports
   - Maintain clear module boundaries

2. **File Naming**

   - Use kebab-case for files and folders
   - Use PascalCase for React components
   - Use camelCase for utilities and hooks

3. **Code Organization**

   - Group related code together
   - Keep feature code isolated
   - Share common code through core and lib

4. **Testing**

   - Colocate test files with source code
   - Use consistent test naming conventions
   - Organize test utilities and fixtures

5. **State Management**
   - Use feature-based store organization
   - Keep store logic separate from components
   - Implement clear update patterns
