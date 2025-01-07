import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCollectionStore } from '@/lib/store/collectionStore';
import { useUserStore } from '@/lib/store/userStore';
import type { UUID, Collection } from '@/types';
import { mapDatabaseEntities, mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseCollectionsOptions {
    skipCache?: boolean;
    cacheTime?: number;
    parentId?: UUID | null;
}

// Type for our query key
type CollectionsQueryKey = ['collections', UUID | undefined];

export function useCollections(parentId?: UUID, options: UseCollectionsOptions = {}) {
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const {
        selectedCollections,
        selectCollection,
        deselectCollection,
        clearSelection
    } = useCollectionStore();

    // Query for fetching collections
    const {
        data: collections = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['collections', parentId] as CollectionsQueryKey,
        queryFn: async () => {
            let url = '/api/db/collections';
            const params = new URLSearchParams();
            
            if (parentId) {
                params.append('parentId', parentId);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch collections');
            }
            const data = await response.json();
            return mapDatabaseEntities<'collections'>(data);
        },
        enabled: !!user,
        ...options
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Omit<Collection, 'id' | 'created_at'>>) => {
            if (!user?.id) throw new Error('User not authenticated');

            const response = await fetch('/api/db/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: 1
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create collection');
            }

            const result = await response.json();
            return mapDatabaseEntity<'collections'>(result);
        },
        onSuccess: (newCollection) => {
            queryClient.setQueryData(['collections', parentId], (old: Collection[] = []) => {
                return [...old, newCollection];
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (collectionId: UUID) => {
            const response = await fetch(`/api/db/collections?id=${collectionId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }
            return collectionId;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData(['collections', parentId], (old: Collection[] = []) => {
                return old.filter(col => col.id !== deletedId);
            });
            deselectCollection(deletedId);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (collection: Collection) => {
            const response = await fetch(`/api/db/collections`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...collection,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update collection');
            }
            const result = await response.json();
            return mapDatabaseEntity<'collections'>(result);
        },
        onSuccess: (updatedCollection) => {
            queryClient.setQueryData(['collections', parentId], (old: Collection[] = []) => {
                return old.map(col => 
                    col.id === updatedCollection?.id ? updatedCollection : col
                );
            });
        },
    });

    const createCollection = useCallback(async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
        return await createMutation.mutateAsync(data);
    }, [createMutation]);

    const deleteCollection = useCallback(async (collectionId: UUID) => {
        await deleteMutation.mutateAsync(collectionId);
    }, [deleteMutation]);

    const updateCollection = useCallback(async (collection: Collection) => {
        return await updateMutation.mutateAsync(collection);
    }, [updateMutation]);

    return {
        collections,
        isLoading,
        error,
        createCollection,
        deleteCollection,
        updateCollection,
        selectedCollections,
        selectCollection,
        deselectCollection,
        clearSelection
    };
}