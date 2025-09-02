import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AudioCard } from "@/components/AudioCard";
import { AudioModal } from "@/components/AudioModal";
import { Upload, Search, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const mockAudios = [
    {
        id: "1",
        title: "Meditação Matinal",
        description: "Uma sessão relaxante para começar o dia",
        duration: "15:32",
        category: "Meditação",
        imageUrl: "/src/assets/audio-hero.jpg",
    },
    {
        id: "2",
        title: "Foco e Concentração",
        description: "Técnicas para melhorar o foco no trabalho",
        duration: "22:15",
        category: "Produtividade",
        imageUrl: "/src/assets/audio-hero.jpg",
    },
    {
        id: "3",
        title: "Relaxamento Noturno",
        description: "Sons para uma noite tranquila de sono",
        duration: "45:00",
        category: "Sono",
        imageUrl: "/src/assets/audio-hero.jpg",
    },
];

export const Dashboard = () => {
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAudio, setSelectedAudio] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredAudios = mockAudios.filter(
        (audio) =>
            audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audio.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAudioPlay = (audio: any) => {
        setSelectedAudio(audio);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAudio(null);
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar áudios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-bold text-primary">
                                12
                            </CardTitle>
                            <CardDescription>
                                Áudios Disponíveis
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-bold text-primary">
                                3.5h
                            </CardTitle>
                            <CardDescription>
                                Tempo Total Ouvido
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-bold text-primary">
                                85%
                            </CardTitle>
                            <CardDescription>Progresso Mensal</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Audio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAudios.map((audio) => (
                        <AudioCard
                            key={audio.id}
                            id={audio.id}
                            title={audio.title}
                            duration={audio.duration}
                            description={audio.description}
                            onPlay={() => handleAudioPlay(audio)}
                        />
                    ))}
                </div>
            </main>

            {/* Audio Modal */}
            {selectedAudio && (
                <AudioModal
                    audioTitle={selectedAudio.title}
                    audioSrc="/path/to/audio.mp3"
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};
