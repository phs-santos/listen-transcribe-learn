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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import { useAudioLists, type AudioList } from "@/hooks/use-audio-lists";
import { useAdmin } from "@/hooks/use-admin";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

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
        status: z.enum(["draft", "generated", "saved", "published"]),
        allowed_users: z.array(z.number()).optional(),
    })
    .refine((data) => new Date(data.start_date) < new Date(data.end_date), {
        message: "A data de início deve ser anterior à data de fim",
        path: ["end_date"],
    });

type FormValues = z.infer<typeof schema>;

type Props = {
    open: boolean;
    onClose: () => void;
    list: AudioList | null;
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

// Converter data para formato datetime-local
const toDatetimeLocal = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
};

export function EditAudioListModal({ open, onClose, list }: Props) {
    const { updateList } = useAudioLists();
    const { users, listUsers } = useAdmin();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            accountcode: "",
            condominium_id: "",
            start_date: "",
            end_date: "",
            notes: "",
            status: "draft",
            allowed_users: [],
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    // Carregar usuários quando modal abre
    useEffect(() => {
        if (open) {
            listUsers();
        }
    }, [open, listUsers]);

    // Preencher form quando lista muda
    useEffect(() => {
        if (list) {
            reset({
                accountcode: list.accountcode,
                condominium_id: String(list.condominium_id),
                start_date: toDatetimeLocal(list.start_date),
                end_date: toDatetimeLocal(list.end_date),
                notes: list.notes || "",
                status: list.status,
                allowed_users: (list as any).allowed_users || [],
            });
            setSelectedUsers((list as any).allowed_users || []);
        } else {
            reset();
            setSelectedUsers([]);
        }
        setLoading(false);
        setError(null);
    }, [list, reset]);

    const onSubmit = async (data: FormValues) => {
        if (!list) return;
        
        setLoading(true);
        setError(null);

        try {
            const payload = {
                accountcode: data.accountcode,
                start_date: normalizeDatetime(data.start_date),
                end_date: normalizeDatetime(data.end_date),
                notes: data.notes,
                condominium_id: Number(data.condominium_id),
                status: data.status,
                allowed_users: selectedUsers,
            };

            await updateList(list.id, payload);
            onClose();
        } catch (e: any) {
            setError(
                e?.response?.data?.error || e?.message || "Erro ao atualizar lista"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = (userId: number, checked: boolean) => {
        setSelectedUsers(prev => 
            checked 
                ? [...prev, userId]
                : prev.filter(id => id !== userId)
        );
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar lista de áudios</DialogTitle>
                    <DialogDescription>
                        Altere os dados da lista e configure usuários com acesso.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Título</Label>
                        <Textarea
                            id="notes"
                            placeholder="Condomínio Gates of Heaven"
                            {...register("notes")}
                        />
                        {errors.notes && (
                            <p className="text-sm text-destructive">
                                {errors.notes.message}
                            </p>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
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
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register("status")}
                            >
                                <option value="draft">Rascunho</option>
                                <option value="generated">Gerado</option>
                                <option value="saved">Salvo</option>
                                <option value="published">Publicado</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        {renderField("start_date", "Início", "datetime-local")}
                        {renderField("end_date", "Fim", "datetime-local")}
                    </div>

                    {/* Usuários com acesso */}
                    <div className="grid gap-2">
                        <Label>Usuários com acesso (deixe vazio para todos)</Label>
                        <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`user-${user.id}`}
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={(checked) => 
                                            handleUserToggle(user.id, checked as boolean)
                                        }
                                    />
                                    <Label htmlFor={`user-${user.id}`} className="text-sm">
                                        {user.name} ({user.email})
                                    </Label>
                                </div>
                            ))}
                        </div>
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
                                    Salvando…
                                </>
                            ) : (
                                "Salvar alterações"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}