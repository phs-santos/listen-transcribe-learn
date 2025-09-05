import { useCallback, useMemo, useRef, useState } from "react";
import { getApiService } from "@/lib/api/services";
import { useAuthStore } from "@/store/auth-store";
import type { AudioItem } from "@/types/audio-list";

export type AudioList = {
    id: number;
    accountcode: string;
    condominium_id: number | string; // backend envia number
    start_date: string;
    end_date: string;
    status: "draft" | "generated" | "saved" | "published";
    notes?: string | null;
    created_by?: number | null;
    created_at?: string;
    updated_at?: string;
    totalAudios?: number;
    totalDuration?: number;
    audios?: any[];
};

type CreateListPayload = {
    accountcode: string;
    condominium_id: number;
    start_date: string;
    end_date: string;
    notes?: string;
    created_by?: number;
};

export function useAudioLists() {
    const token = useAuthStore((s) => s.user?.token);
    
    const api = useMemo(
        () => getApiService("backend_local", "private_token", token),
        [token]
    );
    const [lists, setLists] = useState<AudioList[]>([]);
    const [audiosTranscribed, setAudiosTranscribed] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingAT, setLoadingAT] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const abortPrevious = () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        return controller;
    };

    const listAll = useCallback(async () => {
        const controller = abortPrevious();
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get<AudioList[]>("/audio-lists", {
                signal: controller.signal,
            });
            setLists(data ?? []);
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao listar listas"
                );
            }
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    }, [api]);

    const listAudiosTranscribed = useCallback(async () => {
        const controller = abortPrevious();
        try {
            setLoadingAT(true);
            setError(null);
            const { data } = await api.get<AudioItem[]>(
                "/audio-lists/transcribed",
                {
                    signal: controller.signal,
                }
            );
            setAudiosTranscribed(data ?? []);
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao listar áudios"
                );
            }
        } finally {
            setLoadingAT(false);
            abortRef.current = null;
        }
    }, [api]);

    const createList = useCallback(
        async (payload: CreateListPayload) => {
            try {
                const { data } = await api.post<AudioList>(
                    "/audio-lists",
                    payload
                );
                // Sempre recarrega a lista completa após criar um novo recurso
                await listAll();
                return data;
            } catch (err: any) {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao criar lista"
                );
                throw err;
            }
        },
        [api, listAll]
    );

    const getById = useCallback(
        async (id: number) => {
            try {
                const { data } = await api.get<AudioList>(`/audio-lists/${id}`);
                setLists((prev) => {
                    const i = prev.findIndex((x) => x.id === id);
                    if (i === -1) return [...prev, data];
                    const clone = [...prev];
                    clone[i] = { ...clone[i], ...data };
                    return clone;
                });
                return data;
            } catch (err: any) {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao buscar lista"
                );
                throw err;
            }
        },
        [api]
    );

    const updateList = useCallback(
        async (id: number, patch: Partial<AudioList>) => {
            try {
                const { data } = await api.patch<AudioList>(
                    `/audio-lists/${id}`,
                    patch
                );
                // Sempre recarrega a lista completa após atualizar um recurso
                await listAll();
                return data;
            } catch (err: any) {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao atualizar lista"
                );
                throw err;
            }
        },
        [api, listAll]
    );

    const deleteList = useCallback(
        async (id: number) => {
            try {
                await api.delete(`/audio-lists/${id}`);
                // Sempre recarrega a lista completa após deletar um recurso
                await listAll();
            } catch (err: any) {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao excluir lista"
                );
                throw err;
            }
        },
        [api, listAll]
    );

    return {
        loading,
        loadingAT,
        error,

        lists,
        audiosTranscribed,

        listAll,
        listAudiosTranscribed,
        createList,
        getById,
        updateList,
        deleteList,
    };
}
