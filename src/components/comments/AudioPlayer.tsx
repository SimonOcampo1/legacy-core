import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AudioPlayerProps {
    src: string;
    className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
        };

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        // Preload metadata
        audio.preload = "metadata";

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

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

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const progress = progressRef.current;
        if (!audio || !progress) return;

        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * duration;
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn("flex items-center gap-3 p-2 pr-4 bg-stone-50 rounded-full border border-stone-200 w-full max-w-xs", className)}>
            <audio ref={audioRef} src={src} />

            <button
                onClick={togglePlay}
                className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                type="button"
            >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div
                    ref={progressRef}
                    className="h-1.5 bg-stone-200 rounded-full cursor-pointer relative overflow-hidden group"
                    onClick={handleProgressClick}
                >
                    <div
                        className="absolute left-0 top-0 h-full bg-emerald-600 rounded-full transition-all duration-100 group-hover:bg-emerald-500"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <button
                onClick={toggleMute}
                className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
                type="button"
            >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
        </div>
    );
}
