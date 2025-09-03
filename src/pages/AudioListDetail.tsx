import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAudioLists } from "@/hooks/use-audio-lists";
import { AudioCard } from "@/components/AudioCard";
import { AudioModal } from "@/components/AudioModal";
import { Loader2 } from "lucide-react";
import { AudioItem } from "@/hooks/use-audios-in-list";

export function AudioListDetail() {
    const { id } = useParams();
    const { getById } = useAudioLists();
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        getById(Number(id))
            .then((data) => setAudios(data.audios || []))
            .finally(() => setLoading(false));
    }, [id, getById]);

    const handleAudioPlay = (audio: any) => {
        setSelectedAudio(audio);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAudio(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Áudios da Lista #{id}</h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : audios.length === 0 ? (
                <p className="text-muted-foreground">
                    Nenhum áudio encontrado nesta lista.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {audios.map((audio) => (
                        <AudioCard
                            key={audio.id}
                            id={String(audio.id)}
                            title={audio.title || "Sem título"}
                            duration={`${audio.duration || 0}s`}
                            description={audio.external_id || undefined}
                            onPlay={() => handleAudioPlay(audio)}
                        />
                    ))}
                </div>
            )}

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
