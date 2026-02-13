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
                className="flex items-center gap-2 p-2 bg-white dark:bg-black border border-black dark:border-white w-fit"
            >
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />

                <button
                    onClick={togglePlayback}
                    className="h-6 w-6 flex items-center justify-center border border-black dark:border-white hover:bg-[#C5A059] hover:text-black hover:border-[#C5A059] transition-colors"
                    type="button"
                >
                    {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                </button>

                <div className="flex flex-col px-2 min-w-[80px]">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white">VOICE_LOG</span>
                    <span className="text-[9px] text-gray-500 font-mono">{formatTime(recordingTime)}</span>
                </div>

                <div className="h-6 w-px bg-black/20 dark:bg-white/20 mx-1"></div>

                <button
                    onClick={deleteRecording}
                    disabled={isUploading}
                    className="p-1 text-black dark:text-white hover:text-red-500 transition-colors disabled:opacity-50"
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
                        className="flex items-center gap-2"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white">
                            <div className="relative h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full bg-red-500 opacity-75 rounded-none"></span>
                                <span className="relative inline-flex h-2 w-2 bg-red-500"></span>
                            </div>
                            <span className="font-mono text-[10px] font-bold min-w-[40px] text-center tracking-widest">{formatTime(recordingTime)}</span>
                        </div>

                        <button
                            onClick={stopRecording}
                            className="h-8 w-8 flex items-center justify-center bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            type="button"
                        >
                            <Square size={10} fill="currentColor" />
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
                            "flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase transition-all bg-transparent border border-black dark:border-white/50 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black group",
                            isUploading && "opacity-50 cursor-not-allowed"
                        )}
                        type="button"
                    >
                        <Mic size={14} className="text-black dark:text-white group-hover:text-[#C5A059] transition-colors" />
                        <span>RECORD_AUDIO</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
