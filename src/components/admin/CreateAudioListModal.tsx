// src/components/admin/CreateAudioListModal.tsx
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
import { Loader2 } from "lucide-react";
import { useAudioLists } from "@/hooks/use-audio-lists";
import { useAuthStore } from "@/store/auth-store";

type PeriodType = "day" | "custom" | "week" | "month";

const schema = z
    .object({
        accountcode: z.string().min(2, "Informe o accountcode"),
        periodType: z.enum(["day", "custom", "week", "month"]),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
        start_time: z.string().optional(), // HH:mm
        end_time: z.string().optional(), // HH:mm
        notes: z.string().optional(),
    })
    .refine(
        (v) => {
            if (v.periodType === "custom") {
                // para custom, horários são obrigatórios e no formato HH:mm
                if (!v.start_time || !/^\d{2}:\d{2}$/.test(v.start_time))
                    return false;
                if (!v.end_time || !/^\d{2}:\d{2}$/.test(v.end_time))
                    return false;
            }
            return true;
        },
        {
            message: "Horários inválidos para período custom (use HH:mm).",
            path: ["start_time"],
        }
    );

type FormValues = z.infer<typeof schema>;

function toHms(t?: string) {
    if (!t) return undefined;
    // "HH:mm" -> "HH:mm:00"
    if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
    // já em "HH:mm:ss"
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
    return undefined;
}

function isoToDateParts(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    return { y, m, d };
}

function formatDate(y: number, m: number, d: number) {
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
}

function getMonthDays(iso: string) {
    const { y, m } = isoToDateParts(iso);
    const last = new Date(y, m, 0).getDate(); // m já é 1-12 aqui
    const days: string[] = [];
    for (let d = 1; d <= last; d++) {
        days.push(formatDate(y, m, d));
    }
    return days;
}

function getWeekRange(iso: string) {
    // semana: segunda a domingo contendo a "date"
    const base = new Date(`${iso}T00:00:00`);
    const day = base.getDay(); // 0=domingo, 1=segunda...
    const diffToMonday = (day + 6) % 7; // transforma: seg=0, dom=6
    const monday = new Date(base);
    monday.setDate(base.getDate() - diffToMonday);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const dd = d.getDate();
        days.push(formatDate(y, m, dd));
    }
    return days;
}

export function CreateAudioListModal({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated?: (id: string | string[]) => void;
}) {
    const { createList } = useAudioLists();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const user = useAuthStore((s) => s.user);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            periodType: "day",
            date: new Date().toISOString().slice(0, 10),
            start_time: "00:00",
            end_time: "23:59",
        },
    });

    React.useEffect(() => {
        if (!open) {
            setLoading(false);
            setError(null);
            form.reset({
                periodType: "day",
                date: new Date().toISOString().slice(0, 10),
                start_time: "00:00",
                end_time: "23:59",
            });
        }
    }, [open, form]);

    // gera a “prévia” de quantas listas serão criadas
    const previewCount = React.useMemo(() => {
        const v = form.getValues();
        if (v.periodType === "week") return getWeekRange(v.date).length;
        if (v.periodType === "month") return getMonthDays(v.date).length;
        return 1;
    }, [form]);

    async function onSubmit(values: FormValues) {
        setLoading(true);
        setError(null);
        try {
            const base = {
                accountcode: values.accountcode,
                notes: values.notes || undefined,
                created_by: user?.id,
            };

            let ids: string[] = [];

            if (values.periodType === "day") {
                const res = await createList({
                    ...base,
                    date: values.date,
                    start_time: "00:00:00",
                    end_time: "23:59:59",
                });
                ids.push(res.id);
            } else if (values.periodType === "custom") {
                const startHms = toHms(values.start_time);
                const endHms = toHms(values.end_time);
                const res = await createList({
                    ...base,
                    date: values.date,
                    start_time: startHms,
                    end_time: endHms,
                });
                ids.push(res.id);
            } else if (values.periodType === "week") {
                const days = getWeekRange(values.date);
                for (const d of days) {
                    const res = await createList({
                        ...base,
                        date: d,
                        start_time: "00:00:00",
                        end_time: "23:59:59",
                    });
                    ids.push(res.id);
                }
            } else if (values.periodType === "month") {
                const days = getMonthDays(values.date);
                for (const d of days) {
                    const res = await createList({
                        ...base,
                        date: d,
                        start_time: "00:00:00",
                        end_time: "23:59:59",
                    });
                    ids.push(res.id);
                }
            }

            onCreated?.(ids.length === 1 ? ids[0] : ids);
            onClose();
        } catch (e: any) {
            setError(
                e?.response?.data?.error ||
                    e?.message ||
                    "Falha ao criar lista(s)"
            );
        } finally {
            setLoading(false);
        }
    }

    const periodType = form.watch("periodType");

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Criar lista de áudios</DialogTitle>
                    <DialogDescription>
                        Defina empresa e período (dia, intervalo, semana ou
                        mês).
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="accountcode">Accountcode</Label>
                        <Input
                            id="accountcode"
                            {...form.register("accountcode")}
                        />
                        {form.formState.errors.accountcode && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.accountcode.message}
                            </p>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="periodType">Período</Label>
                            <select
                                id="periodType"
                                className="h-9 rounded-md border bg-background px-3"
                                {...form.register("periodType")}
                            >
                                <option value="day">Dia inteiro</option>
                                <option value="custom">
                                    Intervalo (um dia)
                                </option>
                                <option value="week">Semana cheia</option>
                                <option value="month">Mês cheio</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date">
                                {periodType === "week"
                                    ? "Qualquer dia da semana"
                                    : periodType === "month"
                                    ? "Qualquer dia do mês"
                                    : "Data"}
                            </Label>
                            <Input
                                id="date"
                                {...form.register("date")}
                                placeholder="YYYY-MM-DD"
                            />
                            {form.formState.errors.date && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.date.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {periodType === "custom" && (
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="start_time">
                                    Início (HH:mm)
                                </Label>
                                <Input
                                    id="start_time"
                                    {...form.register("start_time")}
                                    placeholder="HH:mm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_time">Fim (HH:mm)</Label>
                                <Input
                                    id="end_time"
                                    {...form.register("end_time")}
                                    placeholder="HH:mm"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Input
                            id="notes"
                            {...form.register("notes")}
                            placeholder="Opcional"
                        />
                    </div>

                    <div className="text-xs text-muted-foreground">
                        {periodType === "day" &&
                            "Será criada 1 lista (00:00–23:59)."}
                        {periodType === "custom" &&
                            "Será criada 1 lista no dia informado com o intervalo definido."}
                        {periodType === "week" &&
                            `Serão criadas ${previewCount} listas (seg–dom).`}
                        {periodType === "month" &&
                            `Serão criadas ${previewCount} listas (1º ao último dia).`}
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
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                                    Criando…
                                </>
                            ) : (
                                "Criar"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
