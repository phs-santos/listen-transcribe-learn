import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useAdmin } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const schema = z
    .object({
        name: z.string().min(2, "Nome muito curto"),
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "Mínimo 6 caracteres"),
        confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
        role: z.enum(["user", "admin"]).default("user"),
    })
    .refine((v) => v.password === v.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type FormValues = z.infer<typeof schema>;

type NewUserModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void; // callback opcional após sucesso
};

export function NewUserModal({ open, onClose, onCreated }: NewUserModalProps) {
    const { createUser } = useAdmin(); // se preferir, injete createUser por props
    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user",
        },
        mode: "onBlur",
    });

    React.useEffect(() => {
        if (!open) {
            reset(); // limpa o form ao fechar
            setSubmitError(null);
            setSubmitting(false);
        }
    }, [open, reset]);

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await createUser({
                name: values.name.trim(),
                email: values.email.trim(),
                password: values.password,
                role: values.role,
            });
            onCreated?.();
            onClose();
        } catch (err: any) {
            setSubmitError(err?.message || "Falha ao criar usuário");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para criar um novo usuário.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nome */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            placeholder="Nome completo"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nome@empresa.com"
                            autoComplete="email"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="grid gap-2">
                        <Label>Função</Label>
                        <Select
                            defaultValue="user"
                            onValueChange={(v) =>
                                setValue("role", v as "user" | "admin", {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="admin">
                                    Administrador
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                    {/* Senha */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirmar Senha */}
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Erro de submit */}
                    {submitError && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">
                            {submitError}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className={cn(submitting && "opacity-90")}
                            disabled={submitting}
                        >
                            {submitting ? (
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
