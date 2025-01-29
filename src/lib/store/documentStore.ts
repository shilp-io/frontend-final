import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { UUID } from "@/types";

interface DocumentFilters {
  type: string[];
  status?: string[];
  collection_id?: UUID;
  search?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

interface DocumentState {
  filters: DocumentFilters;
  selectedDocuments: UUID[];
  activeCollectionId: UUID | null;

  // Actions
  setActiveCollection: (collectionId: UUID | null) => void;
  setFilters: (filters: Partial<DocumentFilters>) => void;
  clearFilters: () => void;
  selectDocument: (id: UUID) => void;
  deselectDocument: (id: UUID) => void;
  clearSelection: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  filters: {
    type: [],
    status: [],
  },
  selectedDocuments: [],
  activeCollectionId: null,
};

export const useDocumentStore = create<DocumentState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setActiveCollection: (collectionId) =>
          set({ activeCollectionId: collectionId }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        clearFilters: () => set({ filters: { type: [], status: [] } }),

        selectDocument: (id) =>
          set((state) => ({
            selectedDocuments: [...state.selectedDocuments, id],
          })),

        deselectDocument: (id) =>
          set((state) => ({
            selectedDocuments: state.selectedDocuments.filter(
              (docId) => docId !== id,
            ),
          })),

        clearSelection: () => set({ selectedDocuments: [] }),
        reset: () => set(initialState),
      }),
      {
        name: "documents-store",
        partialize: (state) => ({
          activeCollectionId: state.activeCollectionId,
          filters: state.filters,
        }),
      },
    ),
  ),
);
