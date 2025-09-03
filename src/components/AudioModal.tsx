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
import { Save, Copy, FileText, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { AudioPlayer } from "./AudioPlayer";
import { useAudiosInList } from "@/hooks/use-audios-in-list";

interface AudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    audioId: number;
    audioTitle: string;
    audioSrc: string;
    transcript_human?: string | null;
    transcript_ai?: string | null;
    listId: number;
    tags?: string[];
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
    const [humanTranscription, setHumanTranscription] = useState("");
    const [aiTranscription, setAiTranscription] = useState("");
    const [isHumanSaved, setIsHumanSaved] = useState(false);
    const [isEditingHuman, setIsEditingHuman] = useState(false);
    const [activeTab, setActiveTab] = useState<"human" | "ai">("human");

    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");

    const suggestedTags = [
        "cliente",
        "reclamação",
        "elogio",
        "urgente",
        "retorno",
    ];

    const { saveAiTranscript, saveHumanTranscript } = useAudiosInList(listId);

    useEffect(() => {
        if (isOpen) {
            setHumanTranscription(transcript_human || "");
            setAiTranscription(transcript_ai || "");
            setIsHumanSaved(!!transcript_human);
            setIsEditingHuman(!transcript_human);
            setActiveTab("human");
            setTags([]); // ← sempre reinicia vazio
            setNewTag("");
        }
    }, [isOpen, transcript_human, transcript_ai]);

    const sanitizeTag = (tag: string): string | null => {
        const cleaned = tag.trim().toLowerCase();
        if (
            !cleaned ||
            cleaned.length < 2 ||
            cleaned.length > 30 ||
            /[^a-zA-Z0-9áéíóúàèìòùãõç\s-]/.test(cleaned) ||
            tags.includes(cleaned)
        ) {
            return null;
        }
        return cleaned;
    };

    const handleSaveHumanTranscription = async () => {
        if (!humanTranscription.trim()) {
            toast({
                title: "Erro",
                description: "Digite uma transcrição antes de salvar.",
                variant: "destructive",
            });
            return;
        }

        try {
            const validTags = tags
                .map(sanitizeTag)
                .filter((t): t is string => !!t);

            await saveHumanTranscript(audioId, humanTranscription, validTags);
            toast({
                title: "Sucesso",
                description: "Transcrição humana salva com sucesso!",
            });
            setIsHumanSaved(true);
            setIsEditingHuman(false);
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: "Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const handleSaveAiTranscription = async () => {
        if (!aiTranscription.trim()) {
            toast({
                title: "Erro",
                description: "Cole a transcrição da IA antes de salvar.",
                variant: "destructive",
            });
            return;
        }

        try {
            await saveAiTranscript(audioId, aiTranscription);
            toast({
                title: "Sucesso",
                description: "Transcrição da IA salva com sucesso!",
            });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: "Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado!",
            description: `${type} copiada para a área de transferência.`,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-background border-border/50 backdrop-blur-glass">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        {audioTitle}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Gerencie as transcrições humana e de IA para este áudio.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row gap-6 h-full">
                    {/* Player */}
                    <div className="lg:w-1/3">
                        <Card className="p-6 bg-gradient-card border-border/50 h-full">
                            <h3 className="text-lg font-medium mb-4 text-foreground flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Player de Áudio
                            </h3>
                            <AudioPlayer src={audioSrc} />
                            <div className="mt-6 p-4 bg-secondary/40 rounded-lg text-sm text-muted-foreground">
                                <p className="font-medium mb-2">Dicas:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Use controles de velocidade</li>
                                    <li>• Pause frequentemente</li>
                                    <li>• Volte quantas vezes precisar</li>
                                </ul>
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="lg:w-2/3">
                        <div className="flex bg-muted/30 rounded-lg p-1 mb-4">
                            <button
                                onClick={() => setActiveTab("human")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                    activeTab === "human"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                Transcrição Humana
                            </button>
                            <button
                                onClick={() => setActiveTab("ai")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                    activeTab === "ai"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Bot className="w-4 h-4" />
                                Transcrição da IA
                            </button>
                        </div>

                        {/* HUMAN TAB */}
                        {activeTab === "human" && (
                            <Card className="p-6 bg-gradient-card border-border/50 h-[500px] flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium flex gap-2 text-foreground">
                                        <FileText className="w-5 h-5" />
                                        Transcrição Humana
                                    </h3>
                                    {humanTranscription && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                copyToClipboard(
                                                    humanTranscription,
                                                    "Transcrição humana"
                                                )
                                            }
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copiar
                                        </Button>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col overflow-auto">
                                    <Label
                                        htmlFor="humanTranscription"
                                        className="text-sm mb-2"
                                    >
                                        Digite sua transcrição manual
                                    </Label>
                                    <Textarea
                                        id="humanTranscription"
                                        value={humanTranscription}
                                        onChange={(e) =>
                                            setHumanTranscription(
                                                e.target.value
                                            )
                                        }
                                        readOnly={
                                            isHumanSaved && !isEditingHuman
                                        }
                                        placeholder="Digite aqui sua transcrição precisa do áudio..."
                                        className="flex-1 min-h-[200px] text-sm font-mono resize-none"
                                    />

                                    {/* TAGS */}
                                    <div className="mt-4">
                                        <Label className="text-sm mb-1 block">
                                            Tags
                                        </Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-muted px-2 py-1 text-xs rounded-full flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() =>
                                                            setTags(
                                                                tags.filter(
                                                                    (
                                                                        _,
                                                                        index
                                                                    ) =>
                                                                        index !==
                                                                        i
                                                                )
                                                            )
                                                        }
                                                        className="text-xs text-destructive hover:underline"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 items-center mb-2">
                                            <input
                                                type="text"
                                                placeholder="Nova tag"
                                                value={newTag}
                                                onChange={(e) =>
                                                    setNewTag(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const sanitized =
                                                            sanitizeTag(newTag);
                                                        if (sanitized) {
                                                            setTags([
                                                                ...tags,
                                                                sanitized,
                                                            ]);
                                                        }
                                                        setNewTag("");
                                                    }
                                                }}
                                                className="border border-border bg-background rounded px-2 py-1 text-sm"
                                            />
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const sanitized =
                                                        sanitizeTag(newTag);
                                                    if (sanitized) {
                                                        setTags([
                                                            ...tags,
                                                            sanitized,
                                                        ]);
                                                    }
                                                    setNewTag("");
                                                }}
                                            >
                                                Adicionar
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            {suggestedTags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        const sanitized =
                                                            sanitizeTag(tag);
                                                        if (sanitized) {
                                                            setTags([
                                                                ...tags,
                                                                sanitized,
                                                            ]);
                                                        }
                                                    }}
                                                    className="bg-muted/40 px-2 py-1 rounded hover:bg-muted/70"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Botões Fixos */}
                                <div className="pt-4 border-t mt-4 flex gap-2">
                                    {!isHumanSaved || isEditingHuman ? (
                                        <Button
                                            onClick={
                                                handleSaveHumanTranscription
                                            }
                                            className="flex-1"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Salvar Transcrição
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setIsEditingHuman(true)
                                            }
                                            className="flex-1"
                                        >
                                            Editar Transcrição
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* AI TAB */}
                        {activeTab === "ai" && (
                            <Card className="p-6 bg-gradient-card border-border/50 h-[500px] flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-foreground flex gap-2">
                                        <Bot className="w-5 h-5" />
                                        Transcrição da IA
                                    </h3>
                                    {aiTranscription && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                copyToClipboard(
                                                    aiTranscription,
                                                    "Transcrição da IA"
                                                )
                                            }
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copiar
                                        </Button>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col overflow-auto">
                                    <Label
                                        htmlFor="aiTranscription"
                                        className="text-sm mb-2"
                                    >
                                        Cole aqui a transcrição gerada pela IA
                                    </Label>
                                    <Textarea
                                        id="aiTranscription"
                                        value={aiTranscription}
                                        onChange={(e) =>
                                            setAiTranscription(e.target.value)
                                        }
                                        placeholder="Cole aqui o texto gerado por Whisper, Google STT, etc..."
                                        className="flex-1 min-h-[200px] text-sm font-mono resize-none"
                                    />
                                </div>

                                <div className="pt-4 border-t mt-4 flex gap-2">
                                    <Button
                                        onClick={handleSaveAiTranscription}
                                        className="flex-1"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Transcrição da IA
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
