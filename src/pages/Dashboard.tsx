import { useEffect, useMemo, useState } from "react";
import { useAudioLists } from "@/hooks/use-audio-lists";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Utilitário para converter segundos em hh:mm:ss
function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [
        hrs.toString().padStart(2, "0"),
        mins.toString().padStart(2, "0"),
        secs.toString().padStart(2, "0"),
    ].join(":");
}

export const Dashboard = () => {
    const { lists, listAll, loading } = useAudioLists();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    useEffect(() => {
        listAll();
    }, [listAll]);

    const filtered = lists.filter((list) =>
        list.notes?.toLowerCase().includes(search.toLowerCase())
    );

    const totals = useMemo(() => {
        let totalAudios = 0;
        let totalSeconds = 0;

        for (const list of lists) {
            totalAudios += Number(list.totalAudios || 0);
            totalSeconds += Number(list.totalDuration || 0);
        }

        return {
            totalAudios,
            totalFormattedDuration: formatDuration(totalSeconds),
        };
    }, [lists]);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Minhas listas</h1>
                    <p className="text-muted-foreground mt-2">
                        Selecione uma lista de áudios para gerenciar.
                    </p>
                </div>
            </div>

            {/* Totais */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {totals.totalAudios}
                        </CardTitle>
                        <CardDescription>Total de Áudios</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {totals.totalFormattedDuration}
                        </CardTitle>
                        <CardDescription>Duração Total</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Filtro */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por notas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Listas */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                {filtered.map((list) => {
                    const qtd = Number(list.totalAudios || 0);
                    const duration = Number(list.totalDuration || 0);

                    return (
                        <Card key={list.id}>
                            <CardHeader>
                                <CardTitle className="truncate">
                                    {list.notes || "Lista sem título"}
                                </CardTitle>
                                <CardDescription>
                                    {new Date(
                                        list.start_date
                                    ).toLocaleDateString()}{" "}
                                    →{" "}
                                    {new Date(
                                        list.end_date
                                    ).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex flex-col gap-1 items-start">
                                <p className="text-sm text-muted-foreground">
                                    <strong>{qtd}</strong> áudios
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <strong>{formatDuration(duration)}</strong>{" "}
                                    de áudio
                                </p>

                                <Button
                                    size="sm"
                                    onClick={() =>
                                        navigate(`/audio-lists/${list.id}`)
                                    }
                                    className="mt-2"
                                >
                                    Abrir Lista
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {loading && (
                <p className="text-sm text-muted-foreground">Carregando…</p>
            )}
        </div>
    );
};
