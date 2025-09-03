import { useEffect, useMemo, useState } from "react";
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
import { Search, Plus, ListMusic, Trash2, Music } from "lucide-react";
import { useAudioLists, type AudioList } from "@/hooks/use-audio-lists";
import { useAudiosInList } from "@/hooks/use-audios-in-list";
import { CreateAudioListModal } from "@/components/admin/CreateAudioListModal";
import { GenerateAudiosModal } from "@/components/admin/GenerateAudiosModal";

function formatDatetime(str?: string) {
    if (!str) return "—";
    const d = new Date(str);
    if (isNaN(d.getTime())) return "—";
    return `${d.toLocaleDateString("pt-BR")} ${d.toTimeString().slice(0, 5)}`; // "dd/mm/aaaa hh:mm"
}

export const AdminAudios = () => {
    const { lists, loading, error, listAll, deleteList, getById } =
        useAudioLists();
    const [searchTerm, setSearchTerm] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [genOpen, setGenOpen] = useState(false);
    const [selectedList, setSelectedList] = useState<AudioList | null>(null);

    const { audios, load, deleteAudio } = useAudiosInList(
        selectedList?.id ?? null
    );

    useEffect(() => {
        listAll();
    }, [listAll]);
    useEffect(() => {
        if (selectedList?.id) load();
    }, [selectedList?.id, load]);

    const filteredLists = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return lists.filter(
            (l) =>
                l.accountcode.toLowerCase().includes(q) ||
                (l.notes || "").toLowerCase().includes(q) ||
                formatDatetime(l.start_date).toLowerCase().includes(q) ||
                formatDatetime(l.end_date).toLowerCase().includes(q)
        );
    }, [lists, searchTerm]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Listas de Áudios</h1>
                    <p className="text-muted-foreground mt-2">
                        Crie listas por período/empresa e adicione os áudios.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Lista
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por empresa, data, notas…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Lists grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLists.map((l) => (
                    <Card key={l.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-3 pb-3">
                            <div className="h-10 w-10 rounded-md bg-muted grid place-items-center">
                                <ListMusic className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-base truncate">
                                    {l.accountcode}
                                </CardTitle>
                                <CardDescription className="truncate">
                                    {formatDatetime(l.start_date)} →{" "}
                                    {formatDatetime(l.end_date)}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{l.status}</Badge>
                                {typeof l.totalAudios === "number" && (
                                    <Badge variant="secondary">
                                        {l.totalAudios} áudios
                                    </Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                                {l.notes || "—"}
                            </div>
                            <div className="mt-auto flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={async () => {
                                        const fresh = await getById(l.id);
                                        setSelectedList(fresh);
                                    }}
                                >
                                    Abrir
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => deleteList(l.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredLists.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Nenhuma lista encontrada.
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* List detail (áudios) */}
            {selectedList && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>
                                Lista: {selectedList.accountcode}
                            </CardTitle>
                            <CardDescription>
                                {formatDatetime(selectedList.start_date)} →{" "}
                                {formatDatetime(selectedList.end_date)}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setGenOpen(true)}>
                                <Music className="h-4 w-4 mr-2" />
                                Adicionar áudios
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedList(null)}
                            >
                                Fechar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {audios.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                Nenhum áudio nesta lista.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {audios.map((a) => (
                                    <div
                                        key={a.id ?? a.url}
                                        className="rounded-lg border p-3"
                                    >
                                        <div className="font-medium truncate">
                                            {a.title || "Sem título"}
                                        </div>
                                        <a
                                            href={a.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-primary"
                                        >
                                            Abrir URL
                                        </a>
                                        <div className="mt-2 flex gap-2">
                                            <Badge variant="outline">
                                                {a.status || "draft"}
                                            </Badge>
                                        </div>
                                        <div className="mt-3">
                                            {a.id && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        a.id &&
                                                        deleteAudio(
                                                            selectedList.id,
                                                            a.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />{" "}
                                                    Remover
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modais */}
            <CreateAudioListModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={(id) => {
                    getById(id).then((fresh) => setSelectedList(fresh));
                }}
            />

            {selectedList && (
                <GenerateAudiosModal
                    open={genOpen}
                    onClose={() => setGenOpen(false)}
                    list={selectedList}
                    onSaved={() => {
                        getById(selectedList.id).then(setSelectedList);
                    }}
                />
            )}
        </div>
    );
};
