import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDocumentStore } from "@/lib/store/documentStore";
import { useUserStore } from "@/lib/store/userStore";
import type { UUID } from "@/types";
import type { Tables } from "@/types/supabase";

type ExternalDoc = Tables<"external_docs">;

interface UseDocumentsOptions {
  skipCache?: boolean;
  cacheTime?: number;
  type?: ExternalDoc["type"];
}

// Type for our query key
type DocumentsQueryKey = ["documents", UUID | undefined, string | undefined];

export function useDocuments(
  collectionId?: UUID,
  options: UseDocumentsOptions = {},
) {
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  const {
    selectedDocuments,
    selectDocument,
    deselectDocument,
    clearSelection,
  } = useDocumentStore();

  // Query for fetching documents
  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documents", collectionId, options.type] as DocumentsQueryKey,
    queryFn: async () => {
      let url = "/api/db/documents";
      const params = new URLSearchParams();

      if (collectionId) {
        params.append("collectionId", collectionId);
      }
      if (options.type) {
        params.append("type", options.type);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      return data as ExternalDoc[];
    },
    enabled: !!user,
    ...options,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (
      data: Partial<Omit<ExternalDoc, "id" | "created_at">>,
    ) => {
      if (!user?.id) throw new Error("User not authenticated");

      const response = await fetch("/api/db/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          status: data.status || "active",
          last_verified_date:
            data.last_verified_date || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const result = await response.json();
      return result as ExternalDoc;
    },
    onSuccess: (newDocument) => {
      queryClient.setQueryData(
        ["documents", collectionId, options.type],
        (old: ExternalDoc[] = []) => {
          return [...old, newDocument];
        },
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: UUID) => {
      const response = await fetch(`/api/db/documents?id=${documentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      return documentId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        ["documents", collectionId, options.type],
        (old: ExternalDoc[] = []) => {
          return old.filter((doc) => doc.id !== deletedId);
        },
      );
      deselectDocument(deletedId);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (document: ExternalDoc) => {
      const response = await fetch(`/api/db/documents`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...document,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update document");
      }
      const result = await response.json();
      return result as ExternalDoc;
    },
    onSuccess: (updatedDocument) => {
      queryClient.setQueryData(
        ["documents", collectionId, options.type],
        (old: ExternalDoc[] = []) => {
          return old.map((doc) =>
            doc.id === updatedDocument?.id ? updatedDocument : doc,
          );
        },
      );
    },
  });

  const createDocument = useCallback(
    async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
      return await createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const deleteDocument = useCallback(
    async (documentId: UUID) => {
      await deleteMutation.mutateAsync(documentId);
    },
    [deleteMutation],
  );

  const updateDocument = useCallback(
    async (document: ExternalDoc) => {
      return await updateMutation.mutateAsync(document);
    },
    [updateMutation],
  );

  return {
    documents,
    isLoading,
    error,
    createDocument,
    deleteDocument,
    updateDocument,
    selectedDocuments,
    selectDocument,
    deselectDocument,
    clearSelection,
  };
}
