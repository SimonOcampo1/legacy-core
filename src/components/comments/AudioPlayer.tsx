import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AudioPlayerProps {
    src: string;
    className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className={cn("flex items-center gap-3 w-full max-w-md", className)}>
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button - Boxy & High Contrast */}
            <button
                onClick={togglePlay}
                className="w-8 h-8 flex items-center justify-center border border-black dark:border-white text-black dark:text-white hover:bg-gold hover:text-white dark:hover:text-black hover:border-gold transition-all shrink-0 bg-transparent"
                type="button"
            >
                {isPlaying ? (
                    <Pause className="w-3 h-3 fill-current" />
                ) : (
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
            </button>

            {/* Progress & Time */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-black dark:text-white leading-none">
                    <span className="opacity-50">VOICE_LOG</span>
                    <span className="opacity-75">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>

                <div className="relative h-1.5 w-full bg-gray-200 dark:bg-white/10 cursor-pointer group border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                        className="h-full bg-gold transition-all duration-100 ease-linear relative"
                        style={{ width: `${progressPercentage}%` }}
                    >
                        {/* Optional cleanup: removed the dot handle for purely boxy look, or keep it square */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* Mute Button */}
            <button
                onClick={toggleMute}
                className="p-1.5 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                type="button"
            >
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
        </div>
    );
}
