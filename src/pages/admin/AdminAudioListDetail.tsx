import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAudioLists } from "@/hooks/use-audio-lists";
import { AudioCard } from "@/components/AudioCard";
import { AudioModal } from "@/components/AudioModal";
import { Loader2, Search } from "lucide-react";
import { AudioItem } from "@/hooks/use-audios-in-list";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatDuration(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}min`;
}

export function AdminAudioListDetail() {
    const { id } = useParams();
    const { getById } = useAudioLists();
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        getById(Number(id))
            .then((data) => setAudios(data.audios || []))
            .finally(() => setLoading(false));
    }, [id, getById]);

    const filtered = useMemo(() => {
        return audios.filter((audio) => {
            const q = search.toLowerCase();
            return (
                audio.title?.toLowerCase().includes(q) ||
                audio.external_id?.toLowerCase().includes(q) ||
                audio.linkedid?.toLowerCase().includes(q)
            );
        });
    }, [audios, search]);

    const totalAudios = audios.length;
    const transcribedCount = audios.filter((a) => !!a.transcript_human).length;
    const totalDuration = audios.reduce((sum, a) => sum + (a.duration || 0), 0);

    const handleAudioPlay = (audio: AudioItem) => {
        setSelectedAudio(audio);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAudio(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">
                        Áudios da Lista #{id}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie os áudios desta lista
                    </p>
                </div>
            </div>

            {/* Totais */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {totalAudios}
                        </CardTitle>
                        <CardDescription>Total de Áudios</CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {transcribedCount}
                        </CardTitle>
                        <CardDescription>Áudios transcritos</CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold text-primary">
                            {formatDuration(totalDuration)}
                        </CardTitle>
                        <CardDescription>Duração Total</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Filtro */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por título, linkedid ou external_id..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Áudios */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-muted-foreground">
                    Nenhum áudio encontrado.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-4">
                    {filtered.map((audio) => (
                        <AudioCard
                            key={audio.id}
                            id={audio.id}
                            title={audio.title || "Sem título"}
                            duration={`${audio.duration || 0}s`}
                            description={audio.external_id || undefined}
                            onPlay={() => handleAudioPlay(audio)}
                            hasHumanTranscript={!!audio.transcript_human}
                            hasAiTranscript={!!audio.transcript_ai}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedAudio && (
                <AudioModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    audioId={selectedAudio.id}
                    listId={Number(id)}
                    transcript_human={selectedAudio.transcript_human}
                    transcript_ai={selectedAudio.transcript_ai}
                    audioTitle={
                        selectedAudio.title ||
                        selectedAudio.linkedid ||
                        "Sem título"
                    }
                    audioSrc={selectedAudio.url}
                />
            )}
        </div>
    );
}
