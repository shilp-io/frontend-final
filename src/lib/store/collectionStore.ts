import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UUID } from '@/types';

interface Collection {
  id: UUID;
  name: string;
  description: string | null;
  parent_id: UUID | null;
  access_level: 'private' | 'project' | 'organization' | 'public';
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  version: number;
}

interface CollectionFilters {
  access_level: string[];
  parent_id?: UUID | null;
  search?: string;
  tags?: string[];
}

interface CollectionState {
  filters: CollectionFilters;
  selectedCollections: UUID[];
  
  // Actions
  setFilters: (filters: Partial<CollectionFilters>) => void;
  clearFilters: () => void;
  selectCollection: (id: UUID) => void;
  deselectCollection: (id: UUID) => void;
  clearSelection: () => void;
}

export const useCollectionStore = create<CollectionState>()(
  devtools(
    persist(
      (set) => ({
        filters: {
          access_level: [],
        },
        selectedCollections: [],

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        clearFilters: () => set({ filters: { access_level: [] } }),

        selectCollection: (id) => set((state) => ({
          selectedCollections: [...state.selectedCollections, id]
        })),

        deselectCollection: (id) => set((state) => ({
          selectedCollections: state.selectedCollections.filter((collId) => collId !== id)
        })),

        clearSelection: () => set({ selectedCollections: [] })
      }),
      {
        name: 'collections-store',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    )
  )
); 