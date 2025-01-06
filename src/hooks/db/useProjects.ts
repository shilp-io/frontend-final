import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProjectStore } from '@/lib/store/projectStore';
import { useUserStore } from '@/lib/store/userStore';
import type { UUID, Project } from '@/types';
import { mapDatabaseEntities, mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseProjectsOptions {
    skipCache?: boolean;
    cacheTime?: number;
}

// Type for our query key
type ProjectsQueryKey = ['projects', UUID | undefined];

export function useProjects(options: UseProjectsOptions = {}) {
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const {
        filters,
        selectedProjects,
        setFilters,
        selectProject,
        deselectProject,
        clearSelection
    } = useProjectStore();

    // Query for fetching projects
    const {
        data: projects = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['projects', user?.id] as ProjectsQueryKey,
        queryFn: async () => {
            if (!user?.id) return [];
            
            const response = await fetch(`/api/db/projects?user_id=${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            const mappedData = mapDatabaseEntities<'projects'>(data);
            
            // If no projects exist, create a default one
            if (mappedData.length === 0) {
                const defaultProject = await createProjectMutation.mutateAsync({
                    name: 'Getting Started',
                    description: 'Welcome to your first project! This is where you can organize and track your work.\n\nTips:\n- Add requirements to track features and tasks\n- Invite team members to collaborate\n- Use tags to categorize work\n- Set start and target dates\n- Monitor project status',
                    status: 'active',
                    start_date: new Date().toISOString(),
                    target_end_date: null,
                    actual_end_date: null,
                    tags: ['getting-started'],
                    metadata: {
                        source: 'template',
                        template_version: '1.0'
                    }
                });
                return defaultProject ? [defaultProject] : [];
            }
            
            return mappedData;
        },
        enabled: !!user?.id,
        ...options
    });

    // Create project mutation
    const createProjectMutation = useMutation({
        mutationFn: async (data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'version' | 'created_by' | 'updated_by'>) => {
            if (!user?.id) throw new Error('User not authenticated');
            
            const response = await fetch('/api/db/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    created_by: user.id,
                    updated_by: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: 1,
                    metadata: {
                        ...(typeof data.metadata === 'object' ? data.metadata || {} : {}),
                        created_from: 'web_app'
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            const result = await response.json();
            return mapDatabaseEntity<'projects'>(result);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] as const });
        },
    });

    // Update project mutation
    const updateProjectMutation = useMutation({
        mutationFn: async ({ id, data }: { id: UUID, data: Partial<Omit<Project, 'id' | 'created_at' | 'version'>> }) => {
            if (!user?.id) throw new Error('User not authenticated');
            
            const currentProject = projects.find(p => p.id === id);
            if (!currentProject) {
                throw new Error('Project not found');
            }

            const response = await fetch('/api/db/projects', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...data,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                    version: currentProject.version + 1
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const result = await response.json();
            return mapDatabaseEntity<'projects'>(result);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] as const });
        },
    });

    // Delete project mutation
    const deleteProjectMutation = useMutation({
        mutationFn: async (id: UUID) => {
            if (!user?.id) throw new Error('User not authenticated');
            
            // First get all requirements for this project
            const getReqResponse = await fetch(`/api/db/requirements?projectId=${id}`);
            if (!getReqResponse.ok) {
                throw new Error('Failed to fetch project requirements');
            }
            const requirements = await getReqResponse.json();
            const mappedRequirements = mapDatabaseEntities<'requirements'>(requirements);

            // Delete each requirement
            for (const req of mappedRequirements) {
                const reqResponse = await fetch(`/api/db/requirements/${req.id}`, {
                    method: 'DELETE',
                });
                if (!reqResponse.ok) {
                    throw new Error('Failed to delete requirement');
                }
            }

            // Then delete the project
            const response = await fetch(`/api/db/projects?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            return id;
        },
        onSuccess: (deletedId) => {
            // Invalidate both projects and requirements queries
            queryClient.invalidateQueries({ queryKey: ['projects'] as const });
            queryClient.invalidateQueries({ queryKey: ['requirements', deletedId] as const });
        },
    });

    // Helper functions with proper error handling
    const createProject = useCallback(async (data: Parameters<typeof createProjectMutation.mutateAsync>[0]) => {
        try {
            return await createProjectMutation.mutateAsync(data);
        } catch (error) {
            throw error;
        }
    }, [createProjectMutation]);

    const updateProject = useCallback(async (id: UUID, data: Parameters<typeof updateProjectMutation.mutateAsync>[0]['data']) => {
        try {
            return await updateProjectMutation.mutateAsync({ id, data });
        } catch (error) {
            throw error;
        }
    }, [updateProjectMutation]);

    const deleteProject = useCallback(async (id: UUID) => {
        try {
            await deleteProjectMutation.mutateAsync(id);
        } catch (error) {
            throw error;
        }
    }, [deleteProjectMutation]);

    // Filter projects based on the store's filters
    const filteredProjects = projects.filter(project => {
        if (filters.status.length > 0 && !filters.status.includes(project.status)) {
            return false;
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                project.name.toLowerCase().includes(searchLower) ||
                (project.description?.toLowerCase().includes(searchLower))
            );
        }
        return true;
    });

    return {
        projects: filteredProjects,
        isLoading,
        error: error as Error | null,
        createProject,
        updateProject,
        deleteProject,
        filters,
        selectedProjects,
        setFilters,
        selectProject,
        deselectProject,
        clearSelection
    };
}