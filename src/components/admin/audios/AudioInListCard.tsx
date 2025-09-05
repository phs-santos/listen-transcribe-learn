import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Trash2,
    Bot,
    UserCheck,
    CheckCircle2,
    CircleDashed,
    Timer,
    AudioWaveform,
} from "lucide-react";
import AlertExclusao, { type ConfirmState } from "./AlertExclusao";

type UIAudio = {
    id?: number;
    title?: string | null;
    url?: string | null;
    status?: string | null;
    duration?: number | null; // segundos
    transcript_human?: string | null;
    transcript_ai?: string | null;
    updated_at?: string | null;
    // campos extras são ignorados
    [k: string]: any;
};

function secondsToLabel(sec?: number | null) {
    const total = Number(sec || 0);
    if (!isFinite(total) || total <= 0) return "0m";
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export const AudioInListCard = ({
    audio,
    selectedListId,
    onConfirmDelete,
}: {
    audio: UIAudio;
    selectedListId: number;
    onConfirmDelete: () => Promise<void> | void;
}) => {
    const [confirm, setConfirm] = useState<ConfirmState>({ open: false });

    const hasHuman = useMemo(
        () => !!audio?.transcript_human?.trim?.(),
        [audio?.transcript_human]
    );
    const hasAI = useMemo(
        () => !!audio?.transcript_ai?.trim?.(),
        [audio?.transcript_ai]
    );
    const isTranscribed = hasHuman || hasAI;

    const lastUpdated = useMemo(() => {
        if (!audio?.updated_at) return null;
        const d = new Date(audio.updated_at);
        return isNaN(d.getTime()) ? null : d;
    }, [audio?.updated_at]);

    const openConfirmDeleteAudio = useCallback(
        (a: { id: number; title?: string }, listId: number) =>
            setConfirm({
                open: true,
                kind: "audio",
                id: a.id,
                title: a.title || "Sem título",
                parentListId: listId,
            }),
        []
    );

    return (
        <div className="group relative rounded-xl border border-border/60 p-4 transition hover:shadow-md bg-card/50">
            {/* Accent top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/70 opacity-80" />

            {/* Título */}
            <div className="font-medium truncate text-foreground">
                {audio.title || "Sem título"}
            </div>

            {/* Link */}
            {!!audio.url && (
                <Badge variant="secondary" className="rounded-full bg-primary">
                    Audio OK
                </Badge>
            )}

            {/* Badges de status e transcrição */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full">
                    {audio.status || "draft"}
                </Badge>

                {hasHuman && (
                    <Badge
                        variant="secondary"
                        className="rounded-full flex items-center gap-1"
                    >
                        <UserCheck className="h-3.5 w-3.5" />
                        Humana
                    </Badge>
                )}

                {hasAI && (
                    <Badge
                        variant="secondary"
                        className="rounded-full flex items-center gap-1"
                    >
                        <Bot className="h-3.5 w-3.5" />
                        IA
                    </Badge>
                )}

                {!isTranscribed && (
                    <Badge
                        variant="outline"
                        className="rounded-full flex items-center gap-1"
                    >
                        <CircleDashed className="h-3.5 w-3.5" />
                        Pendente
                    </Badge>
                )}
            </div>

            {/* Resumo / meta */}
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        {isTranscribed ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                Transcrito
                            </>
                        ) : (
                            <>
                                <CircleDashed className="h-3.5 w-3.5" />
                                Aguardando transcrição
                            </>
                        )}
                    </span>
                    <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {secondsToLabel(audio.duration)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span>Atualizado</span>
                    <span>
                        {lastUpdated
                            ? `${lastUpdated.toLocaleDateString(
                                  "pt-BR"
                              )} ${lastUpdated.toTimeString().slice(0, 5)}`
                            : "—"}
                    </span>
                </div>
            </div>

            <Separator className="my-3" />

            {/* Ações */}
            <div className="mt-2 flex justify-end">
                {!!audio.id && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                            openConfirmDeleteAudio(
                                audio as { id: number; title?: string },
                                selectedListId
                            )
                        }
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                    </Button>
                )}
            </div>

            {/* Dialog controlado */}
            <AlertExclusao
                confirm={confirm}
                setConfirm={setConfirm}
                onConfirmDelete={onConfirmDelete}
            />
        </div>
    );
};
