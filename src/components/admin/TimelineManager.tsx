import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, TIMELINE_COLLECTION_ID } from '../../lib/appwrite';
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
    ChevronRight,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

interface TimelineEvent {
    $id: string;
    title: string;
    description: string;
    date_event: string;
    category: string;
    status: string;
    createdAt: string;
}

export const TimelineManager = () => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const navigate = useNavigate();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateEvent, setDateEvent] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('General');

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                TIMELINE_COLLECTION_ID,
                [Query.orderDesc('date_event')]
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
        fetchEvents();
    }, []);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDateEvent(new Date().toISOString().split('T')[0]);
        setCategory('General');
        setIsAddingMode(false);
        setEditingEvent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dateEvent) {
            toast.error("Title and date are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                title,
                description,
                date_event: new Date(dateEvent).toISOString(),
                category,
                status: 'published',
                createdAt: editingEvent?.createdAt || new Date().toISOString()
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
        setIsAddingMode(true);
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif italic text-charcoal dark:text-white flex items-center gap-3">
                        <History className="w-8 h-8 text-[#C5A059]" />
                        Timeline Records
                    </h2>
                    <p className="text-sm text-stone-400 mt-1 uppercase tracking-[0.2em] font-bold">Chronological Archive Management</p>
                </div>

                {!isAddingMode && (
                    <button
                        onClick={() => setIsAddingMode(true)}
                        className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-6 py-3 rounded-xl font-bold transition-all hover:bg-charcoal/90 dark:hover:bg-stone-100 text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 group active:scale-95"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Add New Event
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAddingMode ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl overflow-hidden shadow-2xl shadow-stone-200/50 dark:shadow-none"
                    >
                        <div className="p-8 md:p-12">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-serif italic text-charcoal dark:text-white">
                                    {editingEvent ? 'Refining Event Record' : 'Documenting New Milestone'}
                                </h3>
                                <button onClick={resetForm} className="p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6 md:col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Event Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Chronicle Title..."
                                            className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all font-serif text-lg italic"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 md:col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Description / Narrative</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="The story behind this anchor..."
                                            rows={4}
                                            className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Event Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                        <input
                                            type="date"
                                            value={dateEvent}
                                            onChange={(e) => setDateEvent(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl pl-14 pr-6 py-4 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all appearance-none"
                                    >
                                        <option value="General">General History</option>
                                        <option value="Academic">Academic Achievement</option>
                                        <option value="Career">Professional Career</option>
                                        <option value="Travel">Expedition</option>
                                        <option value="Personal">Personal Milestone</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 pt-6 border-t border-stone-50 dark:border-stone-800/50 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-8 py-4 rounded-2xl text-stone-400 font-bold text-[10px] uppercase tracking-widest hover:text-charcoal dark:hover:text-white transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-30 hover:bg-charcoal/90 dark:hover:bg-stone-100 text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        {isSubmitting ? "Preserving..." : "Commit to Timeline"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-[#C5A059] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search chronicles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl pl-16 pr-6 py-5 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all shadow-sm"
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p className="text-[10px] uppercase tracking-widest font-bold">Accessing Archive...</p>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-16 text-center shadow-sm">
                                <p className="text-stone-300 font-serif italic text-lg mb-6">No records match your search.</p>
                                <button
                                    onClick={() => setIsAddingMode(true)}
                                    className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold hover:underline"
                                >
                                    Create First Entry
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredEvents.map((event) => (
                                    <motion.div
                                        key={event.$id}
                                        layout
                                        className="group bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-none transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                                            <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-stone-50 dark:border-stone-800 pr-8">
                                                <span className="text-2xl font-serif italic text-[#C5A059]">
                                                    {new Date(event.date_event).getFullYear()}
                                                </span>
                                                <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold">
                                                    {new Date(event.date_event).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3">
                                                    <span className="px-2 py-0.5 bg-stone-50 dark:bg-stone-800 text-stone-400 text-[8px] uppercase tracking-widest font-bold rounded">
                                                        {event.category}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-serif italic text-charcoal dark:text-white leading-tight">
                                                    {event.title}
                                                </h4>
                                                <p className="text-sm text-stone-400 line-clamp-1 italic max-w-xl">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(event);
                                                }}
                                                className="p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-400 hover:text-charcoal dark:hover:text-white"
                                                title="Edit Entry"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(event.$id);
                                                }}
                                                className="p-3 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-stone-400 hover:text-red-500"
                                                title="Remove Entry"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/timeline`)}
                                                className="w-12 h-12 flex items-center justify-center text-stone-200 group-hover:text-[#C5A059] group-hover:translate-x-1 transition-all"
                                                title="View in Timeline"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={!!deletingEventId}
                onClose={() => setDeletingEventId(null)}
                onConfirm={confirmDelete}
                title="Remove Entry"
                message="Are you sure you want to remove this record from the timeline? This action cannot be undone."
                isLoading={isSubmitting}
            />
        </div>
    );
};
