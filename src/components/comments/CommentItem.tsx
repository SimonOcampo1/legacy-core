import { useState } from 'react';
import type { Comment } from '../../types';
import { AudioPlayer } from './AudioPlayer';
import { cn } from '../../lib/utils';
import { Heart, Reply, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// removed local Comment interface

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
    const [isLiked, setIsLiked] = useState(false); // Local state for immediate feedback
    const [likeCount, setLikeCount] = useState(comment.likes || 0);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike(comment.$id, comment.likes);
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim() && !replyAudio) return;
        await onReply(comment.$id, replyText, replyAudio || undefined);
        setIsReplying(false);
        setReplyText("");
        setReplyAudio(null);
    };

    const formattedDate = comment.$createdAt ? formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true }) : '';
    const isAuthor = currentUserId === comment.author_id;

    return (
        <div className={cn("flex gap-3 mb-4", depth > 0 && "ml-8 md:ml-12 border-l-2 border-stone-100 dark:border-stone-800 pl-4")}>
            <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#C5A059] flex items-center justify-center text-xs font-serif font-bold text-white shadow-sm">
                    {comment.author_id?.charAt(0).toUpperCase() || 'U'}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="bg-white dark:bg-stone-900/30 p-4 rounded-lg border border-stone-100 dark:border-stone-800 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{comment.author_id}</span>
                            <span className="text-[10px] text-slate-400 dark:text-stone-500 uppercase tracking-wider">{formattedDate}</span>
                        </div>
                        {isAuthor && onDelete && (
                            <button
                                onClick={() => onDelete(comment.$id)}
                                className="text-stone-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    <div className="text-sm text-slate-700 dark:text-stone-300 mb-3 leading-relaxed">
                        {comment.content && (
                            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                        )}
                    </div>

                    {comment.audio_url && (
                        <div className="mb-3">
                            <AudioPlayer src={comment.audio_url} />
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-stone-500 hover:text-[#C5A059] transition-colors"
                        >
                            <Reply size={12} />
                            Reply
                        </button>
                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors",
                                isLiked ? "text-[#C5A059]" : "text-slate-400 dark:text-stone-500 hover:text-[#C5A059]"
                            )}
                        >
                            <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
                            {likeCount > 0 && likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                        </button>
                    </div>

                    {isReplying && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full text-sm p-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059] resize-none mb-3 text-slate-800 dark:text-slate-200"
                                rows={2}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsReplying(false)}
                                    className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={!replyText.trim() && !replyAudio}
                                    className="px-5 py-1.5 bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4">
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
    );
}
