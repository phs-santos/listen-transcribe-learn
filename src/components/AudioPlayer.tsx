import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Pause, Play, Download } from "lucide-react";
import { cn } from "@/lib/utils"; // caso esteja usando clsx/cn para classes condicionais

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
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
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
        <div className="space-y-5">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="relative w-full h-3 bg-muted rounded-full cursor-pointer"
                >
                    <div
                        className="absolute top-0 left-0 h-3 bg-primary rounded-full"
                        style={{
                            width: `${(currentTime / duration) * 100 || 0}%`,
                        }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={resetAudio}
                        className="border-border hover:border-primary"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                        size="icon"
                        onClick={togglePlay}
                        className="bg-primary hover:bg-primary-dark text-white w-14 h-14 rounded-full"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6 ml-1" />
                        )}
                    </Button>
                </div>

                {/* Speed & Download */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Velocidade */}
                    <div className="flex items-center gap-2 text-sm">
                        <label
                            htmlFor="speed"
                            className="text-muted-foreground"
                        >
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

                    {/* Download */}
                    <Button
                        variant="ghost"
                        className="text-primary hover:underline gap-2"
                        asChild
                    >
                        <a
                            href={src}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="w-4 h-4" />
                            Baixar
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
};
