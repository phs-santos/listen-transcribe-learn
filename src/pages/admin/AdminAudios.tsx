import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Music } from "lucide-react";

import { useAudioLists, type AudioList } from "@/hooks/use-audio-lists";
import { useAudiosInList } from "@/hooks/use-audios-in-list";
import { CreateAudioListModal } from "@/components/admin/CreateAudioListModal";
import { GenerateAudiosModal } from "@/components/admin/GenerateAudiosModal";
import { EditAudioListModal } from "@/components/admin/EditAudioListModal";
import { AudioInListCard } from "@/components/admin/audios/AudioInListCard";
import ListCard from "@/components/admin/audios/ListCard";

function formatDatetime(str?: string) {
    if (!str) return "—";
    const d = new Date(str);
    if (isNaN(d.getTime())) return "—";
    return `${d.toLocaleDateString("pt-BR")} ${d.toTimeString().slice(0, 5)}`;
}

export const AdminAudios = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [genOpen, setGenOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedList, setSelectedList] = useState<AudioList | null>(null);
    const [editingList, setEditingList] = useState<AudioList | null>(null);

    const { lists, listAll, deleteList, getById } = useAudioLists();
    const { audios, load, deleteAudio } = useAudiosInList(
        selectedList?.id ?? null
    );

    useEffect(() => {
        listAll();
    }, [listAll]);

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

    const handleConfirmDeleteList = useCallback(
        async (l: AudioList) => {
            await deleteList(l.id);
            if (selectedList?.id === l.id) setSelectedList(null);
        },
        [deleteList, selectedList?.id]
    );

    const handleEditList = useCallback((list: AudioList) => {
        setEditingList(list);
        setEditOpen(true);
    }, []);

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
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]">
                {filteredLists.map((l) => (
                    <ListCard
                        key={String(l.id)}
                        list={l}
                        setSelectedList={setSelectedList}
                        onConfirmDeleteList={handleConfirmDeleteList}
                        onEditList={handleEditList}
                    />
                ))}

                {filteredLists.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed rounded-xl">
                        <Search className="w-10 h-10 mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                            Nenhuma lista encontrada
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Tente ajustar os filtros ou criar uma nova lista.
                        </p>
                    </div>
                )}
            </div>

            {/* List detail (áudios) */}
            {selectedList && (
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>
                                {selectedList.notes || "Sem notas"}
                            </CardTitle>
                            <CardDescription className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                                <span>{selectedList.accountcode}</span>
                                <span>
                                    {formatDatetime(selectedList.start_date)} →{" "}
                                    {formatDatetime(selectedList.end_date)}
                                </span>
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
                                    <AudioInListCard
                                        key={String(
                                            a.id ?? a.external_id ?? a.url
                                        )}
                                        audio={a}
                                        selectedListId={selectedList.id}
                                        onConfirmDelete={() =>
                                            deleteAudio(selectedList.id, a.id)
                                        }
                                    />
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
                    getById(id).then((created) => {
                        setSelectedList(created);
                    });
                }}
            />

            {selectedList && (
                <GenerateAudiosModal
                    open={genOpen}
                    onClose={() => setGenOpen(false)}
                    list={selectedList}
                    onSaved={async () => {
                        const fresh = await getById(selectedList.id);

                        if (
                            JSON.stringify(fresh) !==
                            JSON.stringify(selectedList)
                        ) {
                            setSelectedList(fresh);
                        }

                        await load();
                    }}
                />
            )}

            <EditAudioListModal
                open={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    setEditingList(null);
                }}
                list={editingList}
            />
        </div>
    );
};
