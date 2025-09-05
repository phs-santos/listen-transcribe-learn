import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, FileText, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AudioItem } from "@/types/audio-list";

interface TranscriptionData {
    id: number;
    audioTitle: string;
    userEmail: string;
    transcribedAt: string;
    humanTranscription?: string;
    aiTranscription?: string;
    duration: string;
}

interface TranscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transcription: AudioItem | null;
}

export const TranscriptionModal = ({
    isOpen,
    onClose,
    transcription,
}: TranscriptionModalProps) => {
    if (!transcription) return null;

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado!",
            description: `${type} copiada para a área de transferência.`,
        });
    };

    const downloadTranscription = (text: string, type: string) => {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${transcription.title}-${type.toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] bg-background border-border/50 backdrop-blur-glass">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {transcription.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Transcrito por {transcription.transcriber.name} em{" "}
                        {new Date(transcription.updated_at).toLocaleString(
                            "pt-BR"
                        )}
                        {" • "}Duração: {transcription.duration}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Human Transcription */}
                    {transcription.transcript_human && (
                        <Card className="p-6 bg-gradient-card border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Transcrição Humana
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(
                                                transcription.transcript_human!,
                                                "Transcrição humana"
                                            )
                                        }
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            downloadTranscription(
                                                transcription.transcript_human!,
                                                "Humana"
                                            )
                                        }
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {transcription.transcript_human}
                            </div>
                        </Card>
                    )}

                    {/* AI Transcription */}
                    {transcription.transcript_ai && (
                        <Card className="p-6 bg-gradient-card border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                                    <Bot className="w-5 h-5" />
                                    Transcrição da IA
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(
                                                transcription.transcript_ai!,
                                                "Transcrição da IA"
                                            )
                                        }
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            downloadTranscription(
                                                transcription.transcript_ai!,
                                                "IA"
                                            )
                                        }
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {transcription.transcript_ai}
                            </div>
                        </Card>
                    )}

                    {!transcription.transcript_human &&
                        !transcription.transcript_ai && (
                            <Card className="p-8 text-center bg-gradient-card border-border/50">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    Nenhuma transcrição disponível
                                </h3>
                                <p className="text-muted-foreground">
                                    Este áudio ainda não possui transcrições
                                    salvas.
                                </p>
                            </Card>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
