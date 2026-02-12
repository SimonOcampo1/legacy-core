import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
    src: string;
    className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('canplay', handleCanPlay);
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
        <div className={cn("flex items-center gap-3 p-1.5 pr-4 bg-stone-100/50 dark:bg-stone-900/30 rounded-full border border-stone-200/50 dark:border-stone-800/50 w-full max-w-[240px] group/player transition-all hover:bg-stone-100 dark:hover:bg-stone-900/50", className)}>
            <audio ref={audioRef} src={src} preload="metadata" />

            <button
                onClick={togglePlay}
                disabled={isLoading}
                className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-charcoal dark:bg-white text-white dark:text-charcoal shadow-sm transition-all active:scale-95 disabled:opacity-50"
                type="button"
            >
                {isLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : isPlaying ? (
                    <Pause size={12} fill="currentColor" />
                ) : (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                )}
            </button>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div
                    ref={progressRef}
                    className="h-1 bg-stone-200 dark:bg-stone-800 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleProgressClick}
                >
                    <motion.div
                        className="absolute left-0 top-0 h-full bg-[#C5A059] rounded-full"
                        animate={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                </div>
                <div className="flex justify-between text-[9px] font-bold tracking-widest text-stone-400 dark:text-stone-600 uppercase">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <button
                onClick={toggleMute}
                className="flex-shrink-0 text-stone-300 dark:text-stone-700 hover:text-[#C5A059] transition-colors"
                type="button"
            >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
        </div>
    );
}
