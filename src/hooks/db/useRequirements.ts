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
        params.append('user_id', userId);
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
      if (!user?.id) throw new Error('User not authenticated');

      let projectId = data.project_id;

      // If no project_id is provided, create a default project
      if (!projectId) {
        const projectResponse = await fetch('/api/db/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.title || 'New Project',
            description: 'Project created from requirement',
            status: 'active',
            created_by: user.id,
            updated_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            metadata: {
              created_from: 'requirement'
            }
          }),
        });

        if (!projectResponse.ok) {
          throw new Error('Failed to create default project');
        }

        const project = await projectResponse.json();
        projectId = project.id;
      }

      const response = await fetch('/api/db/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          project_id: projectId,
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
      queryClient.invalidateQueries({ queryKey: ['projects'] as const });
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