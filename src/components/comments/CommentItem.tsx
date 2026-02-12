import { useState } from 'react';
import type { Comment } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { cn } from '../../lib/utils';
import { Heart, Reply, Trash2, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentItemProps {
    comment: Comment;
    onReply: (parentId: string, content: string, audioBlob?: Blob) => void;
    onLike: (commentId: string, currentLikes: number) => void;
    onDelete?: (commentId: string) => void;
    currentUserId?: string;
    depth?: number;
}

export function CommentItem({ comment, onReply, onLike, onDelete, currentUserId, depth = 0 }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyAudio, setReplyAudio] = useState<Blob | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike(comment.$id, comment.likes);
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

    // Premium variant for entry
    const entryVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            variants={entryVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                "group relative bg-transparent",
                depth > 0 && "mt-6 ml-8 md:ml-12"
            )}
        >
            {/* Thread Line Extension */}
            {depth > 0 && (
                <div className="absolute -left-6 md:-left-8 top-0 bottom-0 w-px bg-stone-100 dark:bg-stone-900" />
            )}

            <div className="flex gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0 pt-1">
                    <div className="h-10 w-10 rounded-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-sm font-serif font-bold text-charcoal dark:text-white shadow-sm ring-4 ring-white dark:ring-charcoal transition-all group-hover:border-[#C5A059]/30">
                        {comment.author_id?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-stone-300">
                                {comment.author_id}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600 font-bold">
                                {formattedDate}
                            </span>
                        </div>

                        {isAuthor && onDelete && (
                            <button
                                onClick={() => onDelete(comment.$id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all active:scale-90"
                                title="Remove conversation"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>

                    <div className="font-serif italic text-lg text-charcoal/90 dark:text-stone-300/90 leading-relaxed mb-4">
                        {comment.content && (
                            <div className="prose-stone dark:prose-invert" dangerouslySetInnerHTML={{ __html: comment.content }} />
                        )}
                    </div>

                    {comment.audio_url && (
                        <div className="mb-6">
                            <AudioPlayer src={comment.audio_url} />
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className={cn(
                                "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95",
                                isReplying ? "text-[#C5A059]" : "text-stone-400 dark:text-stone-600 hover:text-[#C5A059]"
                            )}
                        >
                            <Reply size={12} className={cn("transition-transform", isReplying && "-rotate-180")} />
                            {isReplying ? 'Cancel' : 'Reply'}
                        </button>

                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95",
                                isLiked ? "text-[#C5A059]" : "text-stone-400 dark:text-stone-600 hover:text-[#C5A059]"
                            )}
                        >
                            <Heart size={12} fill={isLiked ? "currentColor" : "none"} className={cn("transition-transform", isLiked && "scale-110")} />
                            {likeCount > 0 && likeCount} {likeCount === 1 ? 'Legacy' : 'Legacies'}
                        </button>
                    </div>

                    {/* Reply Input Area */}
                    <AnimatePresence>
                        {isReplying && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pl-4 border-l-2 border-[#C5A059]/20 flex flex-col space-y-4">
                                    <div className="flex items-start gap-4">
                                        <CornerDownRight size={14} className="mt-2 text-[#C5A059]/40" />
                                        <div className="flex-1">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Continuing the thread..."
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base font-serif italic text-charcoal dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-700 resize-none min-h-[60px]"
                                                rows={1}
                                                autoFocus
                                            />
                                            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-900/50">
                                                <div className="flex items-center gap-2">
                                                    <AudioRecorder
                                                        onRecordingComplete={setReplyAudio}
                                                        onDelete={() => setReplyAudio(null)}
                                                        isUploading={isSubmitting}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSubmitReply}
                                                    disabled={isSubmitting || (!replyText.trim() && !replyAudio)}
                                                    className="h-9 px-6 bg-charcoal dark:bg-white text-white dark:text-charcoal text-[10px] font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-all disabled:opacity-30 shadow-lg"
                                                >
                                                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-2">
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
        </motion.div>
    );
}
