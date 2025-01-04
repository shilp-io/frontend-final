import { useCallback, useEffect } from 'react';
import { useCollectionStore } from '@/lib/store/collectionStore';
import type { UUID, Collection } from '@/types';
import { mapDatabaseEntities, mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseCollectionsOptions {
    skipCache?: boolean;
    cacheTime?: number;
    parentId?: UUID | null;
}

export function useCollections(options: UseCollectionsOptions = {}) {
    const {
        collections,
        setCollections,
        updateCollection: updateCollectionInStore,
        deleteCollection: deleteCollectionFromStore,
        getFilteredCollections,
        getChildCollections,
        getRootCollections,
        setLoading,
        setError,
        ...storeActions
    } = useCollectionStore();

    // Load collections
    useEffect(() => {
        const loadCollections = async () => {
            setLoading(true);
            try {
                const url = options.parentId !== undefined
                    ? `/api/db/collections?parentId=${options.parentId}`
                    : '/api/db/collections';

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch collections');
                }
                const data = await response.json();
                setCollections(mapDatabaseEntities<'collections'>(data));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load collections');
            } finally {
                setLoading(false);
            }
        };

        loadCollections();

        // Set up EventSource for real-time updates
        const eventSource = new EventSource(`/api/db/collections/subscribe${options.parentId ? `?parentId=${options.parentId}` : ''}`);

        eventSource.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            const newData = payload.new;
            const oldData = payload.old;

            if (payload.eventType === 'DELETE' && oldData) {
                deleteCollectionFromStore(oldData.id);
            } else if (newData) {
                // Only update if it matches our parent_id filter
                if (options.parentId === undefined || newData.parent_id === options.parentId) {
                    const mappedData = mapDatabaseEntity<'collections'>(newData);
                    if (mappedData) {
                        updateCollectionInStore(mappedData.id, mappedData);
                    }
                }
            }
        };

        return () => {
            eventSource.close();
        };
    }, [options.parentId, setCollections, setLoading, setError]);

    // Create collection
    const createCollection = useCallback(async (data: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
        setLoading(true);
        try {
            const response = await fetch('/api/db/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: 1
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create collection');
            }

            const result = await response.json();
            const mappedResult = mapDatabaseEntity<'collections'>(result);
            if (mappedResult) {
                updateCollectionInStore(mappedResult.id, mappedResult);
            }
            return mappedResult;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [updateCollectionInStore, setLoading, setError]);

    // Update collection
    const updateCollection = useCallback(async (id: UUID, data: Partial<Collection>) => {
        setLoading(true);
        try {
            const currentCollection = collections[id];
            if (!currentCollection) {
                throw new Error('Collection not found');
            }

            const response = await fetch('/api/db/collections', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    ...data,
                    updated_at: new Date().toISOString(),
                    version: currentCollection.version + 1
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update collection');
            }

            const result = await response.json();
            const mappedResult = mapDatabaseEntity<'collections'>(result);
            if (mappedResult) {
                updateCollectionInStore(id, mappedResult);
            }
            return mappedResult;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [collections, updateCollectionInStore, setLoading, setError]);

    // Delete collection
    const deleteCollection = useCallback(async (id: UUID) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/db/collections?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }

            deleteCollectionFromStore(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete collection');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [deleteCollectionFromStore, setLoading, setError]);

    return {
        collections: getFilteredCollections(),
        childCollections: options.parentId !== undefined ? getChildCollections(options.parentId!) : [],
        rootCollections: getRootCollections(),
        createCollection,
        updateCollection,
        deleteCollection,
        ...storeActions
    };
}