import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, storage, DATABASE_ID, COMMENTS_COLLECTION_ID, AUDIO_BUCKET_ID } from '../../lib/appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import { CommentItem } from './CommentItem';
import { AudioRecorder } from './AudioRecorder';
import { Loader2, MessageSquare, Send } from 'lucide-react';
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

            toast.success("Comment recorded.");
            setNewCommentText("");
            setAudioBlob(null);
            fetchComments();

        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("Failed to post comment.");
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
            toast.success("Record deleted.");
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Deletion failed.");
        }
    };

    return (
        <div className="mt-8 space-y-12">
            <div className="flex items-end justify-between border-b-2 border-black dark:border-white pb-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter">
                        DISCUSSION_LOG
                    </h3>
                </div>
                <span className="font-mono text-sm border border-black dark:border-white px-2 py-1">
                    COUNT: {String(comments.length).padStart(2, '0')}
                </span>
            </div>

            {/* Post Comment Input */}
            <div className="bg-gray-50 dark:bg-white/5 border border-black dark:border-white p-6 relative">
                <div className="absolute top-0 left-0 bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest">
                    NEW_ENTRY
                </div>

                {user ? (
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black font-bold uppercase text-sm shrink-0">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="INPUT_NARRATIVE_DATA..."
                                    className="w-full bg-transparent border-0 focus:ring-0 p-0 font-mono text-sm min-h-[80px] resize-y placeholder:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <AudioRecorder
                                    onRecordingComplete={setAudioBlob}
                                    onDelete={() => setAudioBlob(null)}
                                    isUploading={submitting}
                                />
                            </div>

                            <button
                                onClick={() => handlePostComment('root', newCommentText)}
                                disabled={submitting || (!newCommentText.trim() && !audioBlob)}
                                className="group w-full md:w-auto px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-[#C5A059] hover:text-black dark:hover:bg-[#C5A059] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>TRANSMITTING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>COMPLETE_ENTRY</span>
                                        <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="font-mono text-xs uppercase text-gray-500 mb-4">ACCESS_DENIED // AUTHENTICATION_REQUIRED</p>
                        <button
                            onClick={() => (window as any).openLoginModal?.()}
                            className="bg-black dark:bg-white text-white dark:text-black font-mono text-xs px-4 py-2 hover:bg-[#C5A059] hover:text-black transition-colors uppercase"
                        >
                            [ INITIATE_LOGIN_SEQUENCE ]
                        </button>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-0 border-l mb-12 border-black dark:border-white">
                {loading ? (
                    <div className="pl-8 py-8 font-mono text-xs animate-pulse">
                        [ RETRIEVING_DATA_BLOCKS... ]
                    </div>
                ) : comments.length > 0 ? (
                    <div className="divide-y divide-dashed divide-black/20 dark:divide-white/20">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.$id}
                                comment={comment}
                                depth={0}
                                onReply={handlePostComment}
                                onLike={handleLike}
                                onDelete={handleDelete}
                                currentUserId={user?.$id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="pl-8 py-8 border-dashed border-t border-black/20 dark:border-white/20">
                        <p className="font-mono text-xs text-gray-500 uppercase">
                            [ LOG_EMPTY: AWAITING_INPUT ]
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
