import { useEffect, useState } from "react";
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Minhas listas</h1>
                    <p className="text-muted-foreground mt-2">
                        Selecione uma lista de áudios para gerenciar.
                    </p>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por notas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((list) => (
                    <Card key={list.id}>
                        <CardHeader>
                            <CardTitle className="truncate">
                                {list.notes || "Lista sem título"}
                            </CardTitle>
                            <CardDescription>
                                {new Date(list.start_date).toLocaleDateString()}{" "}
                                → {new Date(list.end_date).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-between items-end">
                            <span className="text-sm text-muted-foreground">
                                {list.totalAudios ?? list.audios?.length ?? 0}{" "}
                                áudios
                            </span>
                            <Button
                                size="sm"
                                onClick={() =>
                                    navigate(`/audio-lists/${list.id}`)
                                }
                            >
                                Abrir Lista
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {loading && (
                <p className="text-sm text-muted-foreground">Carregando…</p>
            )}
        </div>
    );
};
