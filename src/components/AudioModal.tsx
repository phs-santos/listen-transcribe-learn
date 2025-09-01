import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Save, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioTitle: string;
  audioSrc: string;
}

export const AudioModal = ({ isOpen, onClose, audioTitle, audioSrc }: AudioModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [userTranscription, setUserTranscription] = useState("");
  const [llmTranscription, setLlmTranscription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscriptionSaved, setIsTranscriptionSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [audioSrc]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSaveTranscription = () => {
    if (!userTranscription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma transcrição antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscriptionSaved(true);
    setIsEditing(false);
    
    toast({
      title: "Sucesso",
      description: "Transcrição salva com sucesso!",
    });
    
    // Here you would typically save to a backend
    console.log("Saving transcription:", userTranscription);
  };

  const handleEditTranscription = () => {
    setIsEditing(true);
  };

  const generateLLMTranscription = async () => {
    setIsGenerating(true);
    
    // Simulate LLM processing
    setTimeout(() => {
      setLlmTranscription("Esta é uma transcrição gerada automaticamente pela IA. Em uma implementação real, isso seria conectado a uma API de transcrição como Whisper ou Google Speech-to-Text.");
      setIsGenerating(false);
      toast({
        title: "Transcrição gerada",
        description: "A IA terminou de processar o áudio.",
      });
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] bg-background border-border/50 backdrop-blur-glass">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {audioTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Side - Audio Player */}
          <div className="lg:w-1/2">
            <Card className="p-6 h-full bg-gradient-card border-border/50">
              <h3 className="text-lg font-medium mb-4 text-foreground">Player de Áudio</h3>
              
              <audio ref={audioRef} src={audioSrc} preload="metadata" />
              
              {/* Audio Controls */}
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-primary rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetAudio}
                    className="border-border/50 hover:border-primary/50"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={togglePlay}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-200 w-16 h-16 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Audio Info */}
              <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Ouça o áudio com atenção e faça sua transcrição na área ao lado.
                  Você também pode gerar uma transcrição automática usando IA.
                </p>
              </div>
            </Card>
          </div>
          
          {/* Right Side - Transcription */}
          <div className="lg:w-1/2">
            <Card className="p-6 h-full bg-gradient-card border-border/50">
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-medium mb-4 text-foreground">Transcrição</h3>
                
                {/* User Transcription */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="userTranscription" className="text-foreground">
                        Sua Transcrição
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        Formatação: **negrito** *itálico* __sublinhado__
                      </div>
                    </div>
                    <Textarea
                      id="userTranscription"
                      placeholder="Digite aqui a transcrição do áudio...&#10;&#10;Formatação disponível:&#10;• **texto em negrito**&#10;• *texto em itálico*&#10;• __texto sublinhado__&#10;• [link](url)&#10;&#10;Organização:&#10;• Use quebras de linha para separar ideias&#10;• Para tags: categoria/subcategoria&#10;• Exemplo: entrega/mercado livre"
                      value={userTranscription}
                      onChange={(e) => setUserTranscription(e.target.value)}
                      readOnly={isTranscriptionSaved && !isEditing}
                      className={`mt-2 min-h-[180px] bg-background/50 border-border/50 focus:border-primary/50 font-mono text-sm leading-relaxed ${
                        isTranscriptionSaved && !isEditing ? 'cursor-default opacity-75' : ''
                      }`}
                    />
                    <div className="mt-2 p-3 bg-secondary/30 rounded-md border border-border/30">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Preview da formatação:</p>
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {userTranscription ? (
                          <div dangerouslySetInnerHTML={{
                            __html: userTranscription
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/__(.*?)__/g, '<u>$1</u>')
                              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
                          }} />
                        ) : (
                          <span className="text-muted-foreground italic">Digite no campo acima para ver o preview...</span>
                        )} 
                      </div>
                    </div>
                  </div>
                  
                  {!isTranscriptionSaved || isEditing ? (
                    <Button 
                      onClick={handleSaveTranscription}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Transcrição
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEditTranscription}
                      variant="outline"
                      className="border-border/50 hover:border-primary/50"
                    >
                      Editar Transcrição
                    </Button>
                  )}
                  
                  {/* LLM Transcription - Only show when user transcription is saved and not editing */}
                  {isTranscriptionSaved && !isEditing && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-foreground">Transcrição da IA</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateLLMTranscription}
                          disabled={isGenerating}
                          className="border-border/50 hover:border-primary/50"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {isGenerating ? "Gerando..." : "Gerar IA"}
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-background/50 rounded-lg border border-border/50 min-h-[120px]">
                        {isGenerating ? (
                          <div className="flex items-center justify-center h-24">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="ml-2 text-muted-foreground">Processando áudio...</span>
                          </div>
                        ) : llmTranscription ? (
                          <p className="text-foreground text-sm leading-relaxed">
                            {llmTranscription}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-sm italic">
                            Clique em "Gerar IA" para obter uma transcrição automática
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};