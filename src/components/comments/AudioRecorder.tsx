import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

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
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                onRecordingComplete(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            const startTime = Date.now();
            timerRef.current = window.setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please allow permissions.");
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
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsPlaying(false);
        onDelete();
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (audioUrl && audioBlob) {
        return (
            <div className="flex items-center gap-2 p-2 bg-stone-100 rounded-full border border-stone-200 w-fit">
                <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />

                <button
                    onClick={togglePlayback}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                    type="button"
                >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>

                <div className="flex flex-col px-2">
                    <span className="text-xs font-medium text-slate-700">Voice Note</span>
                    <span className="text-[10px] text-slate-400">{formatTime(recordingTime)}</span>
                </div>

                <div className="h-6 w-[1px] bg-stone-300 mx-1"></div>

                <button
                    onClick={deleteRecording}
                    disabled={isUploading}
                    className="p-1.5 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    type="button"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            {isRecording ? (
                <div className="flex items-center gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                        <div className="relative h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </div>
                        <span className="font-mono text-xs font-medium w-10 text-center">{formatTime(recordingTime)}</span>
                    </div>

                    <button
                        onClick={stopRecording}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                        type="button"
                    >
                        <Square size={12} fill="currentColor" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={startRecording}
                    disabled={isUploading}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        "text-slate-600 bg-stone-100 hover:bg-stone-200 border border-stone-200",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                    type="button"
                >
                    <Mic size={14} />
                    <span>Record Audio</span>
                </button>
            )}
        </div>
    );
}
