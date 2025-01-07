import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UUID } from '@/types';

interface RequirementFilters {
  status: string[];
  priority: string[];
  assigned_to?: UUID;
  search?: string;
}

interface RequirementState {
  activeProjectId: UUID | null;
  filters: RequirementFilters;
  selectedRequirements: UUID[];
  
  // Actions
  setActiveProject: (projectId: UUID | null) => void;
  setFilters: (filters: Partial<RequirementFilters>) => void;
  clearFilters: () => void;
  selectRequirement: (id: UUID) => void;
  deselectRequirement: (id: UUID) => void;
  clearSelection: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  activeProjectId: null,
  filters: {
    status: [],
    priority: [],
  },
  selectedRequirements: [],
};

export const useRequirementStore = create<RequirementState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setActiveProject: (projectId) => set({ activeProjectId: projectId }),

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        clearFilters: () => set({ filters: { status: [], priority: [] } }),

        selectRequirement: (id) => set((state) => ({
          selectedRequirements: [...state.selectedRequirements, id]
        })),

        deselectRequirement: (id) => set((state) => ({
          selectedRequirements: state.selectedRequirements.filter((reqId) => reqId !== id)
        })),

        clearSelection: () => set({ selectedRequirements: [] }),
        reset: () => set(initialState)
      }),
      {
        name: 'requirements-store',
        partialize: (state) => ({
          activeProjectId: state.activeProjectId,
          filters: state.filters
        })
      }
    )
  )
); 