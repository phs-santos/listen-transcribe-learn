import { useCallback, useMemo, useState } from "react";
import { getApiService } from "@/lib/api/services";
import type { AudioList } from "./use-audio-lists";

export type AudioItem = {
    id?: number; // UUID
    list_id?: number; // UUID
    title?: string;
    url: string;
    status?: "draft" | "published";
    external_id?: string | null;
    transcript_human?: string | null;
    transcript_ai?: string | null;
};

export type GeneratePayload = {
    accountcode: string;
    start_date?: string; // HH:mm
    end_date?: string; // HH:mm
};

export function useAudiosInList(listId: number | null) {
    const api = useMemo(
        () => getApiService("backend_local", "private_token"),
        []
    );
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // carrega a lista e seus áudios
    const load = useCallback(async () => {
        if (!listId) return;
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get<AudioList>(`/audio-lists/${listId}`);
            setAudios((data?.audios as AudioItem[]) ?? []);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                    err?.message ||
                    "Falha ao carregar lista"
            );
        } finally {
            setLoading(false);
        }
    }, [api, listId]);

    // preview (não salva)
    const generatePreview = useCallback(
        async (payload: GeneratePayload) => {
            const { data } = await api.post<AudioItem[]>(
                `/audios/generate/preview`,
                payload
            );
            return data ?? [];
        },
        [api]
    );

    // salva em bulk na lista
    const saveBulk = useCallback(
        async (items: AudioItem[]) => {
            if (!listId) throw new Error("listId inválido");
            const { data } = await api.post<{
                created: number;
                skipped: number;
            }>(`/audio-lists/${listId}/audios/bulk`, {
                items,
            });
            await load();
            return data;
        },
        [api, listId, load]
    );

    const deleteAudio = useCallback(
        async (listId: number, id: number) => {
            // se você criar rota DELETE /audios/:id
            await api.delete(`/audio-lists/${listId}/audios/${id}`);
            setAudios((xs) => xs.filter((x) => x.id !== id));
        },
        [api]
    );

    return {
        audios,
        loading,
        error,
        load,
        generatePreview,
        saveBulk,
        deleteAudio,
    };
}
