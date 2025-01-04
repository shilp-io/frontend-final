import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UUID, Project as ProjectEntity } from '@/types';

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
  selectProject: (id: UUID) => void;
  deselectProject: (id: UUID) => void;
  clearSelection: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set) => ({
        filters: {
          status: [],
        },
        selectedProjects: [],

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        clearFilters: () => set({ filters: { status: [] } }),

        selectProject: (id) => set((state) => ({
          selectedProjects: [...state.selectedProjects, id]
        })),

        deselectProject: (id) => set((state) => ({
          selectedProjects: state.selectedProjects.filter((projId) => projId !== id)
        })),

        clearSelection: () => set({ selectedProjects: [] })
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