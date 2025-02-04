import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AppState {
  theme: "light" | "dark";
  viewMode: "normal" | "ascii" | "compact";
  layoutViewMode: "standard" | "wide";
  sidebarOpen: boolean;
  notifications: boolean;
  isLoading: boolean;
  loadingText: string | null;
  error: string | null;
  setTheme: (theme: "light" | "dark") => void;
  setViewMode: (mode: "normal" | "ascii" | "compact") => void;
  setLayoutViewMode: (mode: "standard" | "wide") => void;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
  setLoading: (isLoading: boolean, text?: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  theme: "light",
  viewMode: "normal",
  layoutViewMode: "standard",
  sidebarOpen: true,
  notifications: true,
  isLoading: false,
  loadingText: null,
  error: null,
} as const;

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setTheme: (theme) => set({ theme }),
        setViewMode: (viewMode) => set({ viewMode }),
        setLayoutViewMode: (layoutViewMode) => set({ layoutViewMode }),
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleNotifications: () =>
          set((state) => ({ notifications: !state.notifications })),
        setLoading: (isLoading, text = null) =>
          set({ isLoading, loadingText: text }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        reset: () => set(initialState),
      }),
      {
        name: "app-settings",
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          notifications: state.notifications,
          viewMode: state.viewMode,
          layoutViewMode: state.layoutViewMode,
        }),
      },
    ),
  ),
);
