import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, storage, DATABASE_ID, COMMENTS_COLLECTION_ID, AUDIO_BUCKET_ID } from '../../lib/appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import { CommentItem } from './CommentItem';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import type { Comment } from '../../types';

// removed local Comment interface

interface CommentsSectionProps {
    narrativeId: string;
}

export function CommentsSection({ narrativeId }: CommentsSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
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

            // Transform flat list to tree
            const flatComments = response.documents as unknown as Comment[];
            const commentMap: Record<string, Comment> = {};
            const rootComments: Comment[] = [];

            // First pass: create map and Initialize replies array
            flatComments.forEach(comment => {
                comment.replies = [];
                commentMap[comment.$id] = comment;
            });

            // Second pass: build tree
            flatComments.forEach(comment => {
                if (comment.parent_id && comment.parent_id !== 'root' && commentMap[comment.parent_id]) {
                    commentMap[comment.parent_id].replies?.push(comment);
                } else {
                    rootComments.push(comment);
                }
            });

            // Sort replies by date (oldest first for conversation flow, or newest? usually oldest first for nested)
            // Root comments are already newest first from query.
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

    const handlePostComment = async (parentId: string = 'root', content: string, audioBlob?: Blob) => {
        if (!user) {
            toast.error("You must be logged in to comment.");
            return;
        }

        setSubmitting(true);
        try {
            let audioUrl = undefined;

            if (audioBlob) {
                // Upload audio
                const file = new File([audioBlob], `voice_c_${Date.now()}.webm`, { type: 'audio/webm' });
                try {
                    const upload = await storage.createFile(
                        AUDIO_BUCKET_ID,
                        ID.unique(),
                        file
                    );
                    const fileId = upload.$id;
                    // generated URL might need adjustment depending on Appwrite version/setup, usually getFileView
                    audioUrl = storage.getFileView(AUDIO_BUCKET_ID, fileId).toString();
                } catch (uploadError) {
                    console.error("Audio upload failed, trying legacy bucket if generic failed or just logging", uploadError);
                    // Fallback to legacy bucket if audio bucket doesn't exist? 
                    // Ideally we catch this. For now let's assume it works or fail gracefully.
                    toast.error("Failed to upload audio. Posting text only.");
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

            toast.success("Comment posted!");
            setNewCommentText("");
            fetchComments(); // Refresh list

        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("Failed to post comment.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: string, currentLikes: number) => {
        // Optimistic update handled in CommentItem, this is for backend persistence
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                commentId,
                {
                    likes: currentLikes + 1 // Basic implementation, doesn't track *who* liked to prevent double likes yet
                }
            );
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return;
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COMMENTS_COLLECTION_ID,
                commentId
            );
            toast.success("Comment deleted.");
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete.");
        }
    }

    return (
        <div className="bg-white dark:bg-background-dark rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-8 transition-colors duration-300">
            <h3 className="font-serif text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#C5A059]" />
                Comments
            </h3>

            {/* Post Comment Input */}
            <div className="mb-8 bg-stone-50 dark:bg-stone-900/20 p-4 rounded-lg border border-stone-100 dark:border-stone-800">
                {user ? (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#C5A059] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                        </div>
                        <textarea
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Write your thought..."
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 text-sm resize-none mb-4"
                            rows={3}
                        />
                        <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-800">
                            <button
                                onClick={() => handlePostComment('root', newCommentText)}
                                disabled={submitting || !newCommentText.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-[#C5A059] text-white text-sm font-medium rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 italic">Sign in to leave a comment</p>
                        <button
                            onClick={() => (window as any).openLoginModal?.()}
                            className="text-xs uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059] pb-0.5 hover:text-[#D4AF37] transition-colors"
                        >
                            Log In
                        </button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-[#C5A059]" />
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.$id}
                            comment={comment}
                            depth={0} // Added depth prop
                            onReply={handlePostComment}
                            onLike={handleLike} // Kept onLike
                            onDelete={handleDelete}
                            currentUserId={user?.$id}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 dark:text-stone-600 text-sm italic">
                    No comments yet. Be the first to start the conversation.
                </div>
            )}
        </div>
    );
}
