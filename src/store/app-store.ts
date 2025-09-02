import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AppState {
    // state:
    isAuthenticated: boolean;

    // setters:
    setIsAuthenticated: (isAuthenticated: boolean) => void;

    // actions:
    clear: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // state:
            isAuthenticated: false,

            // setters:
            setIsAuthenticated: (isAuthenticated: boolean) => {
                set({ isAuthenticated });
            },

            // actions:
            clear: () => {
                set({
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: "app-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
