import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID, PROFILES_COLLECTION_ID } from '../../lib/appwrite';
import { Query } from 'appwrite';
import {
    Plus,
    Trash2,
    Edit2,
    Search,
    Loader2,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { NarrativeEditor } from './NarrativeEditor';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../ui/EmptyState';
import { Link } from 'react-router-dom';
import type { Narrative } from '../../types';

interface AuthorCache {
    [key: string]: string;
}

export const NarrativeManager = ({ groupId }: { groupId?: string }) => {
    const [narratives, setNarratives] = useState<Narrative[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [editingNarrative, setEditingNarrative] = useState<Narrative | null>(null);
    const [deletingNarrativeId, setDeletingNarrativeId] = useState<string | null>(null);
    const [authorNames, setAuthorNames] = useState<AuthorCache>({});
    const { user } = useAuth();

    const fetchNarratives = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                NARRATIVES_COLLECTION_ID,
                groupId
                    ? [Query.equal('group_id', groupId), Query.orderDesc('$createdAt'), Query.limit(100)]
                    : [Query.orderDesc('$createdAt'), Query.limit(100)]
            );
            const docs = response.documents as unknown as Narrative[];
            setNarratives(docs);

            // Fetch author names for unique author_ids
            const uniqueAuthorIds = [...new Set(docs.map(d => d.author_id).filter(Boolean))];
            const authorCache: AuthorCache = {};
            try {
                const profilePromises = uniqueAuthorIds.map(id =>
                    databases.getDocument(DATABASE_ID, PROFILES_COLLECTION_ID, id).catch(() => null)
                );
                const profiles = await Promise.all(profilePromises);
                profiles.forEach(p => {
                    if (p) authorCache[p.$id] = (p as any).name || 'Unknown';
                });
            } catch { /* ignore */ }
            setAuthorNames(authorCache);
        } catch (error) {
            console.error('Error fetching narratives:', error);
            toast.error('Failed to load narratives.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNarratives();
    }, []);

    const handleDelete = (id: string) => {
        setDeletingNarrativeId(id);
    };

    const confirmDelete = async () => {
        if (!deletingNarrativeId) return;
        setIsSubmitting(true);
        try {
            await databases.deleteDocument(DATABASE_ID, NARRATIVES_COLLECTION_ID, deletingNarrativeId);
            toast.success('Narrative record deleted.');
            setDeletingNarrativeId(null);
            fetchNarratives();
        } catch (error) {
            console.error('Error deleting narrative:', error);
            toast.error('Failed to delete narrative.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (narrative: Narrative) => {
        setEditingNarrative(narrative);
        setIsAddingMode(true);
    };

    const resetForm = () => {
        setIsAddingMode(false);
        setEditingNarrative(null);
    };

    const filteredNarratives = narratives.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-black dark:border-white pb-6">
                <div>
                    <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter flex items-center gap-4">
                        NARRATIVE_LOG
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2">
                        // SHARED_NARRATIVES_REGISTRY
                    </p>
                </div>

                {!isAddingMode && (
                    <button
                        onClick={() => setIsAddingMode(true)}
                        className="group flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-gold hover:text-black dark:hover:bg-gold transition-all"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        <span>APPEND_ENTRY</span>
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAddingMode ? (
                    <motion.div
                        key="entry-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border border-black dark:border-white p-6 bg-gray-50 dark:bg-white/5"
                    >
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-black/10 dark:border-white/10">
                            <h3 className="font-mono text-xs uppercase font-bold flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                {editingNarrative ? 'MODIFYING_RECORD_ID:' + editingNarrative.$id.substring(0, 6) : 'NEW_DATA_ENTRY'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <NarrativeEditor
                            memberId={user?.$id}
                            groupId={groupId}
                            initialData={editingNarrative ? {
                                $id: editingNarrative.$id,
                                title: editingNarrative.title,
                                content: editingNarrative.content,
                                date_event: editingNarrative.date_event,
                                cover_image_id: editingNarrative.cover_image_id,
                                category: editingNarrative.category,
                            } : undefined}
                            onSuccess={() => {
                                resetForm();
                                fetchNarratives();
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="records-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH_NARRATIVES..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black focus:border-gold transition-colors uppercase"
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p className="font-mono text-xs uppercase tracking-widest">QUERYING_DATABASE...</p>
                            </div>
                        ) : filteredNarratives.length === 0 ? (
                            <EmptyState
                                title="NARRATIVE_VOID"
                                message="NARRATIVE ARCHIVE QUERY RETURNED NO DATA. INITIATE NEW ENTRY PROTOCOL."
                                icon={Search}
                                actionLabel="[ CREATE_NEW_ENTRY ]"
                                onAction={() => setIsAddingMode(true)}
                            />
                        ) : (
                            <div className="relative border border-black dark:border-white overflow-hidden">
                                {filteredNarratives.map((narrative, index) => (
                                    <motion.div
                                        key={narrative.$id}
                                        layout="position"
                                        className={`group flex flex-col md:flex-row items-stretch border-b border-black/10 dark:border-white/10 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.02] dark:bg-white/[0.02]'}`}
                                    >
                                        {/* Status Column */}
                                        <div className="p-6 md:w-32 border-r border-black/10 dark:border-white/10 flex flex-col justify-center items-center md:items-start">
                                            {narrative.status === 'published' ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">LIVE</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    <EyeOff className="w-3.5 h-3.5 text-yellow-500" />
                                                    <span className="font-mono text-[9px] uppercase tracking-wider text-yellow-600 dark:text-yellow-400">DRAFT</span>
                                                </span>
                                            )}
                                            <span className="font-mono text-[9px] uppercase text-gray-400 mt-1">
                                                {new Date(narrative.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Content Column */}
                                        <div className="p-6 flex-1 flex flex-col justify-center gap-2">
                                            <div className="flex items-center gap-3">
                                                {narrative.category && (
                                                    <span className="px-2 py-1 border border-black dark:border-white text-[10px] font-mono uppercase tracking-wider font-bold">
                                                        {narrative.category}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                to={`/narratives/${narrative.$id}`}
                                                className="hover:text-gold transition-colors"
                                            >
                                                <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
                                                    {narrative.title}
                                                </h4>
                                            </Link>
                                            <p className="font-mono text-xs text-gray-500 uppercase">
                                                AUTH: {authorNames[narrative.author_id] || narrative.author_id?.substring(0, 8) || 'UNKNOWN'}
                                                {narrative.date_event && (
                                                    <> // DATE: {new Date(narrative.date_event).toLocaleDateString()}</>
                                                )}
                                            </p>
                                        </div>

                                        {/* Actions Column */}
                                        <div className="p-6 md:w-48 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(narrative);
                                                }}
                                                className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                                title="EDIT_ENTRY"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(narrative.$id);
                                                }}
                                                className="p-2 border border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                                title="DELETE_ENTRY"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <DeleteConfirmationModal
                isOpen={!!deletingNarrativeId}
                onClose={() => setDeletingNarrativeId(null)}
                onConfirm={confirmDelete}
                title="CONFIRM DELETION"
                message="PERMANENTLY DELETE NARRATIVE RECORD? THIS ACTION IS IRREVERSIBLE."
                itemDetails={narratives.find(n => n.$id === deletingNarrativeId)?.title}
                isLoading={isSubmitting}
            />
        </div>
    );
};
