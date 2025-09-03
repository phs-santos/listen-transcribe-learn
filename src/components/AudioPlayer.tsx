// Novo componente para Player de Audio com velocidade e seek bar clicável
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Pause, Play } from "lucide-react";

interface AudioPlayerProps {
    src: string;
}

export const AudioPlayer = ({ src }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", () => setIsPlaying(false));

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", () => setIsPlaying(false));
        };
    }, [src]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const resetAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressBarRef.current;
        const audio = audioRef.current;
        if (!bar || !audio) return;
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percent = clickX / width;
        const newTime = percent * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="space-y-4">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Progress Bar */}
            <div className="w-full">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="relative w-full h-3 rounded-full bg-secondary cursor-pointer"
                >
                    <div
                        className="absolute top-0 left-0 h-3 bg-gradient-primary rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
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
                        className="bg-gradient-primary hover:shadow-glow w-16 h-16 rounded-full"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6 ml-1" />
                        )}
                    </Button>
                </div>

                {/* Playback Rate */}
                <div className="text-sm flex items-center gap-2">
                    <label htmlFor="speed" className="text-muted-foreground">
                        Velocidade:
                    </label>
                    <select
                        id="speed"
                        value={playbackRate}
                        onChange={(e) =>
                            setPlaybackRate(parseFloat(e.target.value))
                        }
                        className="bg-background border border-border rounded px-2 py-1 text-foreground"
                    >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
