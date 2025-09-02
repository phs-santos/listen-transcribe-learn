import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getApiService } from "@/lib/api/services";
import { User } from "@/types/auth-store";
import { useAppStore } from "./app-store";

interface SignInResponse {
    error: boolean;
    message?: string;
}

interface AuthState {
    loginLoading: boolean;
    user: User | null;

    signIn: (email: string, password: string) => Promise<SignInResponse>;
    clear: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            loginLoading: false,
            user: null,

            signIn: async (
                email: string,
                password: string
            ): Promise<SignInResponse> => {
                try {
                    const { status, data } = await getApiService(
                        "backend_local",
                        "public"
                    ).post("/auth/login", { email, password });
                    const { message, token, user } = data;

                    if (status === 200) {
                        set({
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                token: token,
                            },
                        });

                        useAppStore.getState().setIsAuthenticated(true);

                        return {
                            error: false,
                            message: message || "Login realizado com sucesso",
                        };
                    }

                    return {
                        error: true,
                        message: message || "Resposta inesperada do servidor",
                    };
                } catch (error) {
                    console.error("Error during sign-in:", error);

                    return {
                        error: true,
                        message: "Login falhou",
                    };
                } finally {
                    set({ loginLoading: false });
                }
            },

            clear: () => {
                set({
                    loginLoading: false,
                    user: null,
                });
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);
