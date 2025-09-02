// src/components/admin/GenerateAudiosModal.tsx
import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, Music } from "lucide-react";
import {
    useAudiosInList,
    AudioItem,
    GeneratePayload,
} from "@/hooks/use-audios-in-list";
import { AudioList } from "@/hooks/use-audio-lists";

const schema = z.object({
    accountcode: z.string().min(2),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function GenerateAudiosModal({
    open,
    onClose,
    list,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    list: AudioList; // <- obrigatório
    onSaved?: () => void;
}) {
    const { generatePreview, saveBulk } = useAudiosInList(list.id);
    const [step, setStep] = React.useState<"form" | "preview">("form");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [preview, setPreview] = React.useState<AudioItem[]>([]);
    const [meta, setMeta] = React.useState<GeneratePayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            date: new Date().toISOString().slice(0, 10),
            start_time: "00:00",
            end_time: "23:59",
        },
    });

    React.useEffect(() => {
        if (!open) {
            setStep("form");
            setPreview([]);
            setMeta(null);
            setError(null);
            setLoading(false);
            form.reset();
        }
    }, [open, form]);

    async function onSubmit(values: FormValues) {
        setLoading(true);
        setError(null);
        try {
            const payload: GeneratePayload = {
                accountcode: values.accountcode,
                date: values.date,
                start_time: values.start_time || undefined,
                end_time: values.end_time || undefined,
            };
            const items = await generatePreview(payload);
            setPreview(items);
            setMeta(payload);
            setStep("preview");
        } catch (e: any) {
            setError(e?.message || "Falha ao gerar preview");
        } finally {
            setLoading(false);
        }
    }

    async function onSave() {
        if (!preview.length) return;
        setLoading(true);
        setError(null);
        try {
            await saveBulk(preview);
            onSaved?.();
            onClose();
        } catch (e: any) {
            setError(e?.message || "Falha ao salvar áudios");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Adicionar áudios à lista</DialogTitle>
                    <DialogDescription>
                        Busque na API externa e salve nesta lista.
                    </DialogDescription>
                </DialogHeader>

                {step === "form" && (
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="accountcode">Accountcode</Label>
                                <Input
                                    id="accountcode"
                                    {...form.register("accountcode")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Data</Label>
                                <Input
                                    id="date"
                                    {...form.register("date")}
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_time">
                                    Início (HH:mm)
                                </Label>
                                <Input
                                    id="start_time"
                                    {...form.register("start_time")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_time">Fim (HH:mm)</Label>
                                <Input
                                    id="end_time"
                                    {...form.register("end_time")}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Buscando…
                                    </>
                                ) : (
                                    "Buscar"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {step === "preview" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {meta?.accountcode} — {meta?.date}
                                {meta?.start_time &&
                                    `, ${meta.start_time}`}{" "}
                                {meta?.end_time && `→ ${meta.end_time}`}
                            </div>
                            <Badge variant="secondary">
                                {preview.length} áudios
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-auto pr-1">
                            {preview.map((a, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg border p-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-md bg-muted grid place-items-center">
                                            <Music className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium truncate">
                                                {a.title || "Sem título"}
                                            </div>
                                            <a
                                                href={a.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-primary mt-2"
                                            >
                                                <Link2 className="h-3 w-3" />
                                                Abrir URL
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {preview.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                    Nenhum áudio retornado.
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="rounded border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setStep("form")}
                                disabled={loading}
                            >
                                Voltar
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={loading || preview.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando…
                                    </>
                                ) : (
                                    "Salvar na lista"
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
