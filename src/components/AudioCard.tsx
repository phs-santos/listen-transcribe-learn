import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, FileAudio, Bot, UserCheck, XCircle } from "lucide-react";

interface AudioCardProps {
    id: number;
    title: string;
    duration: string;
    description?: string;
    onPlay: () => void;
    hasHumanTranscript?: boolean;
    hasAiTranscript?: boolean;
}

export const AudioCard = ({
    id,
    title,
    duration,
    description,
    onPlay,
    hasHumanTranscript = false,
    hasAiTranscript = false,
}: AudioCardProps) => {
    return (
        <Card className="group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.015] cursor-pointer">
            <div className="p-5 space-y-4" onClick={() => onPlay()}>
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileAudio className="w-10 h-10" />
                    </div>
                </div>

                {/* Transcription Tags - Always visible */}
                <div className="flex gap-2">
                    <div
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md
                            ${
                                hasHumanTranscript
                                    ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                                    : "text-red-600 bg-red-100 dark:bg-red-900/30"
                            }
                        `}
                    >
                        <UserCheck className="w-3 h-3" />
                        Humana
                    </div>
                    <div
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md
                            ${
                                hasAiTranscript
                                    ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                                    : "text-red-600 bg-red-100 dark:bg-red-900/30"
                            }
                        `}
                    >
                        <Bot className="w-3 h-3" />
                        IA
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {duration}
                    </div>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlay();
                        }}
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Transcrever
                    </Button>
                </div>
            </div>
        </Card>
    );
};
