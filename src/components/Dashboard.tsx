import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioCard } from "./AudioCard";
import { AudioModal } from "./AudioModal";
import { Headphones, Search, LogOut, Upload, Filter } from "lucide-react";

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

// Mock audio data
const mockAudios = [
  {
    id: "1",
    title: "Reunião de Equipe - Janeiro",
    duration: "45:32",
    description: "Discussão sobre metas e objetivos para o primeiro trimestre.",
    src: "/audio/sample1.mp3"
  },
  {
    id: "2", 
    title: "Entrevista com Cliente",
    duration: "28:15",
    description: "Feedback sobre o produto e sugestões de melhorias.",
    src: "/audio/sample2.mp3"
  },
  {
    id: "3",
    title: "Palestra - IA no Futuro",
    duration: "1:12:08",
    description: "Apresentação sobre tendências em inteligência artificial.",
    src: "/audio/sample3.mp3"
  },
  {
    id: "4",
    title: "Podcast - Tecnologia",
    duration: "35:44",
    description: "Discussão sobre as últimas novidades em tech.",
    src: "/audio/sample4.mp3"
  },
  {
    id: "5",
    title: "Aula Online - Marketing",
    duration: "52:18", 
    description: "Estratégias de marketing digital para startups.",
    src: "/audio/sample5.mp3"
  },
  {
    id: "6",
    title: "Brainstorm Criativo",
    duration: "38:56",
    description: "Sessão de ideias para nova campanha publicitária.",
    src: "/audio/sample6.mp3"
  }
];

export const Dashboard = ({ userEmail, onLogout }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAudio, setSelectedAudio] = useState<typeof mockAudios[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAudios = mockAudios.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAudioPlay = (audioId: string) => {
    const audio = mockAudios.find(a => a.id === audioId);
    if (audio) {
      setSelectedAudio(audio);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAudio(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-glass sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Headphones className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AudioTranscribe</h1>
                <p className="text-sm text-muted-foreground">Olá, {userEmail.split('@')[0]}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-border/50 hover:border-primary/50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar áudios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              className="border-border/50 hover:border-primary/50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Áudios</p>
                <p className="text-2xl font-bold text-foreground">{mockAudios.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Transcritos</p>
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Tempo Total</p>
                <p className="text-2xl font-bold text-foreground">4h 32m</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Audio Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Seus Áudios</h2>
          
          {filteredAudios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAudios.map((audio) => (
                <AudioCard
                  key={audio.id}
                  id={parseInt(audio.id)}
                  title={audio.title}
                  duration={audio.duration}
                  description={audio.description}
                  onPlay={() => handleAudioPlay(audio.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-gradient-card border-border/50">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum áudio encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou faça upload de novos áudios.
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Audio Modal */}
      {selectedAudio && (
        <AudioModal
          isOpen={isModalOpen}
          onClose={closeModal}
          audioId={parseInt(selectedAudio.id)}
          audioTitle={selectedAudio.title}
          audioSrc={selectedAudio.src}
          listId={1}
        />
      )}
    </div>
  );
};