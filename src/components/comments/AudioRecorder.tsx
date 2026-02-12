import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, MicOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    onDelete: () => void;
    isUploading?: boolean;
}

export function AudioRecorder({ onRecordingComplete, onDelete, isUploading = false }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [audioUrl]);

    const checkMicrophone = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasMic = devices.some(device => device.kind === 'audioinput');
            if (!hasMic) {
                toast.error("No microphone detected", {
                    description: "Please connect a microphone to record audio comments.",
                    icon: <MicOff className="w-4 h-4" />
                });
                return false;
            }
            return true;
        } catch (err) {
            console.error("Mic check error:", err);
            return true; // Fallback to prompt anyway
        }
    };

    const startRecording = async () => {
        const hasMic = await checkMicrophone();
        if (!hasMic) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                onRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            const startTime = Date.now();
            timerRef.current = window.setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Microphone access denied", {
                description: "Please allow microphone permissions in your browser settings."
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsPlaying(false);
        onDelete();
        if (audioUrl) URL.revokeObjectURL(audioUrl);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (audioUrl && audioBlob) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700 w-fit"
            >
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />

                <button
                    onClick={togglePlayback}
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-charcoal dark:bg-white text-white dark:text-charcoal hover:opacity-85 transition-opacity"
                    type="button"
                >
                    {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                </button>

                <div className="flex flex-col px-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal dark:text-stone-300">Voice Note</span>
                    <span className="text-[9px] text-stone-500 font-mono">{formatTime(recordingTime)}</span>
                </div>

                <div className="h-5 w-[1px] bg-stone-300 dark:bg-stone-700 mx-0.5"></div>

                <button
                    onClick={deleteRecording}
                    disabled={isUploading}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    type="button"
                >
                    <Trash2 size={14} />
                </button>
            </motion.div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
                {isRecording ? (
                    <motion.div
                        key="recording"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/50">
                            <div className="relative h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </div>
                            <span className="font-mono text-xs font-bold w-10 text-center">{formatTime(recordingTime)}</span>
                        </div>

                        <button
                            onClick={stopRecording}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                            type="button"
                        >
                            <Square size={12} fill="currentColor" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={startRecording}
                        disabled={isUploading}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                            "text-stone-500 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700",
                            isUploading && "opacity-50 cursor-not-allowed"
                        )}
                        type="button"
                    >
                        <Mic size={14} className="text-[#C5A059]" />
                        <span>Record Audio</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
