import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/lib/store/userStore';
import { useDocumentStore } from '@/lib/store/documentStore';
import type { UUID, ExternalDoc } from '@/types';
import { mapDatabaseEntity } from '@/lib/utils/typeUtils';

interface UseDocumentOptions {
    skipCache?: boolean;
    cacheTime?: number;
}

// Type for our query key
type DocumentQueryKey = ['document', UUID | undefined];

export function useDocument(
    documentId: UUID,
    options: UseDocumentOptions = {},
) {
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const {
        selectedDocuments,
        selectDocument,
        deselectDocument,
        clearSelection,
    } = useDocumentStore();

    // Query for fetching a single document
    const {
        data: document,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['document', documentId] as DocumentQueryKey,
        queryFn: async () => {
            if (!documentId) return null;

            const response = await fetch(`/api/db/documents?id=${documentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch document');
            }
            const data = await response.json();
            return mapDatabaseEntity<'external_docs'>(data);
        },
        enabled: !!documentId,
        ...options,
    });

    // Update document mutation
    const updateDocumentMutation = useMutation({
        mutationFn: async (
            data: Partial<Omit<ExternalDoc, 'id' | 'created_at' | 'version'>>,
        ) => {
            if (!document) {
                throw new Error('Document not found');
            }
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('/api/db/documents', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: documentId,
                    ...data,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                    version: document.version + 1,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update document');
            }

            const result = await response.json();
            return mapDatabaseEntity<'external_docs'>(result);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['document', documentId] as const,
            });
            queryClient.invalidateQueries({ queryKey: ['documents'] as const });
        },
    });

    // Delete document mutation
    const deleteDocumentMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/db/documents?id=${documentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }
            return documentId;
        },
        onSuccess: () => {
            clearSelection();
            queryClient.invalidateQueries({ queryKey: ['documents'] as const });
        },
    });

    // Helper functions with proper error handling
    const updateDocument = useCallback(
        async (
            data: Parameters<typeof updateDocumentMutation.mutateAsync>[0],
        ) => {
            try {
                return await updateDocumentMutation.mutateAsync(data);
            } catch (error) {
                throw error;
            }
        },
        [updateDocumentMutation],
    );

    const deleteDocument = useCallback(async () => {
        try {
            await deleteDocumentMutation.mutateAsync();
        } catch (error) {
            throw error;
        }
    }, [deleteDocumentMutation]);

    const isSelected = selectedDocuments.includes(documentId);

    const toggleSelection = useCallback(() => {
        if (isSelected) {
            deselectDocument(documentId);
        } else {
            selectDocument(documentId);
        }
    }, [documentId, isSelected, selectDocument, deselectDocument]);

    return {
        document,
        isLoading,
        error: error as Error | null,
        updateDocument,
        deleteDocument,
        isSelected,
        toggleSelection,
        selectDocument: () => selectDocument(documentId),
        deselectDocument: () => deselectDocument(documentId),
    };
}
