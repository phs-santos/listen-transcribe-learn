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

const schema = z
    .object({
        accountcode: z.string().min(2, "Informe o accountcode"),
        start_date: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
        end_date: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
        notes: z.string().optional(),
    })
    .refine((data) => new Date(data.start_date) < new Date(data.end_date), {
        message: "A data de início deve ser anterior à data de fim",
        path: ["end_date"],
    });

type FormValues = z.infer<typeof schema>;

export function CreateAudioListModal({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated?: (id: string) => void;
}) {
    const { createList } = useAudioLists();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const user = useAuthStore((s) => s.user);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            accountcode: "",
            start_date: "",
            end_date: "",
            notes: "",
        },
    });

    React.useEffect(() => {
        if (!open) {
            setLoading(false);
            setError(null);
            form.reset({
                accountcode: "",
                start_date: "",
                end_date: "",
                notes: "",
            });
        }
    }, [open, form]);

    async function onSubmit(values: FormValues) {
        setLoading(true);
        setError(null);
        try {
            const res = await createList({
                accountcode: values.accountcode,
                start_date: values.start_date,
                end_date: values.end_date,
                notes: values.notes || undefined,
                created_by: user?.id,
            });

            onCreated?.(res.id);
            onClose();
        } catch (e: any) {
            setError(
                e?.response?.data?.error || e?.message || "Falha ao criar lista"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Criar lista de áudios</DialogTitle>
                    <DialogDescription>
                        Informe os dados e o período completo da lista.
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
                            <Label htmlFor="start_date">Início</Label>
                            <Input
                                id="start_date"
                                type="datetime-local"
                                step={1}
                                {...form.register("start_date")}
                                placeholder="dd/mm/aaaa hh:mm:ss"
                            />
                            {form.formState.errors.start_date && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.start_date.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_date">Fim</Label>
                            <Input
                                id="end_date"
                                type="datetime-local"
                                step={1}
                                {...form.register("end_date")}
                                placeholder="dd/mm/aaaa hh:mm:ss"
                            />
                            {form.formState.errors.end_date && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.end_date.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Input
                            id="notes"
                            {...form.register("notes")}
                            placeholder="Opcional"
                        />
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
