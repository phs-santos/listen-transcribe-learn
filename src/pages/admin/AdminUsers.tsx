import { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    UserPlus,
    Edit,
    Trash2,
    RefreshCw,
    Shield,
} from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const {
        users,
        loading,
        error,
        refresh,
        createUser,
        updateUser,
        deleteUser,
    } = useAdmin();
    const actualUser = useAuthStore((s) => s.user);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const q = searchTerm.toLowerCase();
        return users.filter(
            (u) =>
                (u.name || "").toLowerCase().includes(q) ||
                (u.email || "").toLowerCase().includes(q)
        );
    }, [users, searchTerm]);

    const totalUsers = users.length;
    const totalActive = users.filter((u: any) => u.status === "active").length;
    const totalAdmins = users.filter((u: any) => u.role === "admin").length;

    const getRoleColor = (role: string) =>
        role === "admin"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary";

    const getStatusColor = (status: string) =>
        status === "active"
            ? "bg-green-500/10 text-green-500"
            : "bg-red-500/10 text-red-500";

    const handleCreate = async () => {
        await createUser({
            name: "Novo Usuário",
            email: "novo@exemplo.com",
            password: "123456",
            role: "user",
        });
        await refresh();
    };

    const handleEdit = async (id: number) => {
        // Evita trocar o próprio role (opcional)
        if (actualUser?.id === id) return;
        await updateUser(id, { role: "admin" });
        await refresh();
    };

    const handleDelete = async (id: number) => {
        if (actualUser?.id === id) return; // nunca delete a si mesmo
        await deleteUser(id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
                    <p className="text-muted-foreground mt-2">
                        Visualize e gerencie todos os usuários da plataforma
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={refresh}
                        disabled={loading}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button onClick={handleCreate}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo Usuário
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {totalUsers}
                        </CardTitle>
                        <CardDescription>Total de Usuários</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {totalActive}
                        </CardTitle>
                        <CardDescription>Usuários Ativos</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {totalAdmins}
                        </CardTitle>
                        <CardDescription>Administradores</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Loading / Error */}
            {loading && (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Carregando usuários…
                    </CardContent>
                </Card>
            )}
            {error && !loading && (
                <Card>
                    <CardContent className="py-10 text-center text-destructive">
                        {error}
                    </CardContent>
                </Card>
            )}

            {/* Users as Cards */}
            {!loading && !error && (
                <TooltipProvider>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map((user: any) => {
                            const initials = (user.name || user.email || "?")
                                .slice(0, 2)
                                .toUpperCase();
                            const isSelf = actualUser?.id === user.id;

                            return (
                                <Card
                                    key={user.id}
                                    aria-label={
                                        isSelf ? "Usuário atual" : undefined
                                    }
                                    className={cn(
                                        "flex flex-col transition-shadow",
                                        isSelf
                                            ? "border-2 border-primary/70 shadow-sm"
                                            : ""
                                    )}
                                >
                                    <CardHeader className="flex flex-row items-center gap-3 pb-3">
                                        <div
                                            className={cn(
                                                "relative h-12 w-12 rounded-full grid place-items-center font-semibold text-lg bg-muted",
                                                isSelf &&
                                                    "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            )}
                                        >
                                            {initials}
                                            {isSelf && (
                                                <span
                                                    title="Você"
                                                    className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                                >
                                                    <Shield className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base truncate">
                                                    {user.name}
                                                </CardTitle>
                                                {isSelf && (
                                                    <Badge className="h-5 px-1.5 text-[10px] uppercase tracking-wide">
                                                        Você
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="truncate">
                                                {user.email}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={cn(
                                                    getRoleColor(user.role)
                                                )}
                                            >
                                                {user.role}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    getStatusColor(user.status)
                                                )}
                                            >
                                                {user.status}
                                            </Badge>
                                        </div>

                                        <div className="mt-auto flex gap-2">
                                            <Button
                                                variant={
                                                    isSelf
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    !isSelf &&
                                                    handleEdit(Number(user.id))
                                                }
                                                disabled={isSelf}
                                                title={
                                                    isSelf
                                                        ? "Não é possível editar a si mesmo aqui"
                                                        : "Editar"
                                                }
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Editar
                                            </Button>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={cn(
                                                                "text-destructive hover:text-destructive",
                                                                isSelf &&
                                                                    "opacity-50"
                                                            )}
                                                            onClick={() =>
                                                                !isSelf &&
                                                                handleDelete(
                                                                    Number(
                                                                        user.id
                                                                    )
                                                                )
                                                            }
                                                            disabled={isSelf}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Deletar
                                                        </Button>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {isSelf
                                                        ? "Você não pode deletar a si mesmo"
                                                        : "Deletar usuário"}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filteredUsers.length === 0 && (
                            <Card className="col-span-full">
                                <CardContent className="py-10 text-center text-muted-foreground">
                                    Nenhum usuário encontrado.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TooltipProvider>
            )}
        </div>
    );
};
