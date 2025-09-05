import { useCallback, useMemo, useState, useEffect } from "react";
import { getApiService } from "@/lib/api/services";
import type { AudioList } from "./use-audio-lists";
import { useAuthStore } from "@/store/auth-store";

export type AudioItem = {
    id?: number;
    list_id?: number;
    title?: string;
    url: string;
    status?: "draft" | "published";
    external_id?: string | null;
    transcript_human?: string | null;
    transcript_ai?: string | null;
    duration?: number;
    linkedid?: string | null;
};

export type GeneratePayload = {
    accountcode: string;
    start_date?: string;
    end_date?: string;
};

export function useAudiosInList(listId: number | null) {
    const token = useAuthStore((s) => s.user?.token);
    const api = useMemo(
        () => getApiService("backend_local", "private_token", token),
        [token]
    );
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userId = useAuthStore((s) => s.user?.id);

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

    // Auto-load audios when listId changes
    useEffect(() => {
        if (listId) {
            load();
        } else {
            setAudios([]);
        }
    }, [listId, load]);

    const saveBulk = useCallback(
        async (items: AudioItem[]) => {
            if (!listId) throw new Error("listId inválido");

            const { data } = await api.post<{
                created: number;
                skipped: number;
            }>(`/audio-lists/${listId}/audios/bulk`, { items });

            // Sempre recarrega a lista completa após criar novos recursos
            await load();
            return data;
        },
        [api, listId, load]
    );

    const deleteAudio = useCallback(
        async (listId: number, id: number) => {
            await api.delete(`/audio-lists/${listId}/audios/${id}`);
            // Sempre recarrega a lista completa após deletar um recurso
            await load();
        },
        [api, load]
    );

    const saveHumanTranscript = useCallback(
        async (audioId: number, transcript: string, tags: string[]) => {
            const { data } = await api.post<AudioItem>(
                `/audio-lists/${audioId}/transcription/human`,
                {
                    transcript_human: transcript,
                    transcriber_id: userId,
                    tags,
                }
            );

            // Sempre recarrega a lista completa após atualizar um recurso
            await load();
            return data;
        },
        [api, userId, load]
    );

    const saveAiTranscript = useCallback(
        async (audioId: number, transcript: string) => {
            const { data } = await api.post<AudioItem>(
                `/audio-lists/${audioId}/transcription/ai`,
                {
                    transcript_ai: transcript,
                }
            );

            // Sempre recarrega a lista completa após atualizar um recurso
            await load();
            return data;
        },
        [api, load]
    );

    return {
        audios,
        loading,
        error,
        load,
        saveBulk,
        deleteAudio,
        saveHumanTranscript,
        saveAiTranscript,
    };
}
