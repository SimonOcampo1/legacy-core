import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import type { Narrative } from "../types";
import { PageTransition } from "../components/PageTransition";
import { ArrowRight, X, ChevronLeft, Loader2, ScrollText } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { useScrollLock } from "../hooks/useScrollLock";
import { AnimatePresence, motion } from "framer-motion";
import { NarrativeEditor } from "../components/admin/NarrativeEditor";



export function SharedNarratives() {
    const [narratives, setNarratives] = useState<Narrative[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'new' | 'drafts'>('new');
    const [drafts, setDrafts] = useState<Narrative[]>([]);
    const [selectedDraft, setSelectedDraft] = useState<Narrative | null>(null);
    const [draftsLoading, setDraftsLoading] = useState(false);
    useScrollLock(isModalOpen);
    const { isAuthorized, user } = useAuth();
    const { currentGroup } = useGroup();

    const fetchDrafts = async () => {
        if (!user?.$id || !currentGroup?.$id) return;
        setDraftsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                NARRATIVES_COLLECTION_ID,
                [
                    Query.equal('group_id', currentGroup.$id),
                    Query.equal('status', 'draft'),
                    Query.equal('author_id', user.$id),
                    Query.orderDesc('$updatedAt')
                ]
            );
            setDrafts(response.documents as unknown as Narrative[]);
        } catch (error) {
            console.error('Failed to fetch drafts:', error);
            setDrafts([]);
        } finally {
            setDraftsLoading(false);
        }
    };

    useEffect(() => {
        const fetchNarratives = async () => {
            if (!currentGroup?.$id) return;
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    [
                        Query.equal('group_id', currentGroup.$id),
                        Query.equal("status", "published"),
                        Query.orderDesc("$createdAt")
                    ]
                );

                const dbNarratives = response.documents.map((doc: any) => ({
                    ...doc,
                    author: doc.author_id || "UNKNOWN",
                })) as Narrative[];

                setNarratives(dbNarratives);
            } catch (error) {
                console.error("Failed to fetch narratives:", error);
                setNarratives([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNarratives();
    }, [currentGroup]);

    const handleAppend = () => {
        setIsModalOpen(true);
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-[#09090b] pt-12">
                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2">
                            Shared<span className="text-gold">_Narratives</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// COLLECTIVE MEMORY BANK<br />
                            ACCESSING COLLECTIVE RECORDS...
                        </p>
                    </div>

                    {/* Append Button */}
                    {isAuthorized && (
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={handleAppend}
                                className="bg-black text-white dark:bg-white dark:text-black font-mono text-xs px-6 py-3 hover:bg-gold hover:text-black transition-colors uppercase font-bold"
                            >
                                [ + APPEND_ENTRY ]
                            </button>
                            {/* Index Stats */}
                            <div className="font-mono text-xs text-right hidden md:block text-gray-500">
                                TOTAL_ENTRIES: {narratives.length.toString().padStart(3, '0')}<br />
                                LAST_UPDATE: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                        [ DECRYPTING_ARCHIVES ]
                    </div>
                ) : (
                    <div className="divide-y divide-black/10 dark:divide-white/10">
                        {narratives.map((narrative, index) => (
                            <Link
                                to={`/narratives/${narrative.$id}`}
                                key={narrative.$id}
                                className="group block hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[200px]">
                                    {/* Index Column */}
                                    <div className="md:col-span-1 p-6 md:p-8 border-l border-black dark:border-white/20 font-mono text-xs opacity-40">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>

                                    {/* Content Column */}
                                    <div className="md:col-span-8 p-6 md:p-8 border-l border-black dark:border-white/20 flex flex-col justify-between">
                                        <div>
                                            {narrative.category && (
                                                <span className="inline-block border border-black dark:border-white px-2 py-1 font-mono text-[10px] uppercase mb-4">
                                                    {narrative.category}
                                                </span>
                                            )}
                                            <div className="flex items-baseline gap-4">
                                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter group-hover:text-gold transition-colors line-clamp-2">
                                                    {narrative.title}
                                                </h2>
                                            </div>
                                            <p className="font-mono text-sm opacity-60 max-w-2xl line-clamp-2 mt-4">
                                                {narrative.description || narrative.content.substring(0, 150)}...
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-8 font-mono text-xs opacity-40 uppercase">
                                            <span>AUTH: {narrative.author || "UNKNOWN"}</span>
                                            <span>//</span>
                                            <span>DATE: {new Date(narrative.date_event || narrative.$createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="md:col-span-3 p-6 md:p-8 border-l border-black dark:border-white/20 flex flex-col justify-between items-end bg-gray-50 dark:bg-white/5 group-hover:bg-transparent transition-colors">
                                        <div className="w-full text-right">
                                            <span className="font-mono text-[10px] border border-black dark:border-white/20 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                READ_ENTRY
                                            </span>
                                        </div>
                                        <ArrowRight className="w-12 h-12 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300 group-hover:text-gold" strokeWidth={1} />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {narratives.length === 0 && (
                            <EmptyState
                                title="NARRATIVE_VOID"
                                message="NO NARRATIVES RECORDED."
                                icon={ScrollText}
                                actionLabel="[ INITIALIZE_FIRST_ENTRY ]"
                                onAction={handleAppend}
                                className="min-h-[60vh] m-4 md:m-8"
                            />
                        )}
                    </div>
                )}

                {/* Modal for Member Logs */}
                <AnimatePresence>
                    {isModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => { setIsModalOpen(false); setModalMode('new'); setSelectedDraft(null); }}
                                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div data-lenis-prevent className="bg-white dark:bg-[#09090b] w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black dark:border-white shadow-2xl pointer-events-auto">
                                    {/* Modal Header with Tabs */}
                                    <div className="p-4 border-b border-black dark:border-white bg-gray-50 dark:bg-white/5">
                                        <div className="flex justify-between items-center mb-3">
                                            <h2 className="font-black text-xl uppercase tracking-tighter">
                                                {selectedDraft ? 'RESUME_LOG_ENTRY' : modalMode === 'new' ? 'NEW_LOG_ENTRY' : 'DRAFT_ARCHIVES'}
                                            </h2>
                                            <button onClick={() => { setIsModalOpen(false); setModalMode('new'); setSelectedDraft(null); }}>
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>

                                        {/* Tab buttons */}
                                        {!selectedDraft && (
                                            <div className="flex gap-0 border border-black dark:border-white">
                                                <button
                                                    onClick={() => setModalMode('new')}
                                                    className={`flex-1 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${modalMode === 'new'
                                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                                        : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'
                                                        }`}
                                                >
                                                    + NEW_ENTRY
                                                </button>
                                                <button
                                                    onClick={() => { setModalMode('drafts'); fetchDrafts(); }}
                                                    className={`flex-1 px-4 py-2 font-mono text-xs uppercase tracking-wider border-l border-black dark:border-white transition-colors ${modalMode === 'drafts'
                                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                                        : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5'
                                                        }`}
                                                >
                                                    ↻ RESUME_DRAFT {drafts.length > 0 && `(${drafts.length})`}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        {/* Back button when editing a draft */}
                                        {selectedDraft && (
                                            <button
                                                onClick={() => setSelectedDraft(null)}
                                                className="flex items-center gap-2 font-mono text-xs uppercase mb-4 hover:text-gold transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                BACK_TO_DRAFTS
                                            </button>
                                        )}

                                        {/* NEW_ENTRY mode */}
                                        {modalMode === 'new' && !selectedDraft && (
                                            <NarrativeEditor memberId={user?.$id} groupId={currentGroup?.$id} onSuccess={() => { setIsModalOpen(false); setModalMode('new'); }} />
                                        )}

                                        {/* RESUME_DRAFT mode - draft list */}
                                        {modalMode === 'drafts' && !selectedDraft && (
                                            <div>
                                                {draftsLoading ? (
                                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                                        <Loader2 className="w-6 h-6 animate-spin mb-3" />
                                                        <span className="font-mono text-xs uppercase">SCANNING_DRAFTS...</span>
                                                    </div>
                                                ) : drafts.length === 0 ? (
                                                    <div className="border border-dashed border-black/20 dark:border-white/20 py-16 text-center">
                                                        <p className="font-mono text-sm uppercase text-gray-500 mb-4">NO_DRAFTS_FOUND</p>
                                                        <button
                                                            onClick={() => setModalMode('new')}
                                                            className="font-mono text-xs text-gold underline decoration-1 underline-offset-4 uppercase hover:bg-gold hover:text-black px-2 py-1 transition-colors"
                                                        >
                                                            CREATE_NEW_ENTRY
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-0 border border-black dark:border-white divide-y divide-black/10 dark:divide-white/10">
                                                        {drafts.map((draft) => (
                                                            <button
                                                                key={draft.$id}
                                                                onClick={() => setSelectedDraft(draft)}
                                                                className="w-full text-left p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30 font-mono text-[9px] uppercase tracking-wider">
                                                                                DRAFT
                                                                            </span>
                                                                            {draft.category && (
                                                                                <span className="font-mono text-[9px] uppercase text-gray-400">
                                                                                    {draft.category}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <h4 className="font-bold text-lg uppercase tracking-tight leading-tight truncate group-hover:text-gold transition-colors">
                                                                            {draft.title || 'UNTITLED_DRAFT'}
                                                                        </h4>
                                                                        <p className="font-mono text-xs text-gray-400 mt-1">
                                                                            LAST_SAVED: {new Date(draft.$updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} — {new Date(draft.$updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                    <ArrowRight className="w-5 h-5 flex-shrink-0 text-gray-300 group-hover:text-gold group-hover:translate-x-1 transition-all mt-1" />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Editing a selected draft */}
                                        {selectedDraft && (
                                            <NarrativeEditor
                                                memberId={user?.$id}
                                                groupId={currentGroup?.$id}
                                                initialData={{
                                                    $id: selectedDraft.$id,
                                                    title: selectedDraft.title,
                                                    content: selectedDraft.content,
                                                    date_event: selectedDraft.date_event,
                                                    cover_image_id: selectedDraft.cover_image_id,
                                                    category: selectedDraft.category,
                                                }}
                                                onSuccess={() => { setIsModalOpen(false); setModalMode('new'); setSelectedDraft(null); }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
