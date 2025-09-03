import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Save, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAudiosInList } from "@/hooks/use-audios-in-list";
import { AudioPlayer } from "./AudioPlayer";

interface AudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    audioId: number;
    audioTitle: string;
    audioSrc: string;
    listId: number;
}

export const AudioModal = ({
    isOpen,
    onClose,
    audioId,
    audioTitle,
    audioSrc,
    listId,
}: AudioModalProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();
    const { saveHumanTranscript, saveAiTranscript } = useAudiosInList(listId);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [userTranscription, setUserTranscription] = useState("");
    const [llmTranscription, setLlmTranscription] = useState("");

    const [isGenerating, setIsGenerating] = useState(false);
    const [isTranscriptionSaved, setIsTranscriptionSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", () => setIsPlaying(false));

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", () => setIsPlaying(false));
        };
    }, [audioSrc]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const resetAudio = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const handleSaveTranscription = async () => {
        if (!userTranscription.trim()) {
            toast({
                title: "Erro",
                description: "Digite uma transcrição antes de salvar.",
                variant: "destructive",
            });
            return;
        }

        try {
            await saveHumanTranscript(audioId, userTranscription);
            toast({
                title: "Sucesso",
                description: "Transcrição salva com sucesso!",
            });
            setIsTranscriptionSaved(true);
            setIsEditing(false);
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: "Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const handleEditTranscription = () => setIsEditing(true);

    const generateLLMTranscription = async () => {
        setIsGenerating(true);
        try {
            const aiResult =
                "Esta é uma transcrição gerada automaticamente pela IA. (exemplo)";
            await saveAiTranscript(audioId, aiResult);
            setLlmTranscription(aiResult);
            toast({
                title: "Transcrição IA gerada",
                description: "Texto salvo com sucesso.",
            });
        } catch (err) {
            toast({
                title: "Erro ao gerar transcrição da IA",
                description: "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl bg-background border-border/50 backdrop-blur-glass">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        {audioTitle}
                    </DialogTitle>

                    <DialogDescription className="text-sm text-muted-foreground">
                        Transcreva o áudio abaixo com atenção.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Left - Audio Player */}
                    <div className="lg:w-1/2">
                        <Card className="p-5 bg-gradient-card border-border/50 h-full">
                            <h3 className="text-base font-medium mb-3 text-foreground">
                                Player de Áudio
                            </h3>

                            <AudioPlayer src={audioSrc} />

                            <div className="mt-6 p-3 bg-secondary/40 rounded-md text-sm text-muted-foreground">
                                Ouça o áudio com atenção e faça sua transcrição
                                na área ao lado.
                            </div>
                        </Card>
                    </div>

                    {/* Right - Transcription */}
                    <div className="lg:w-1/2">
                        <Card className="p-5 bg-gradient-card border-border/50 h-full flex flex-col">
                            <h3 className="text-base font-medium mb-3 text-foreground">
                                Transcrição
                            </h3>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <Label
                                        htmlFor="userTranscription"
                                        className="text-sm"
                                    >
                                        Sua Transcrição
                                    </Label>
                                    <Textarea
                                        id="userTranscription"
                                        value={userTranscription}
                                        onChange={(e) =>
                                            setUserTranscription(e.target.value)
                                        }
                                        readOnly={
                                            isTranscriptionSaved && !isEditing
                                        }
                                        placeholder="Digite sua transcrição aqui..."
                                        className="min-h-[160px] mt-2 text-sm font-mono"
                                    />
                                </div>

                                {!isTranscriptionSaved || isEditing ? (
                                    <Button onClick={handleSaveTranscription}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Transcrição
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={handleEditTranscription}
                                    >
                                        Editar Transcrição
                                    </Button>
                                )}

                                {isTranscriptionSaved && !isEditing && (
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <Label className="text-sm">
                                                Transcrição da IA
                                            </Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    generateLLMTranscription
                                                }
                                                disabled={isGenerating}
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                {isGenerating
                                                    ? "Gerando..."
                                                    : "Gerar IA"}
                                            </Button>
                                        </div>

                                        <div className="p-3 bg-background/50 border rounded-md min-h-[100px] text-sm">
                                            {llmTranscription ? (
                                                <p>{llmTranscription}</p>
                                            ) : (
                                                <p className="text-muted-foreground italic">
                                                    Clique em "Gerar IA" para
                                                    transcrever automaticamente
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
