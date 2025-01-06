import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UUID, Project as ProjectEntity } from '@/types';
import { useRecentStore } from './recentStore';

type Project = ProjectEntity;

interface ProjectFilters {
  status: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

interface ProjectState {
  filters: ProjectFilters;
  selectedProjects: UUID[];
  
  // Actions
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearFilters: () => void;
  selectProject: (id: UUID, name?: string) => void;
  deselectProject: (id: UUID) => void;
  clearSelection: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  filters: {
    status: [],
  },
  selectedProjects: [],
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        clearFilters: () => set({ filters: { status: [] } }),

        selectProject: (id, name) => {
          // Add to recent items if name is provided
          if (name) {
            useRecentStore.getState().addRecentItem(id, name, 'project');
          }
          // Update selection
          set((state) => ({
            selectedProjects: [...state.selectedProjects, id]
          }));
        },

        deselectProject: (id) => set((state) => ({
          selectedProjects: state.selectedProjects.filter((projId) => projId !== id)
        })),

        clearSelection: () => set({ selectedProjects: [] }),
        reset: () => set(initialState)
      }),
      {
        name: 'projects-store',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    )
  )
); 