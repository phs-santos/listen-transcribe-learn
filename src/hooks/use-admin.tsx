import { getApiService } from "@/lib/api/services";
import { User } from "@/types/auth-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UserCreateInput = {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
};

export type UserUpdateInput = Partial<Omit<UserCreateInput, "password">> & {
    password?: string;
};

type State = {
    users: User[];
    loading: boolean;
    error: string | null;
    search: string; // opcional: envia pro backend como ?search=
};

export function useAdmin(initialSearch = "") {
    const [state, setState] = useState<State>({
        users: [],
        loading: false,
        error: null,
        search: initialSearch,
    });

    // cancelar requisições em voo
    const abortRef = useRef<AbortController | null>(null);

    const api = useMemo(
        () => getApiService("backend_local", "private_token"),
        []
    );

    const setSearch = useCallback((s: string) => {
        setState((st) => ({ ...st, search: s }));
    }, []);

    const listUsers = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        try {
            setState((s) => ({ ...s, loading: true, error: null }));
            const { data } = await api.get<User[]>("/users", {
                params: state.search ? { search: state.search } : undefined,
                signal: ac.signal,
            });
            setState((s) => ({ ...s, users: data, loading: false }));
        } catch (err: any) {
            if (err?.name === "CanceledError" || err?.name === "AbortError")
                return;
            setState((s) => ({
                ...s,
                loading: false,
                error:
                    err?.response?.data?.error ||
                    err?.message ||
                    "Falha ao listar usuários",
            }));
        } finally {
            abortRef.current = null;
        }
    }, [api, state.search]);

    useEffect(() => {
        listUsers().catch(() => {});
    }, [listUsers]);

    const refresh = useCallback(() => listUsers(), [listUsers]);

    const createUser = useCallback(
        async (input: UserCreateInput) => {
            try {
                setState((s) => ({ ...s, error: null }));
                const { data } = await api.post<User>("/users", input);
                // Sempre recarrega a lista completa após criar um novo recurso
                await listUsers();
                return data;
            } catch (err: any) {
                const msg =
                    err?.response?.data?.error ||
                    err?.message ||
                    "Falha ao criar usuário";
                setState((s) => ({ ...s, error: msg }));
                throw new Error(msg);
            }
        },
        [api, listUsers]
    );

    const updateUser = useCallback(
        async (id: number, input: UserUpdateInput) => {
            try {
                await api.put<User>(`/users/${id}`, input);
                // Sempre recarrega a lista completa após atualizar um recurso
                await listUsers();
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error:
                        err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao atualizar usuário",
                }));
                throw err;
            }
        },
        [api, listUsers]
    );

    const deleteUser = useCallback(
        async (id: number) => {
            try {
                await api.delete(`/users/${id}`);
                // Sempre recarrega a lista completa após deletar um recurso
                await listUsers();
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error:
                        err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao deletar usuário",
                }));
                throw err;
            }
        },
        [api, listUsers]
    );

    return {
        // state
        users: state.users,
        loading: state.loading,
        error: state.error,
        search: state.search,

        // actions
        listUsers,
        refresh,
        createUser,
        updateUser,
        deleteUser,

        // setters
        setSearch,
    };
}
