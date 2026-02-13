import { useEffect, useState } from "react";
import { databases, storage, DATABASE_ID, TIMELINE_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageTransition } from "../components/PageTransition";

export function Timeline() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const BUCKET_ID = "legacy_core_assets";

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    TIMELINE_COLLECTION_ID,
                    [
                        Query.orderDesc("date_event"),
                        Query.limit(100)
                    ]
                );

                const mappedEvents = response.documents.map((doc: any) => {
                    let imageUrl = "";
                    if (doc.image_id) {
                        if (doc.image_id.startsWith("http")) {
                            imageUrl = doc.image_id;
                        } else {
                            try {
                                imageUrl = storage.getFileView(BUCKET_ID, doc.image_id).toString();
                            } catch (e) {
                                console.error("Error getting image view:", e);
                            }
                        }
                    }

                    return {
                        id: doc.$id,
                        date: new Date(doc.date_event).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
                        year: doc.year || new Date(doc.date_event).getFullYear().toString(),
                        location: doc.location,
                        title: doc.title,
                        description: doc.description,
                        image: imageUrl,
                        category: doc.category,
                        attendees: doc.attendee_image_urls || []
                    };
                });

                setEvents(mappedEvents);
            } catch (error) {
                console.error("Failed to fetch timeline events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-[#09090b] pt-12">
                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2">
                            Events<span className="text-[#C5A059]">_Log</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// TEMPORAL DATA SEQUENCE<br />
                            TRACKING KEY MOMENTS...
                        </p>
                    </div>
                    {/* Add Event Button (Admin Only) */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate("/admin?tab=timeline")}
                            className="bg-black text-white dark:bg-white dark:text-black font-mono text-xs px-6 py-3 hover:bg-[#C5A059] hover:text-black transition-colors uppercase font-bold"
                        >
                            [ + APPEND_ENTRY ]
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                        [ SYNCHRONIZING_TIMELINE ]
                    </div>
                ) : (
                    <div className="relative border-l-2 border-black dark:border-white/20 ml-4 md:ml-32 lg:ml-40 my-24 pr-4 md:pr-12 space-y-24">
                        {events.length === 0 ? (
                            <div className="pl-8 font-mono text-sm text-gray-400">
                                [ NO_EVENTS_RECORDED ]
                            </div>
                        ) : (
                            events.map((event) => (
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
                                                            <span className="font-mono text-xs text-[#C5A059] uppercase">
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

                                                {/* Attendees Footer */}
                                                {event.attendees && event.attendees.length > 0 && (
                                                    <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10">
                                                        <span className="font-mono text-[10px] opacity-50 block mb-2">PARTICIPANTS:</span>
                                                        <div className="flex -space-x-2">
                                                            {event.attendees.map((url: string, i: number) => (
                                                                <img
                                                                    key={i}
                                                                    src={url}
                                                                    className="w-8 h-8 md:w-10 md:h-10 border-2 border-black dark:border-white grayscale hover:grayscale-0 transition-all z-10 hover:z-20 bg-gray-200"
                                                                    alt="Attendee"
                                                                />
                                                            ))}
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
                            ))
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
