import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequirementStore } from '@/lib/store/requirementStore';
import type { UUID, Requirement } from '@/types';
import { mapDatabaseEntities, mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseRequirementsOptions {
  skipCache?: boolean;
  cacheTime?: number;
}

// Type for our query key
type RequirementsQueryKey = ['requirements', UUID | undefined];

export function useRequirements(projectId: UUID, options: UseRequirementsOptions = {}) {
  const queryClient = useQueryClient();
  const {
    filters,
    selectedRequirements,
    setFilters,
    selectRequirement,
    deselectRequirement,
    clearSelection
  } = useRequirementStore();

  // Query for fetching requirements
  const {
    data: requirements = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['requirements', projectId] as RequirementsQueryKey,
    queryFn: async () => {
      if (!projectId) return [];
      
      const response = await fetch(`/api/db/requirements?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }
      const data = await response.json();
      const mappedData = mapDatabaseEntities<'requirements'>(data);

      // If no requirements exist, create a default one
      if (mappedData.length === 0) {
        const defaultRequirement = await createRequirementMutation.mutateAsync({
          title: 'New Requirement',
          description: 'Welcome to Atoms',
          status: 'approved',
          priority: 'low',
          assigned_to: null,
          project_id: projectId,
          parent_id: null,
          acceptance_criteria: null,
          reviewer: null,
          tags: null,
          original_req: null,
          current_req: null,
          history_req: null
        });
        return defaultRequirement ? [defaultRequirement] : [];
      }
      return mappedData;
    },
    enabled: !!projectId,
    ...options
  });

  // Create requirement mutation
  const createRequirementMutation = useMutation({
    mutationFn: async (data: Omit<Requirement, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by' | 'metadata'>) => {
      const response = await fetch('/api/db/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          current_req: null,
          history_req: null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create requirement');
      }

      const result = await response.json();
      return mapDatabaseEntity<'requirements'>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] as const });
    },
  });

  // Helper functions with proper error handling
  const createRequirement = useCallback(async (data: Parameters<typeof createRequirementMutation.mutateAsync>[0]) => {
    try {
      return await createRequirementMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [createRequirementMutation]);

  // Set up EventSource for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/db/requirements?projectId=${projectId}&subscribe=true`);

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const newData = payload.new;
      const oldData = payload.old;

      if (newData?.project_id === projectId) {
        queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
        if (payload.eventType === 'DELETE' && oldData) {
          queryClient.removeQueries({ queryKey: ['requirement', oldData.id] });
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, queryClient]);

  // Filter requirements based on the store's filters
  const filteredRequirements = requirements.filter(requirement => {
    if (filters.status.length > 0 && !filters.status.includes(requirement.status)) {
      return false;
    }
    if (filters.priority.length > 0 && !filters.priority.includes(requirement.priority)) {
      return false;
    }
    if (filters.assigned_to && requirement.assigned_to !== filters.assigned_to) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        requirement.title.toLowerCase().includes(searchLower) ||
        requirement.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return {
    requirements: filteredRequirements,
    isLoading,
    error: error as Error | null,
    createRequirement,
    filters,
    setFilters,
    selectedRequirements,
    selectRequirement,
    deselectRequirement,
    clearSelection
  };
}