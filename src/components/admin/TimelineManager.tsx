import { useState, useEffect } from 'react';
import { databases, storage, DATABASE_ID, TIMELINE_COLLECTION_ID, PROFILES_COLLECTION_ID, BUCKET_ID, getImageUrl } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import {
    Plus,
    Trash2,
    Edit2,
    Calendar,
    Search,
    Loader2,
    X,
    Check,
    Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../ui/EmptyState';

interface TimelineEvent {
    $id: string;
    title: string;
    description: string;
    date_event: string;
    category: string;
    status: string;
    createdAt: string;
    participant_ids?: string[];
    image_id?: string;
}

interface ProfileOption {
    id: string;
    name: string;
    slug: string;
    avatar_id?: string;
}

export const TimelineManager = ({ groupId, memberId }: { groupId?: string; memberId?: string }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);


    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateEvent, setDateEvent] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('General');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(memberId ? [memberId] : []);
    const [availableMembers, setAvailableMembers] = useState<ProfileOption[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const queries = [Query.orderDesc('date_event')];
            if (groupId) {
                queries.push(Query.equal('group_id', groupId));
            }
            if (memberId) {
                queries.push(Query.equal('participant_ids', memberId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                TIMELINE_COLLECTION_ID,
                queries
            );
            setEvents(response.documents as any);
        } catch (error) {
            console.error("Error fetching timeline events:", error);
            toast.error("Failed to load timeline events.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (groupId || memberId) {
            fetchEvents();
        }
        // Fetch all member profiles for the participant picker
        const fetchMembers = async () => {
            try {
                // Ideally this should also be filtered by group if profiles were group-scoped
                const res = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
                setAvailableMembers(res.documents.map((d: any) => ({ id: d.$id, name: d.name, slug: d.slug, avatar_id: d.avatar_id })));
            } catch (err) {
                console.error('Failed to fetch members for picker:', err);
            }
        };
        fetchMembers();
    }, [groupId, memberId]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDateEvent(new Date().toISOString().split('T')[0]);
        setCategory('General');
        setSelectedParticipants([]);
        setImageFile(null);
        setImagePreview('');
        setIsAddingMode(false);
        setEditingEvent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dateEvent) {
            toast.error("Title and date are required.");
            return;
        }

        if (!groupId) {
            toast.error("No group selected.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload image if a file was selected
            let uploadedImageId = editingEvent?.image_id || '';
            if (imageFile) {
                try {
                    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), imageFile);
                    uploadedImageId = uploaded.$id;
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    toast.error('Image upload failed, saving event without image.');
                }
            }

            const data: Record<string, any> = {
                title,
                description,
                date_event: new Date(dateEvent).toISOString(),
                category,
                status: 'published',
                createdAt: editingEvent?.createdAt || new Date().toISOString(),
                author_id: user?.$id || 'admin',
                participant_ids: selectedParticipants,
                image_id: uploadedImageId,
                group_id: groupId
            };

            if (editingEvent) {
                await databases.updateDocument(
                    DATABASE_ID,
                    TIMELINE_COLLECTION_ID,
                    editingEvent.$id,
                    data
                );
                toast.success("Event updated successfully.");
            } else {
                await databases.createDocument(
                    DATABASE_ID,
                    TIMELINE_COLLECTION_ID,
                    ID.unique(),
                    { ...data, createdAt: new Date().toISOString() }
                );
                toast.success("Event added to timeline.");
            }
            resetForm();
            fetchEvents();
        } catch (error) {
            console.error("Error saving timeline event:", error);
            toast.error("Failed to save event.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingEventId(id);
    };

    const confirmDelete = async () => {
        if (!deletingEventId) return;

        setIsSubmitting(true);
        try {
            await databases.deleteDocument(DATABASE_ID, TIMELINE_COLLECTION_ID, deletingEventId);
            toast.success("Event removed.");
            setDeletingEventId(null);
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error("Failed to remove event.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (event: TimelineEvent) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description);
        setDateEvent(new Date(event.date_event).toISOString().split('T')[0]);
        setCategory(event.category || 'General');
        setSelectedParticipants(event.participant_ids || []);
        setImageFile(null);
        setImagePreview(event.image_id ? getImageUrl(event.image_id) : '');
        setIsAddingMode(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const toggleParticipant = (id: string) => {
        setSelectedParticipants(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-black dark:border-white pb-6">
                <div>
                    <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter flex items-center gap-4">
                        CHRONO_LOG
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2">
                        // TIMELINE_EVENT_REGISTRY
                    </p>
                </div>

                {!isAddingMode && groupId && (
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
                                {editingEvent ? 'MODIFYING_RECORD_ID:' + editingEvent.$id.substring(0, 6) : 'NEW_DATA_ENTRY'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6 md:col-span-2">
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] uppercase text-gray-500">EVENT_DESIGNATION_TITLE</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ENTER_EVENT_TITLE..."
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-lg font-bold focus:outline-none focus:bg-white dark:focus:bg-black focus:border-gold transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 md:col-span-2">
                                <div className="space-y-2">
                                    <label className="font-mono text-[10px] uppercase text-gray-500">NARRATIVE_DESCRIPTION</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="ENTER_DETAILED_DESCRIPTION..."
                                        rows={4}
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black focus:border-gold transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="font-mono text-[10px] uppercase text-gray-500">EVENT_IMAGE_UPLOAD</label>
                                <div className="border border-black dark:border-white p-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover grayscale" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(''); }}
                                                className="absolute top-2 right-2 bg-black dark:bg-white text-white dark:text-black p-1 hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-black/20 dark:border-white/20 cursor-pointer hover:border-gold transition-colors">
                                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                            <span className="font-mono text-[10px] uppercase text-gray-400">CLICK_TO_UPLOAD_IMAGE</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase text-gray-500">TEMPORAL_COORDINATES</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dateEvent}
                                        onChange={(e) => setDateEvent(e.target.value)}
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black focus:border-gold transition-colors uppercase"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase text-gray-500">CLASSIFICATION_CATEGORY</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black focus:border-gold transition-colors appearance-none uppercase rounded-none"
                                >
                                    <option value="General">General History</option>
                                    <option value="Academic">Academic Achievement</option>
                                    <option value="Career">Professional Career</option>
                                    <option value="Travel">Expedition</option>
                                    <option value="Personal">Personal Milestone</option>
                                </select>
                            </div>

                            {/* Participant Picker */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="font-mono text-[10px] uppercase text-gray-500">LINKED_PARTICIPANTS</label>
                                <div className="border border-black dark:border-white p-4 space-y-3">
                                    {selectedParticipants.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedParticipants.map(pid => {
                                                const m = availableMembers.find(m => m.id === pid);
                                                if (!m) return null;
                                                return (
                                                    <button
                                                        key={pid}
                                                        type="button"
                                                        onClick={() => toggleParticipant(pid)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] uppercase group hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                                                    >
                                                        <img src={getImageUrl(m.avatar_id)} alt={m.name} className="w-5 h-5 object-cover border border-white dark:border-black" />
                                                        {m.name}
                                                        <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {availableMembers
                                            .filter(m => !selectedParticipants.includes(m.id))
                                            .map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => toggleParticipant(m.id)}
                                                    className="flex items-center gap-2 px-3 py-1.5 border border-black/20 dark:border-white/20 font-mono text-[10px] uppercase hover:border-gold hover:text-gold transition-colors"
                                                >
                                                    <img src={getImageUrl(m.avatar_id)} alt={m.name} className="w-5 h-5 object-cover border border-black/30 dark:border-white/30" />
                                                    + {m.name}
                                                </button>
                                            ))}
                                    </div>
                                    {availableMembers.length === 0 && (
                                        <p className="font-mono text-[10px] text-gray-400 uppercase">NO_MEMBERS_AVAILABLE</p>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-6 border-t border-black/10 dark:border-white/10 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-8 py-4 bg-transparent border border-transparent font-mono text-xs uppercase hover:text-red-500 transition-colors"
                                >
                                    CANCEL_OPERATION
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-gold hover:text-black dark:hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {isSubmitting ? "SAVING..." : "COMMIT_RECORD"}
                                </button>
                            </div>
                        </form>
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
                                placeholder="SEARCH_DATABASE..."
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
                        ) : filteredEvents.length === 0 ? (
                            <EmptyState
                                title="CHRONO_VOID"
                                message="NO TEMPORAL RECORDS FOUND."
                                icon={Search}
                                actionLabel="[ ADD_EVENT ]"
                                onAction={() => setIsAddingMode(true)}
                            />
                        ) : (
                            <div className="relative border border-black dark:border-white overflow-hidden">
                                {filteredEvents.map((event, index) => (
                                    <motion.div
                                        key={event.$id}
                                        layout="position"
                                        onClick={() => window.location.href = `/timeline#${event.$id}`}
                                        className={`group flex flex-col md:flex-row items-stretch border-b border-black/10 dark:border-white/10 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.02] dark:bg-white/[0.02]'}`}
                                    >
                                        {/* Date Column */}
                                        <div className="p-6 md:w-32 border-r border-black/10 dark:border-white/10 flex flex-col justify-center items-center md:items-start pointer-events-none">
                                            <span className="text-xl font-black text-gold">
                                                {new Date(event.date_event).getFullYear()}
                                            </span>
                                            <span className="font-mono text-[9px] uppercase text-gray-500">
                                                {new Date(event.date_event).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Content Column */}
                                        <div className="p-6 flex-1 flex flex-col justify-center gap-3 pointer-events-none">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-1 border border-black dark:border-white text-[10px] font-mono uppercase tracking-wider font-bold">
                                                    {event.category}
                                                </span>
                                            </div>
                                            <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
                                                {event.title}
                                            </h4>
                                            <p className="font-mono text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>

                                        {/* Actions Column */}
                                        <div className="p-6 md:w-48 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(event);
                                                }}
                                                className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                                title="EDIT_ENTRY"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(event.$id);
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
                isOpen={!!deletingEventId}
                onClose={() => setDeletingEventId(null)}
                onConfirm={confirmDelete}
                title="CONFIRM DELETION"
                message="PERMANENTLY DELETE TIMELINE RECORD? THIS ACTION IS IRREVERSIBLE."
                itemDetails={events.find(e => e.$id === deletingEventId)?.title}
                isLoading={isSubmitting}
            />
        </div>
    );
};
