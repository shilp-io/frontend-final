import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequirementStore } from '@/lib/store/requirementStore';
import type { UUID, Requirement } from '@/types';
import { mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseRequirementOptions {
    skipCache?: boolean;
    cacheTime?: number;
}

// Type for our query key
type RequirementQueryKey = ['requirement', UUID | undefined];

export function useRequirement(requirementId: UUID, options: UseRequirementOptions = {}) {
    const queryClient = useQueryClient();
    const { 
        selectedRequirements,
        selectRequirement,
        deselectRequirement,
        clearSelection
    } = useRequirementStore();

    // Query for fetching a single requirement
    const {
        data: requirement,
        isLoading,
        error
    } = useQuery({
        queryKey: ['requirement', requirementId] as RequirementQueryKey,
        queryFn: async () => {
            if (!requirementId) return null;
            
            const response = await fetch(`/api/db/requirements?id=${requirementId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch requirement');
            }
            const data = await response.json();
            return mapDatabaseEntity<'requirements'>(data);
        },
        enabled: !!requirementId,
        ...options
    });

    // Update requirement mutation
    const updateRequirementMutation = useMutation({
        mutationFn: async (data: Partial<Omit<Requirement, 'id' | 'created_at' | 'version'>>) => {
            if (!requirement) {
                throw new Error('Requirement not found');
            }

            const response = await fetch('/api/db/requirements', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: requirementId,
                    ...data,
                    updated_at: new Date().toISOString(),
                    version: requirement.version + 1
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update requirement');
            }

            const result = await response.json();
            return mapDatabaseEntity<'requirements'>(result);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requirement', requirementId] as const });
            queryClient.invalidateQueries({ queryKey: ['requirements'] as const });
        },
    });

    // Delete requirement mutation
    const deleteRequirementMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/db/requirements?id=${requirementId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete requirement');
            }
            return requirementId;
        },
        onSuccess: () => {
            clearSelection();
            queryClient.invalidateQueries({ queryKey: ['requirements'] as const });
        },
    });

    // Helper functions with proper error handling
    const updateRequirement = useCallback(async (data: Parameters<typeof updateRequirementMutation.mutateAsync>[0]) => {
        try {
            return await updateRequirementMutation.mutateAsync(data);
        } catch (error) {
            throw error;
        }
    }, [updateRequirementMutation]);

    const deleteRequirement = useCallback(async () => {
        try {
            await deleteRequirementMutation.mutateAsync();
        } catch (error) {
            throw error;
        }
    }, [deleteRequirementMutation]);

    const isSelected = selectedRequirements.includes(requirementId);

    const toggleSelection = useCallback(() => {
        if (isSelected) {
            deselectRequirement(requirementId);
        } else {
            selectRequirement(requirementId);
        }
    }, [requirementId, isSelected, selectRequirement, deselectRequirement]);

    return {
        requirement,
        isLoading,
        error: error as Error | null,
        updateRequirement,
        deleteRequirement,
        isSelected,
        toggleSelection,
        selectRequirement: () => selectRequirement(requirementId),
        deselectRequirement: () => deselectRequirement(requirementId),
    };
}
