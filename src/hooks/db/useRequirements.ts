import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequirementStore } from '@/lib/store/requirementStore';
import { useUserStore } from '@/lib/store/userStore';
import type { UUID, Requirement } from '@/types';
import { mapDatabaseEntities, mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseRequirementsOptions {
  skipCache?: boolean;
  cacheTime?: number;
}

// Type for our query key
type RequirementsQueryKey = ['requirements', UUID | undefined, UUID | undefined];

export function useRequirements(projectId?: UUID, userId?: UUID, options: UseRequirementsOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useUserStore();
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
    queryKey: ['requirements', projectId, userId] as RequirementsQueryKey,
    queryFn: async () => {
      let url = '/api/db/requirements';
      const params = new URLSearchParams();
      
      if (projectId) {
        params.append('projectId', projectId);
      }
      if (userId) {
        params.append('created_by', userId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch requirements');
      }
      const data = await response.json();
      return mapDatabaseEntities<'requirements'>(data);
    },
    enabled: !!user,
    ...options
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Omit<Requirement, 'id' | 'created_at'>>) => {
      const response = await fetch('/api/db/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create requirement');
      }
      const result = await response.json();
      return mapDatabaseEntity<'requirements'>(result);
    },
    onSuccess: (newRequirement) => {
      queryClient.setQueryData(['requirements', projectId, userId], (old: Requirement[] = []) => {
        return [...old, newRequirement];
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (requirementId: UUID) => {
      const response = await fetch(`/api/db/requirements/${requirementId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete requirement');
      }
      return requirementId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['requirements', projectId, userId], (old: Requirement[] = []) => {
        return old.filter(req => req.id !== deletedId);
      });
      deselectRequirement(deletedId);
    },
  });

  const createRequirement = useCallback(async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    return await createMutation.mutateAsync(data);
  }, [createMutation]);

  const deleteRequirement = useCallback(async (requirementId: UUID) => {
    await deleteMutation.mutateAsync(requirementId);
  }, [deleteMutation]);

  return {
    requirements,
    isLoading,
    error,
    createRequirement,
    deleteRequirement,
    selectedRequirements,
    selectRequirement,
    deselectRequirement,
    clearSelection
  };
}