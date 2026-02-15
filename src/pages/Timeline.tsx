import { useEffect, useState } from "react";
import { databases, DATABASE_ID, TIMELINE_COLLECTION_ID, PROFILES_COLLECTION_ID, getImageUrl } from "../lib/appwrite";
import { Query } from "appwrite";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { PageTransition } from "../components/PageTransition";
import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { TimelineManager } from "../components/admin/TimelineManager";
import { useScrollLock } from "../hooks/useScrollLock";

export function Timeline() {
    const { user, isAuthorized } = useAuth();
    const { currentGroup } = useGroup();

    const [isModalOpen, setIsModalOpen] = useState(false);
    useScrollLock(isModalOpen);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Record<string, any>>({});


    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentGroup?.$id) return;
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    TIMELINE_COLLECTION_ID,
                    [
                        Query.equal("group_id", currentGroup.$id),
                        Query.orderDesc("date_event"),
                        Query.limit(100)
                    ]
                );

                const mappedEvents = response.documents.map((doc: any) => ({
                    id: doc.$id,
                    date: new Date(doc.date_event).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                    year: doc.year || new Date(doc.date_event).getFullYear().toString(),
                    location: doc.location,
                    title: doc.title,
                    description: doc.description,
                    image: doc.image_id ? getImageUrl(doc.image_id) : "",
                    category: doc.category,
                    participantIds: doc.participant_ids || []
                }));

                setEvents(mappedEvents);

                // Collect all unique participant IDs and fetch their profiles
                const allIds = new Set<string>();
                mappedEvents.forEach((e: any) => e.participantIds.forEach((id: string) => allIds.add(id)));

                if (allIds.size > 0) {
                    try {
                        const profileResponse = await databases.listDocuments(
                            DATABASE_ID,
                            PROFILES_COLLECTION_ID,
                            [
                                Query.equal("$id", Array.from(allIds)),
                                Query.limit(100)
                            ]
                        );
                        const profileMap: Record<string, any> = {};
                        profileResponse.documents.forEach((p: any) => {
                            profileMap[p.$id] = {
                                id: p.$id,
                                name: p.name,
                                slug: p.slug,
                                avatar_id: p.avatar_id
                            };
                        });
                        setProfiles(profileMap);
                    } catch (profileError) {
                        console.error("Failed to fetch participant profiles:", profileError);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch timeline events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentGroup]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-[#09090b] pt-12">
                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2">
                            Events<span className="text-gold">_Log</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// TEMPORAL DATA SEQUENCE<br />
                            TRACKING KEY MOMENTS...
                        </p>
                    </div>
                    {/* Add Event Button (Admin & Members) */}
                    {isAuthorized && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-black text-white dark:bg-white dark:text-black font-mono text-xs px-6 py-3 hover:bg-gold hover:text-black transition-colors uppercase font-bold"
                        >
                            [ + APPEND_ENTRY ]
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                        [ SYNCHRONIZING_TIMELINE ]
                    </div>
                ) : events.length === 0 ? (
                    <EmptyState
                        title="CHRONO_VOID"
                        message="NO TEMPORAL RECORDS DETECTED."
                        icon={Calendar}
                        actionLabel="[ ARCHIVE_NEW_EVENT ]"
                        onAction={() => setIsModalOpen(true)}
                        className="min-h-[60vh]"
                    />
                ) : (
                    <div className="relative border-l-2 border-black dark:border-white/20 ml-4 md:ml-32 lg:ml-40 my-24 pr-4 md:pr-12 space-y-24">
                        {events.map((event) => (
                            <div key={event.id} className="relative pl-12 group">
                                {/* Timeline Node */}
                                <div className="absolute -left-[9px] top-12 w-4 h-4 bg-black dark:bg-white border-2 border-white dark:border-black ring-2 ring-black dark:ring-white group-hover:scale-125 transition-transform duration-300 z-10" />

                                {/* Date Marker (Left Sidebar) */}
                                <div className="md:absolute md:-left-40 md:top-12 md:w-32 md:text-right mb-4 md:mb-0">
                                    <div className="font-mono text-sm text-gray-500">{event.date}</div>
                                    <div className="font-black text-3xl text-black dark:text-white leading-none">{event.year}</div>
                                </div>

                                {/* Event Card */}
                                <div className="border-2 border-black dark:border-white bg-white dark:bg-transparent overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2">
                                        {/* Content Side */}
                                        <div className="p-8 md:p-12 flex flex-col justify-between min-h-[400px]">
                                            <div>
                                                <div className="flex justify-between items-start mb-6">
                                                    {event.category && (
                                                        <span className="font-mono text-xs uppercase border border-black dark:border-white px-2 py-1">
                                                            {event.category}
                                                        </span>
                                                    )}
                                                    {event.location && (
                                                        <span className="font-mono text-xs text-gold uppercase">
                                                            LOC: {event.location}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter mb-8 break-words text-black dark:text-white">
                                                    {event.title}
                                                </h3>

                                                <p className="font-mono text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-xl">
                                                    {event.description}
                                                </p>
                                            </div>

                                            {/* Participants Footer */}
                                            {event.participantIds && event.participantIds.length > 0 && (
                                                <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10">
                                                    <span className="font-mono text-[10px] opacity-50 block mb-2">PARTICIPANTS:</span>
                                                    <div className="flex -space-x-2">
                                                        {event.participantIds.map((pid: string) => {
                                                            const profile = profiles[pid];
                                                            if (!profile) return null;
                                                            return (
                                                                <Link
                                                                    key={pid}
                                                                    to={`/ profile / ${profile.slug || profile.id} `}
                                                                    className="relative group/avatar"
                                                                    title={profile.name}
                                                                >
                                                                    <img
                                                                        src={getImageUrl(profile.avatar_id)}
                                                                        className="w-8 h-8 md:w-10 md:h-10 border-2 border-black dark:border-white grayscale hover:grayscale-0 transition-all z-10 hover:z-20 bg-gray-200 object-cover"
                                                                        alt={profile.name}
                                                                    />
                                                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] bg-black text-white dark:bg-white dark:text-black px-1 py-0.5 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-30">
                                                                        {profile.name}
                                                                    </span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        {/* Media Side */}
                                        {event.image && (
                                            <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-black dark:border-white relative h-[400px] lg:h-auto overflow-hidden group-inner">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-transparent transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal for Member Timeline Events */}
                <AnimatePresence>
                    {isModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div data-lenis-prevent className="bg-white dark:bg-[#09090b] w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black dark:border-white shadow-2xl pointer-events-auto">
                                    <div className="p-4 border-b border-black dark:border-white flex justify-between items-center bg-gray-50 dark:bg-white/5">
                                        <h2 className="font-black text-xl uppercase tracking-tighter">LOG_EVENT</h2>
                                        <button onClick={() => setIsModalOpen(false)}>
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {/* TimelineManager expects memberId prop for filtering/saving to specific user */}
                                        <TimelineManager memberId={user?.$id} groupId={currentGroup?.$id} />
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
