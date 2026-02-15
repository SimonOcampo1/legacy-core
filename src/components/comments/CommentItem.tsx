import { useState, useEffect } from 'react';
import type { Comment } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { cn } from '../../lib/utils';
import { Heart, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentItemProps {
    comment: Comment;
    onReply: (parentId: string, content: string, audioBlob?: Blob) => void;
    onLike: (commentId: string) => void;
    onDelete?: (commentId: string) => void;
    currentUserId?: string;
    depth?: number;
}

export function CommentItem({ comment, onReply, onLike, onDelete, currentUserId, depth = 0 }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyAudio, setReplyAudio] = useState<Blob | null>(null);

    // Initialize like state from props/backend data
    const [isLiked, setIsLiked] = useState(comment.liked_by?.includes(currentUserId || '') || false);
    const [likeCount, setLikeCount] = useState(comment.likes || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state with props when backend updates
    useEffect(() => {
        setIsLiked(comment.liked_by?.includes(currentUserId || '') || false);
        setLikeCount(comment.likes || 0);
    }, [comment.liked_by, comment.likes, currentUserId]);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike(comment.$id);
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim() && !replyAudio) return;
        setIsSubmitting(true);
        try {
            await onReply(comment.$id, replyText, replyAudio || undefined);
            setIsReplying(false);
            setReplyText("");
            setReplyAudio(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedDate = comment.$createdAt ? formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true }) : '';
    const isAuthor = currentUserId === comment.author_id;

    return (
        <div className={cn("relative", depth > 0 && "ml-8 mt-4")}>
            {/* Thread Connector */}
            {depth > 0 && (
                <div className="absolute -left-4 top-0 w-4 h-4 border-l border-b border-black dark:border-white opacity-20" />
            )}

            <div className="pl-4 py-6 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-gold">
                <div className="flex gap-4 items-start">
                    {/* Square Avatar */}
                    <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-gray-100 dark:bg-zinc-900 font-bold uppercase text-xs shrink-0">
                        {(comment.author_name || comment.author_id)?.charAt(0) || '?'}
                    </div>

                    <div className="flex-1 space-y-2">
                        {/* Meta Header */}
                        <div className="flex flex-wrap items-baseline gap-3">
                            <span className="font-bold text-sm uppercase">
                                {comment.author_name || comment.author_id}
                            </span>
                            <span className="font-mono text-[10px] text-gray-500 uppercase">
                                [{formattedDate}]
                            </span>
                            {isAuthor && (
                                <button
                                    onClick={() => onDelete?.(comment.$id)}
                                    // boxy delete button: text only but with more space and bold hover
                                    className="ml-auto mr-4 opacity-0 group-hover:opacity-100 font-mono text-[10px] uppercase text-red-500 hover:text-red-600 hover:font-bold transition-all"
                                >
                                    [DELETE]
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                            {comment.content}
                        </div>

                        {/* Audio attachment */}
                        {comment.audio_url && (
                            <div className="mt-2 border border-black dark:border-white p-2 w-full md:max-w-xs bg-white dark:bg-black">
                                <AudioPlayer src={comment.audio_url} />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-6 pt-2">
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-2 font-mono text-[10px] uppercase hover:text-gold transition-colors"
                            >
                                <CornerDownRight className="w-3 h-3" />
                                {isReplying ? 'CANCEL_REPLY' : 'REPLY'}
                            </button>

                            <button
                                onClick={handleLike}
                                className={cn(
                                    "flex items-center gap-2 font-mono text-[10px] uppercase hover:text-gold transition-colors",
                                    isLiked && "text-gold font-bold"
                                )}
                            >
                                <Heart className={cn("w-3 h-3", isLiked && "fill-current")} />
                                <span>{likeCount}</span>
                            </button>
                        </div>

                        {/* Reply Input */}
                        <AnimatePresence>
                            {isReplying && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden pt-4"
                                >
                                    <div className="border border-black dark:border-white p-4 bg-gray-100 dark:bg-zinc-900">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="APPEND_DATA..."
                                            className="w-full bg-transparent border-b border-black/20 dark:border-white/20 focus:border-gold focus:outline-none p-2 font-mono text-xs min-h-[60px] mb-4"
                                            autoFocus
                                        />
                                        <div className="flex justify-between items-center">
                                            <AudioRecorder
                                                onRecordingComplete={setReplyAudio}
                                                onDelete={() => setReplyAudio(null)}
                                                isUploading={isSubmitting}
                                            />
                                            <button
                                                onClick={handleSubmitReply}
                                                disabled={isSubmitting || (!replyText.trim() && !replyAudio)}
                                                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 font-mono text-[10px] uppercase hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'PROCESSING...' : 'TRANSMIT'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Replies Container */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 border-l border-black/10 dark:border-white/10">
                                {comment.replies.map((reply: Comment) => (
                                    <CommentItem
                                        key={reply.$id}
                                        comment={reply}
                                        depth={depth + 1}
                                        onReply={onReply}
                                        onDelete={onDelete}
                                        onLike={onLike}
                                        currentUserId={currentUserId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
