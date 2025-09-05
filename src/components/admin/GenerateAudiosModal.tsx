import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useAudiosInList, GeneratePayload } from "@/hooks/use-audios-in-list";
import { AudioList } from "@/hooks/use-audio-lists";
import { useEffect, useState } from "react";
import { toLocalISOString } from "@/utils/general";
import { useTickets } from "@/hooks/use-tickets";

export function GenerateAudiosModal({
    open,
    onClose,
    list,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    list: AudioList;
    onSaved?: () => void;
}) {
    const { saveBulk } = useAudiosInList(list.id);
    const { fetchTickets, tickets } = useTickets();

    const [step, setStep] = useState<"form" | "preview">("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<GeneratePayload | null>(null);

    const [accountcode, setAccountcode] = useState("");
    const [condominiumId, setCondominiumId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [selected, setSelected] = useState<string[]>([]);

    // Reset ao fechar
    useEffect(() => {
        if (!open) {
            setStep("form");
            setMeta(null);
            setError(null);
            setLoading(false);
            setAccountcode("");
            setCondominiumId("");
            setStartDate("");
            setEndDate("");
            setSelected([]);
        }
    }, [open]);

    // Preenche e executa busca automaticamente
    useEffect(() => {
        if (open && list) {
            const startISO = toLocalISOString(new Date(list.start_date));
            const endISO = toLocalISOString(new Date(list.end_date));

            setAccountcode(list.accountcode);
            setCondominiumId(list.condominium_id);
            setStartDate(startISO);
            setEndDate(endISO);
        }
    }, [open, list]);

    async function handleSubmit() {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                accountcode,
                condominiumId,
                start_date: startDate,
                end_date: endDate,
                page: 1,
                limit: 10,
            };

            const result = await fetchTickets(payload);
            if (!result || !Array.isArray(result.tickets)) {
                throw new Error("Nenhum ticket retornado");
            }

            setMeta(payload);
            setStep("preview");
        } catch (e: any) {
            setError(e?.message || "Falha ao buscar tickets");
        } finally {
            setLoading(false);
        }
    }

    async function onSave() {
        if (!selected.length) return;

        const audios = tickets.data
            .filter((t) => selected.includes(t.id) && t.audiorecord)
            .map((t) => ({
                title: t.id,
                banco_id: t.id,
                url: t.audiorecord,
                linkedid: t.linkedid,
                duration: t.duration,
            }));

        setLoading(true);
        setError(null);
        try {
            await saveBulk(audios);
            onSaved();
            onClose();
        } catch (e: any) {
            setError(e?.message || "Falha ao salvar áudios");
        } finally {
            setLoading(false);
        }
    }

    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Adicionar áudios à lista</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para buscar os tickets com
                        gravações disponíveis.
                    </DialogDescription>
                </DialogHeader>

                {step === "form" && (
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Accountcode</Label>
                                    <span className="text-muted-foreground block p-2 rounded border bg-muted text-sm">
                                        {accountcode}
                                    </span>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Condominnio ID</Label>
                                    <span className="text-muted-foreground block p-2 rounded border bg-muted text-sm">
                                        {condominiumId}
                                    </span>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Início</Label>
                                    <span className="text-muted-foreground block p-2 rounded border bg-muted text-sm">
                                        {startDate}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Fim</Label>
                                    <span className="text-muted-foreground block p-2 rounded border bg-muted text-sm">
                                        {endDate}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 p-2 rounded">
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
                            <Button onClick={handleSubmit} disabled={loading}>
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
                    </div>
                )}

                {step === "preview" && (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            {meta?.accountcode} — {meta?.start_date} →{" "}
                            {meta?.end_date}
                        </div>

                        <div className="overflow-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="p-2 text-left">#</th>
                                        <th className="p-2 text-left">
                                            LinkedID
                                        </th>
                                        <th className="p-2 text-left">
                                            Duração
                                        </th>
                                        <th className="p-2 text-left">Áudio</th>
                                        <th className="p-2 text-left">
                                            Selecionar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.data.map((t, idx) => (
                                        <tr
                                            key={t.id + idx}
                                            className="border-t last:border-b"
                                        >
                                            <td className="p-2">{idx + 1}</td>
                                            <td className="p-2">
                                                {t.linkedid}
                                            </td>
                                            <td className="p-2">
                                                {t.duration}s
                                            </td>
                                            <td className="p-2">
                                                {t.audiorecord ? (
                                                    <a
                                                        href={t.audiorecord}
                                                        className="text-primary underline text-xs"
                                                        target="_blank"
                                                    >
                                                        Ver
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <Checkbox
                                                    checked={selected.includes(
                                                        t.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelect(t.id)
                                                    }
                                                    disabled={!t.audiorecord}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação simples */}
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>
                                Página {tickets.pagination.page} de{" "}
                                {tickets.pagination.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        tickets.pagination.page <= 1 || loading
                                    }
                                    onClick={() =>
                                        fetchTickets({
                                            ...meta!,
                                            page: tickets.pagination.page - 1,
                                            accountcode,
                                            condominiumId,
                                            start_date: startDate,
                                            end_date: endDate,
                                        })
                                    }
                                >
                                    Anterior
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        tickets.pagination.page >=
                                            tickets.pagination.totalPages ||
                                        loading
                                    }
                                    onClick={() =>
                                        fetchTickets({
                                            ...meta!,
                                            page: tickets.pagination.page + 1,
                                            limit: 10,
                                            accountcode,
                                            condominiumId,
                                            start_date: startDate,
                                            end_date: endDate,
                                        })
                                    }
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 p-2 rounded">
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
                                disabled={loading || selected.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando…
                                    </>
                                ) : (
                                    `Salvar ${selected.length} áudios`
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
