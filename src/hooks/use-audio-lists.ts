import { useCallback, useMemo, useRef, useState } from "react";
import { getApiService } from "@/lib/api/services";

export type AudioList = {
    id: number; // UUID
    accountcode: string;
    start_date: string;
    end_date: string;
    status: "draft" | "generated" | "saved" | "published";
    notes?: string | null;
    created_by?: number | null;
    created_at?: string;
    updated_at?: string;
    totalAudios?: number;
    audios?: any[];
};

export function useAudioLists() {
    const api = useMemo(
        () => getApiService("backend_local", "private_token"),
        []
    );

    const [lists, setLists] = useState<AudioList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const listAll = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get<AudioList[]>("/audio-lists", {
                signal: ac.signal,
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

    const createList = useCallback(
        async (payload: {
            accountcode: string;
            start_date: string; // ISO format
            end_date: string;
            notes?: string;
            created_by?: number;
        }) => {
            const { data } = await api.post<AudioList>("/audio-lists", payload);
            setLists((prev) => [data, ...prev]);
            return data;
        },
        [api]
    );

    const getById = useCallback(
        async (id: number) => {
            const { data } = await api.get<AudioList>(`/audio-lists/${id}`);
            setLists((prev) => {
                const i = prev.findIndex((x) => x.id === id);
                if (i === -1) return prev;
                const clone = prev.slice();
                clone[i] = { ...clone[i], ...data };
                return clone;
            });
            return data;
        },
        [api]
    );

    const updateList = useCallback(
        async (id: number, patch: Partial<AudioList>) => {
            const { data } = await api.patch<AudioList>(
                `/audio-lists/${id}`,
                patch
            );
            setLists((prev) =>
                prev.map((x) => (x.id === id ? { ...x, ...data } : x))
            );
            return data;
        },
        [api]
    );

    const deleteList = useCallback(
        async (id: number) => {
            const prev = lists;
            setLists((xs) => xs.filter((x) => x.id !== id));
            try {
                await api.delete(`/audio-lists/${id}`);
            } catch (err) {
                setLists(prev);
                throw err;
            }
        },
        [api, lists]
    );

    return {
        lists,
        loading,
        error,
        listAll,
        createList,
        getById,
        updateList,
        deleteList,
    };
}
