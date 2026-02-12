import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, storage, DATABASE_ID, COMMENTS_COLLECTION_ID, AUDIO_BUCKET_ID } from '../../lib/appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import { CommentItem } from './CommentItem';
import { AudioRecorder } from './AudioRecorder';
import { Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Comment } from '../../types';

interface CommentsSectionProps {
    narrativeId: string;
}

export function CommentsSection({ narrativeId }: CommentsSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                [
                    Query.equal('narrative_id', narrativeId),
                    Query.orderDesc('$createdAt')
                ]
            );

            const flatComments = response.documents as unknown as Comment[];
            const commentMap: Record<string, Comment> = {};
            const rootComments: Comment[] = [];

            flatComments.forEach(comment => {
                comment.replies = [];
                commentMap[comment.$id] = comment;
            });

            flatComments.forEach(comment => {
                if (comment.parent_id && comment.parent_id !== 'root' && commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id].replies?.push(comment);
                } else {
                    rootComments.push(comment);
                }
            });

            const sortReplies = (comment: Comment) => {
                if (comment.replies && comment.replies.length > 0) {
                    comment.replies.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
                    comment.replies.forEach(sortReplies);
                }
            };
            rootComments.forEach(sortReplies);

            setComments(rootComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
            toast.error("Failed to load comments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [narrativeId]);

    const handlePostComment = async (parentId: string = 'root', content: string, recordingBlob?: Blob) => {
        if (!user) {
            toast.error("Sign in to join the conversation");
            return;
        }

        const finalAudioBlob = recordingBlob || audioBlob;
        if (!content.trim() && !finalAudioBlob) return;

        setSubmitting(true);
        try {
            let audioUrl = undefined;

            if (finalAudioBlob) {
                const file = new File([finalAudioBlob], `voice_c_${Date.now()}.webm`, { type: 'audio/webm' });
                try {
                    const upload = await storage.createFile(AUDIO_BUCKET_ID, ID.unique(), file);
                    audioUrl = storage.getFileView(AUDIO_BUCKET_ID, upload.$id).toString();
                } catch (uploadError) {
                    console.error("Audio upload failed:", uploadError);
                    toast.error("Failed to upload audio note");
                }
            }

            await databases.createDocument(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                ID.unique(),
                {
                    content,
                    author_id: user.$id,
                    narrative_id: narrativeId,
                    parent_id: parentId,
                    audio_url: audioUrl,
                    likes: 0
                },
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.user(user.$id))
                ]
            );

            toast.success("Comment shared successfully");
            setNewCommentText("");
            setAudioBlob(null);
            fetchComments();

        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("Failed to share your thought");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: string, currentLikes: number) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                commentId,
                { likes: currentLikes + 1 }
            );
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId);
            toast.success("Comment removed");
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to remove comment");
        }
    };

    return (
        <div className="mt-16 space-y-12">
            <div className="flex items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
                <h3 className="font-serif text-2xl text-charcoal dark:text-white italic">
                    Conversations
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">
                    {comments.length}
                </span>
            </div>

            {/* Post Comment Input */}
            <div className="group relative">
                {user ? (
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-xs font-serif font-bold text-charcoal dark:text-white shadow-sm ring-2 ring-transparent group-focus-within:ring-stone-100 dark:group-focus-within:ring-stone-900 transition-all">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Add to the narrative..."
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-serif italic text-charcoal dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-700 resize-none min-h-[80px]"
                                    rows={1}
                                />

                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100 dark:border-stone-900/50">
                                    <div className="flex items-center gap-2">
                                        <AudioRecorder
                                            onRecordingComplete={setAudioBlob}
                                            onDelete={() => setAudioBlob(null)}
                                            isUploading={submitting}
                                        />
                                    </div>

                                    <button
                                        onClick={() => handlePostComment('root', newCommentText)}
                                        disabled={submitting || (!newCommentText.trim() && !audioBlob)}
                                        className="h-10 px-8 bg-charcoal dark:bg-white text-white dark:text-charcoal text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:opacity-90 transition-all disabled:opacity-30 disabled:grayscale shadow-xl"
                                    >
                                        {submitting ? 'Sharing...' : 'Share Thought'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-2xl bg-stone-50/50 dark:bg-stone-950/20 border border-dashed border-stone-200 dark:border-stone-800">
                        <MessageCircle className="mx-auto w-6 h-6 text-stone-300 dark:text-stone-700 mb-4" />
                        <p className="text-sm font-serif italic text-stone-500 mb-6">Join the narrative flow to leave a comment</p>
                        <button
                            onClick={() => (window as any).openLoginModal?.()}
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] border-b border-[#C5A059]/30 pb-1 hover:border-[#C5A059] transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-8 pt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[#C5A059]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading memories</span>
                    </div>
                ) : comments.length > 0 ? (
                    <div className="divide-y divide-stone-100 dark:divide-stone-900/50">
                        {comments.map((comment) => (
                            <div key={comment.$id} className="py-8 first:pt-0">
                                <CommentItem
                                    comment={comment}
                                    depth={0}
                                    onReply={handlePostComment}
                                    onLike={handleLike}
                                    onDelete={handleDelete}
                                    currentUserId={user?.$id}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="font-serif italic text-stone-400 dark:text-stone-600">The silence is inviting. Be the first to share a thought.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
