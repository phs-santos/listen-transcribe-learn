// src/hooks/use-audios.ts
import { getApiService } from "@/lib/api/services";
import { useCallback, useMemo, useRef, useState } from "react";

export type AudioItem = {
    id?: string;
    title: string;
    description?: string;
    url: string;
    duration?: string; // "mm:ss" ou "HH:mm:ss"
    category?: string;
    uploadedBy?: string;
    uploadedAt?: string; // ISO
    fileSize?: string; // ex: "12.5 MB"
    status?: "draft" | "published";
    likes?: number;
    plays?: number;
};

export type GeneratePayload = {
    accountCode: string;
    date: string; // YYYY-MM-DD
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
};

export function useAudios() {
    const api = useMemo(
        () => getApiService("backend_local", "private_token"),
        []
    );
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const listAudios = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get<AudioItem[]>("/audios", {
                signal: ac.signal,
            });
            setAudios(data ?? []);
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                setError(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao listar áudios"
                );
            }
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    }, [api]);

    const generateAudios = useCallback(
        async (payload: GeneratePayload) => {
            // Chama seu backend que PROXY a API externa
            // POST /audios/generate  -> retorna AudioItem[]
            try {
                setError(null);
                const { data } = await api.post<AudioItem[]>(
                    "/audios/generate",
                    payload
                );
                return data ?? [];
            } catch (err: any) {
                throw new Error(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao gerar áudios do período"
                );
            }
        },
        [api]
    );

    const saveAudios = useCallback(
        async (
            items: AudioItem[],
            meta?: {
                accountCode: string;
                date: string;
                startTime?: string;
                endTime?: string;
            }
        ) => {
            // Persiste a lista no seu backend
            // POST /audios/bulk  -> { created: number }
            try {
                const { data } = await api.post<{ created: number }>(
                    "/audios/bulk",
                    { items, meta }
                );
                // Atualiza UI recarregando
                await listAudios();
                return data;
            } catch (err: any) {
                throw new Error(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao salvar áudios"
                );
            }
        },
        [api, listAudios]
    );

    const deleteAudio = useCallback(
        async (id: string) => {
            const prev = audios;
            const next = prev.filter((a) => a.id !== id);
            setAudios(next);
            try {
                await api.delete(`/audios/${id}`);
            } catch (err: any) {
                setAudios(prev); // rollback
                throw new Error(
                    err?.response?.data?.error ||
                        err?.message ||
                        "Falha ao deletar áudio"
                );
            }
        },
        [api, audios]
    );

    return {
        audios,
        loading,
        error,
        listAudios,
        generateAudios,
        saveAudios,
        deleteAudio,
    };
}
