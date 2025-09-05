import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { useEffect, useState } from "react";

// Validação com Zod
const schema = z
    .object({
        accountcode: z.string().min(2, "Informe o accountcode"),
        condominium_id: z
            .string()
            .min(1, "Informe o ID do condomínio")
            .refine((val) => !isNaN(Number(val)), "ID inválido"),
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

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: (id: number) => void;
};

// Utilitário para garantir segundos no datetime
const normalizeDatetime = (value: string): string => {
    if (!value.includes("T")) return value;
    const [date, time] = value.split("T");
    const parts = time.split(":");
    const [hh, mm, ss] = [parts[0], parts[1], parts[2] ?? "00"];
    return `${date}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(
        2,
        "0"
    )}`;
};

export function CreateAudioListModal({ open, onClose, onCreated }: Props) {
    const { createList } = useAudioLists();
    const user = useAuthStore((s) => s.user);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            accountcode: "",
            condominium_id: "",
            start_date: "",
            end_date: "",
            notes: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            reset();
            setLoading(false);
            setError(null);
        }
    }, [open, reset]);

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                accountcode: data.accountcode,
                start_date: normalizeDatetime(data.start_date),
                end_date: normalizeDatetime(data.end_date),
                notes: data.notes,
                condominium_id: Number(data.condominium_id),
                created_by: user?.id ?? undefined,
            };

            const res = await createList(payload);
            onCreated(res.id); // aqui adiciona o callback
            onClose();
        } catch (e: any) {
            setError(
                e?.response?.data?.error || e?.message || "Erro ao criar lista"
            );
        } finally {
            setLoading(false);
        }
    };

    const renderField = (
        id: keyof FormValues,
        label: string,
        type = "text",
        placeholder?: string
    ) => (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                step={type === "datetime-local" ? 1 : undefined}
                placeholder={placeholder}
                {...register(id)}
            />
            {errors[id] && (
                <p className="text-sm text-destructive">
                    {errors[id]?.message as string}
                </p>
            )}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Criar lista de áudios</DialogTitle>
                    <DialogDescription>
                        Informe os dados e o período completo da lista.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {renderField(
                        "notes",
                        "Título",
                        "text",
                        "Condomínio Gates of Heaven"
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                        {renderField(
                            "accountcode",
                            "Accountcode",
                            "text",
                            "agencia56k | 56konpx4"
                        )}
                        {renderField(
                            "condominium_id",
                            "Código Condomínio",
                            "text",
                            "1345 | 5431"
                        )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        {renderField("start_date", "Início", "datetime-local")}
                        {renderField("end_date", "Fim", "datetime-local")}
                    </div>

                    {error && (
                        <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
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
