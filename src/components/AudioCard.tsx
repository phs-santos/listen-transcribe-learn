import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, FileAudio } from "lucide-react";

interface AudioCardProps {
  id: string;
  title: string;
  duration: string;
  description?: string;
  onPlay: (id: string) => void;
}

export const AudioCard = ({ id, title, duration, description, onPlay }: AudioCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:scale-105 cursor-pointer">
      <div className="p-6" onClick={() => onPlay(id)}>
        {/* Audio Icon Background */}
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FileAudio className="w-12 h-12" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {duration}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(id);
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Transcrever
            </Button>
          </div>
        </div>
        
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Card>
  );
};