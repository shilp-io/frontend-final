import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: boolean;
    isLoading: boolean;
    loadingText: string | null;
    error: string | null;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSidebar: () => void;
    toggleNotifications: () => void;
    setLoading: (isLoading: boolean, text?: string | null) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set) => ({
                theme: 'light',
                sidebarOpen: true,
                notifications: true,
                isLoading: false,
                loadingText: null,
                error: null,
                setTheme: (theme) => set({ theme }),
                toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
                toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
                setLoading: (isLoading, text = null) => set({ isLoading, loadingText: text }),
                setError: (error) => set({ error }),
                clearError: () => set({ error: null })
            }),
            {
                name: 'app-settings',
                partialize: (state) => ({
                    theme: state.theme,
                    sidebarOpen: state.sidebarOpen,
                    notifications: state.notifications
                })
            }
        )
    )
); 