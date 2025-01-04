import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ServiceContextUser } from '@/types/auth';
import type { UUID } from '@/types/common';

interface UserState {
  user: ServiceContextUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  selectedUsers: UUID[];

  // Actions
  setUser: (user: ServiceContextUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  selectUser: (id: UUID) => void;
  deselectUser: (id: UUID) => void;
  clearSelection: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        selectedUsers: [],

        setUser: (user) => set({
          user,
          isAuthenticated: !!user
        }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        clearError: () => set({ error: null }),

        selectUser: (id) => set((state) => ({
          selectedUsers: [...state.selectedUsers, id]
        })),

        deselectUser: (id) => set((state) => ({
          selectedUsers: state.selectedUsers.filter((userId) => userId !== id)
        })),

        clearSelection: () => set({ selectedUsers: [] })
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
);
