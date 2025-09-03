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
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAudiosInList } from "@/hooks/use-audios-in-list";
import { AudioPlayer } from "./AudioPlayer";

interface AudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    audioId: number;
    audioTitle: string;
    audioSrc: string;
    transcript_human?: string | null;
    transcript_ai?: string | null;
    listId: number;
}

export const AudioModal = ({
    isOpen,
    onClose,
    audioId,
    audioTitle,
    audioSrc,
    transcript_human,
    transcript_ai,
    listId,
}: AudioModalProps) => {
    const { toast } = useToast();
    const { saveHumanTranscript, saveAiTranscript } = useAudiosInList(listId);

    const [userTranscription, setUserTranscription] = useState("");
    const [isTranscriptionSaved, setIsTranscriptionSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Preencher transcrição ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            setUserTranscription(transcript_human || transcript_ai || "");
            setIsTranscriptionSaved(!!transcript_human);
            setIsEditing(false);
        }
    }, [isOpen, transcript_human, transcript_ai]);

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
                                        </div>
                                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                                            {transcript_ai ||
                                                "Nenhuma transcrição automática disponível."}
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
