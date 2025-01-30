import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/lib/store/userStore";
import { useCollectionStore } from "@/lib/store/collectionStore";
import type { UUID, Collection } from "@/types";
import { mapDatabaseEntity } from "@/lib/utils/typeUtils";

interface UseCollectionOptions {
  skipCache?: boolean;
  cacheTime?: number;
}

// Type for our query key
type CollectionQueryKey = ["collection", UUID | undefined];

export function useCollection(
  collectionId: UUID,
  options: UseCollectionOptions = {},
) {
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const {
    selectedCollections,
    selectCollection,
    deselectCollection,
    clearSelection,
  } = useCollectionStore();

  // Query for fetching a single collection
  const {
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["collection", collectionId] as CollectionQueryKey,
    queryFn: async () => {
      if (!collectionId) return null;

      const response = await fetch(`/api/db/collections?id=${collectionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch collection");
      }
      const data = await response.json();
      return mapDatabaseEntity<"collections">(data);
    },
    enabled: !!collectionId,
    ...options,
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async (
      data: Partial<Omit<Collection, "id" | "created_at" | "version">>,
    ) => {
      if (!collection) {
        throw new Error("Collection not found");
      }
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/db/collections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: collectionId,
          ...data,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
          version: collection.version + 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update collection");
      }

      const result = await response.json();
      return mapDatabaseEntity<"collections">(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection", collectionId] as const,
      });
      queryClient.invalidateQueries({ queryKey: ["collections"] as const });
    },
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/db/collections?id=${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete collection");
      }
      return collectionId;
    },
    onSuccess: () => {
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["collections"] as const });
    },
  });

  // Helper functions with proper error handling
  const updateCollection = useCallback(
    async (
      data: Parameters<typeof updateCollectionMutation.mutateAsync>[0],
    ) => {
      try {
        return await updateCollectionMutation.mutateAsync(data);
      } catch (error) {
        throw error;
      }
    },
    [updateCollectionMutation],
  );

  const deleteCollection = useCallback(async () => {
    try {
      await deleteCollectionMutation.mutateAsync();
    } catch (error) {
      throw error;
    }
  }, [deleteCollectionMutation]);

  const isSelected = selectedCollections.includes(collectionId);

  const toggleSelection = useCallback(() => {
    if (isSelected) {
      deselectCollection(collectionId);
    } else {
      selectCollection(collectionId);
    }
  }, [collectionId, isSelected, selectCollection, deselectCollection]);

  return {
    collection,
    isLoading,
    error: error as Error | null,
    updateCollection,
    deleteCollection,
    isSelected,
    toggleSelection,
    selectCollection: () => selectCollection(collectionId),
    deselectCollection: () => deselectCollection(collectionId),
  };
}
