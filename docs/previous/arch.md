For large-scale applications, combining context providers with hooks, Zustand, and caching can create a robust state management system. Let me outline an optimized architecture.

```typescript
// src/lib/context/ServiceContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { services } from '@/lib/services';
import type { User } from 'firebase/auth';

interface ServiceContextValue {
  initialized: boolean;
  user: User | null;
  services: typeof services;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        const { success, user } = await services.auth.getCurrentUser();
        if (success && user) {
          setUser(user);
        }
      } finally {
        setInitialized(true);
      }
    };

    initializeServices();
  }, []);

  if (!initialized) {
    return <div>Loading services...</div>;
  }

  return (
    <ServiceContext.Provider value={{ initialized, user, services }}>
      {children}
    </ServiceContext.Provider>
  );
}

// src/lib/store/appStore.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { cacheService } from '@/lib/services/cache';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,
        notifications: true,
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      }),
      { name: 'app-settings' }
    )
  )
);

// src/lib/store/domainStore.ts
interface RequirementState {
  requirements: Record<string, Requirement>;
  activeProjectId: string | null;
  filters: {
    status: string[];
    priority: string[];
  };
  setActiveProject: (projectId: string) => void;
  updateRequirement: (id: string, data: Partial<Requirement>) => void;
  setFilters: (filters: Partial<typeof initialState.filters>) => void;
}

export const useRequirementStore = create<RequirementState>()(
  devtools((set) => ({
    requirements: {},
    activeProjectId: null,
    filters: {
      status: [],
      priority: []
    },
    setActiveProject: (projectId) => set({ activeProjectId: projectId }),
    updateRequirement: (id, data) =>
      set((state) => ({
        requirements: {
          ...state.requirements,
          [id]: { ...state.requirements[id], ...data }
        }
      })),
    setFilters: (filters) =>
      set((state) => ({
        filters: { ...state.filters, ...filters }
      }))
  }))
);

// src/lib/hooks/useRequirements.ts
import { useCallback, useEffect } from 'react';
import { useRequirementStore } from '@/lib/store/domainStore';
import { services } from '@/lib/services';
import { cacheService } from '@/lib/services/cache';

export function useRequirements(projectId: string) {
  const {
    requirements,
    activeProjectId,
    setActiveProject,
    updateRequirement
  } = useRequirementStore();

  const loadRequirements = useCallback(async () => {
    // Check cache first
    const cached = cacheService.get(`requirements:${projectId}`);
    if (cached) {
      updateRequirement(projectId, cached);
      return;
    }

    // Load from database
    const data = await services.database.query('requirements')
      .where('project_id', '=', projectId);

    // Update cache and store
    cacheService.set(`requirements:${projectId}`, data);
    data.forEach(req => updateRequirement(req.id, req));
  }, [projectId, updateRequirement]);

  useEffect(() => {
    if (projectId !== activeProjectId) {
      setActiveProject(projectId);
      loadRequirements();
    }
  }, [projectId, activeProjectId, setActiveProject, loadRequirements]);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = services.database.subscribeToChanges(
      'requirements',
      ({ eventType, new: newData }) => {
        if (newData?.project_id === projectId) {
          updateRequirement(newData.id, newData);
          // Update cache
          const cached = cacheService.get(`requirements:${projectId}`);
          if (cached) {
            const updated = { ...cached };
            if (eventType === 'DELETE') {
              delete updated[newData.id];
            } else {
              updated[newData.id] = newData;
            }
            cacheService.set(`requirements:${projectId}`, updated);
          }
        }
      },
      { filter: `project_id=eq.${projectId}` }
    );

    return () => subscription.unsubscribe();
  }, [projectId, updateRequirement]);

  return {
    requirements: Object.values(requirements).filter(
      req => req.project_id === projectId
    ),
    refresh: loadRequirements
  };
}

// src/pages/_app.tsx
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ServiceProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </ServiceProvider>
  );
}

// Example usage in a component
function RequirementsView({ projectId }: { projectId: string }) {
  const { requirements, refresh } = useRequirements(projectId);
  const filters = useRequirementStore(state => state.filters);
  const { theme } = useAppStore();

  // Filter requirements based on store filters
  const filteredRequirements = requirements.filter(req => {
    if (filters.status.length && !filters.status.includes(req.status)) {
      return false;
    }
    if (filters.priority.length && !filters.priority.includes(req.priority)) {
      return false;
    }
    return true;
  });

  return (
    <div className={theme}>
      {filteredRequirements.map(req => (
        <RequirementCard key={req.id} data={req} />
      ))}
    </div>
  );
}

```

Here's how the different parts work together:

1. **Context Layer (Top Level)**

- Manages service initialization
- Provides access to singleton services
- Handles auth state and user context
- Use for app-wide dependencies and services

2. **Zustand Stores (Domain State)**

- Manages business logic and domain state
- Handles real-time updates
- Stores UI preferences and settings
- Different stores for different domains
- Use for:
  - Complex state updates
  - Cross-component state sharing
  - Persistent state
  - UI state

3. **Cache Layer**

- Handles frequently accessed data
- Reduces database queries
- Improves performance
- Use for:
  - Frequently accessed reference data
  - Data that doesn't change often
  - Expensive computations

4. **Custom Hooks (Component Logic)**

- Combines all layers
- Handles component-specific logic
- Manages subscriptions and cleanup
- Use for:
  - Component-specific state
  - Data fetching logic
  - Event handlers

Best Practices for Large Scale Apps:

1. **State Management Decision Tree**:

```typescript
// Use Context for:
- Service instances
- Global configuration
- Theme/localization
- User authentication

// Use Zustand for:
- Domain-specific state
- Complex state updates
- Cross-component communication
- Persistent settings

// Use Cache for:
- API responses
- Lookup tables
- Computed values
- Static assets

// Use Local State for:
- Form state
- UI animations
- Component-specific state
- Temporary data
```

2. **Performance Optimizations**:

```typescript
// Implement selective updates
const requirement = useRequirementStore(
  useCallback((state) => state.requirements[id], [id]),
);

// Use middleware for debugging
const useDomainStore = create<DomainState>()(
  devtools(
    persist(
      (set) => ({
        // store implementation
      }),
      { name: "domain-store" },
    ),
  ),
);
```

3. **Error Boundaries and Recovery**:

```typescript
const ErrorBoundary = ({ children }) => {
  const refresh = useRequirementStore(state => state.refresh);

  return (
    <Boundary
      fallback={({ error, reset }) => (
        <ErrorView
          error={error}
          onRetry={() => {
            refresh();
            reset();
          }}
        />
      )}
    >
      {children}
    </Boundary>
  );
};
```
