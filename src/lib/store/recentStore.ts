import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UUID } from '@/types';

interface RecentItem {
  id: UUID;
  name: string;
  accessedAt: string;
  type: 'project' | 'requirement' | 'collection' | 'document';
}

interface RecentItemView {
  id: UUID;
  name: string;
}

interface RecentState {
  recentItems: RecentItem[];
  maxItems: number;

  // Actions
  addRecentItem: (id: UUID, name: string, type: RecentItem['type']) => void;
  clearRecentItems: () => void;
  getRecentItemsByType: (type: RecentItem['type'], limit?: number) => RecentItemView[];
}

export const useRecentStore = create<RecentState>()(
  devtools(
    persist(
      (set, get) => ({
        recentItems: [],
        maxItems: 50, // Store up to 50 items total

        addRecentItem: (id, name, type) => set((state) => {
          const now = new Date().toISOString();
          const existingIndex = state.recentItems.findIndex(
            item => item.id === id && item.type === type
          );

          let newItems = [...state.recentItems];
          
          // Remove existing entry if found
          if (existingIndex !== -1) {
            newItems.splice(existingIndex, 1);
          }

          // Add new entry at the beginning
          newItems.unshift({ id, name, type, accessedAt: now });

          // Trim to maxItems
          if (newItems.length > state.maxItems) {
            newItems = newItems.slice(0, state.maxItems);
          }

          return { recentItems: newItems };
        }),

        clearRecentItems: () => set({ recentItems: [] }),

        getRecentItemsByType: (type, limit = 10) => {
          const items = get().recentItems
            .filter(item => item.type === type)
            .slice(0, limit);
          return items.map(item => ({ id: item.id, name: item.name }));
        },
      }),
      {
        name: 'recent-items-store',
        partialize: (state) => ({
          recentItems: state.recentItems,
          maxItems: state.maxItems
        })
      }
    )
  )
); 