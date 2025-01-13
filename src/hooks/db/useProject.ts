import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/lib/store/userStore';
import { useProjectStore } from '@/lib/store/projectStore';
import type { UUID, Project } from '@/types';
import { mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseProjectOptions {
    skipCache?: boolean;
    cacheTime?: number;
}

// Type for our query key
type ProjectQueryKey = ['project', UUID | undefined];

export function useProject(projectId: UUID, options: UseProjectOptions = {}) {
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const { selectedProjects, selectProject, deselectProject, clearSelection } =
        useProjectStore();

    // Query for fetching a single project
    const {
        data: project,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['project', projectId] as ProjectQueryKey,
        queryFn: async () => {
            if (!projectId) return null;

            const response = await fetch(`/api/db/projects?id=${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch project');
            }
            const data = await response.json();
            return mapDatabaseEntity<'projects'>(data);
        },
        enabled: !!projectId,
        ...options,
    });

    // Update project mutation
    const updateProjectMutation = useMutation({
        mutationFn: async (
            data: Partial<Omit<Project, 'id' | 'created_at' | 'version'>>,
        ) => {
            if (!project) {
                throw new Error('Project not found');
            }
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('/api/db/projects', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: projectId,
                    ...data,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                    version: project.version + 1,
                    metadata: {
                        ...(typeof project.metadata === 'object'
                            ? project.metadata || {}
                            : {}),
                        last_modified_from: 'web_app',
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const result = await response.json();
            return mapDatabaseEntity<'projects'>(result);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['project', projectId] as const,
            });
            queryClient.invalidateQueries({ queryKey: ['projects'] as const });
        },
    });

    // Delete project mutation
    const deleteProjectMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/db/projects?id=${projectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            return projectId;
        },
        onSuccess: () => {
            clearSelection();
            queryClient.invalidateQueries({ queryKey: ['projects'] as const });
        },
    });

    // Helper functions with proper error handling
    const updateProject = useCallback(
        async (
            data: Parameters<typeof updateProjectMutation.mutateAsync>[0],
        ) => {
            try {
                return await updateProjectMutation.mutateAsync(data);
            } catch (error) {
                throw error;
            }
        },
        [updateProjectMutation],
    );

    const deleteProject = useCallback(async () => {
        try {
            await deleteProjectMutation.mutateAsync();
        } catch (error) {
            throw error;
        }
    }, [deleteProjectMutation]);

    const isSelected = selectedProjects.includes(projectId);

    const toggleSelection = useCallback(() => {
        if (isSelected) {
            deselectProject(projectId);
        } else {
            selectProject(projectId);
        }
    }, [projectId, isSelected, selectProject, deselectProject]);

    return {
        project,
        isLoading,
        error: error as Error | null,
        updateProject,
        deleteProject,
        isSelected,
        toggleSelection,
        selectProject: () => selectProject(projectId),
        deselectProject: () => deselectProject(projectId),
    };
}
