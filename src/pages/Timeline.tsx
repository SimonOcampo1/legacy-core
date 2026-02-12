import { useEffect, useState } from "react";
import { databases, storage, DATABASE_ID, TIMELINE_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import type { TimelineEvent } from "../types";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

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

                // Map Appwrite documents to component state
                const mappedEvents = response.documents.map((doc: any) => {
                    const event = doc as TimelineEvent;

                    // Format date
                    const dateObj = new Date(event.date_event);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                    // Get image URL
                    let imageUrl = "";
                    if (event.image_id) {
                        if (event.image_id.startsWith("http")) {
                            imageUrl = event.image_id;
                        } else {
                            imageUrl = storage.getFileView(BUCKET_ID, event.image_id).toString();
                        }
                    }

                    // Get attendee URLs
                    const attendees = event.attendee_image_urls || [];

                    return {
                        id: event.$id,
                        date: formattedDate,
                        year: event.year || dateObj.getFullYear().toString(),
                        location: event.location,
                        title: event.title,
                        description: event.description,
                        image: imageUrl,
                        attendees: attendees
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-charcoal dark:border-stone-800 dark:border-t-stone-200"></div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="bg-background-light dark:bg-background-dark min-h-screen text-timeline-primary dark:text-slate-200">
                <div className="w-full max-w-4xl text-center mb-24 relative mx-auto pt-16 px-4">
                    <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-6 relative z-10">
                        Our <span className="text-[#C5A059] italic">Journey</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-sans font-light leading-relaxed">
                        A curated collection of moments, captured in time.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 mt-12 border-b border-line-grey dark:border-slate-800 pb-4 max-w-md mx-auto">
                        <button className="text-[#C5A059] border-b-2 border-[#C5A059] pb-4 -mb-5 text-xs uppercase tracking-widest font-medium transition-all">
                            All Time
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-6xl mx-auto relative px-4 md:px-0">
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-line-grey dark:bg-slate-800 md:-translate-x-1/2 h-full z-0"></div>
                    <div className="flex flex-col gap-24 md:gap-36 pb-20">
                        {events.length === 0 ? (
                            <div className="text-center py-20 text-stone-400 font-serif italic z-10 relative bg-background-light dark:bg-background-dark">
                                No events found.
                            </div>
                        ) : (
                            events.map((event, index) => (
                                <motion.article
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    key={event.id}
                                    className={`relative flex flex-col md:flex-row md:justify-between group`}
                                >

                                    {/* Date Column */}
                                    <div className={`flex md:w-1/2 mb-4 md:mb-0 w-full relative ${index % 2 === 0
                                        ? "md:justify-end md:pr-16 order-2 md:order-1 pl-12 md:pl-0" // Date Left
                                        : "md:pl-16 order-2 md:order-2 pl-12" // Date Right
                                        }`}>
                                        <div className={`text-left ${index % 2 === 0 ? "md:text-right" : "md:text-left"} sticky top-32 self-start transition-opacity duration-500`}>
                                            <span className="block font-serif font-light text-4xl md:text-5xl mb-2 text-timeline-primary dark:text-white">
                                                {event.date}
                                            </span>
                                            <span className="block text-slate-500 dark:text-slate-400 font-sans font-light text-xl mb-1">
                                                {event.year}
                                            </span>
                                            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                                                {event.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="absolute left-4 md:left-1/2 top-2 md:top-6 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 group-hover:border-[#C5A059] group-hover:scale-125 transition-all duration-500 rounded-full z-10 md:-translate-x-1/2 flex items-center justify-center order-1 shadow-sm">
                                    </div>

                                    {/* Content Column */}
                                    <div className={`flex md:w-1/2 w-full pl-12 ${index % 2 === 0
                                        ? "md:pl-16 order-3 md:order-2" // Content Right
                                        : "md:justify-end md:pr-16 order-3 md:order-1" // Content Left
                                        }`}>
                                        <div className={`bg-background-light dark:bg-transparent rounded-sm p-8 transition-all duration-500 w-full md:text-left border-none shadow-none ring-0 ${index % 2 !== 0 ? "md:text-right" : ""}`}>
                                            {event.image && (
                                                <div className={`aspect-[4/3] w-full bg-stone-50 dark:bg-slate-800 mb-6 overflow-hidden relative group/image ${index % 2 !== 0 ? "ml-auto" : ""}`}>
                                                    <img
                                                        alt={event.title}
                                                        className="w-full h-full object-cover grayscale group-hover/image:grayscale-0 transition-all duration-700 ease-in-out"
                                                        src={event.image}
                                                    />
                                                </div>
                                            )}
                                            <div className={`max-w-md ${index % 2 !== 0 ? "ml-auto" : ""}`}>
                                                <h3 className="text-2xl font-serif font-normal mb-3 text-timeline-primary dark:text-white">
                                                    {event.title}
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-sans font-light text-sm leading-7 mb-6">
                                                    {event.description}
                                                </p>

                                                {event.attendees && event.attendees.length > 0 && (
                                                    <div className={`flex items-center gap-3 pt-4 border-t border-line-grey/30 dark:border-slate-800 ${index % 2 !== 0 ? "justify-end md:flex-row-reverse" : ""}`}>
                                                        <div className="flex -space-x-3 overflow-hidden">
                                                            {event.attendees.map((attendee: string, i: number) => (
                                                                <img
                                                                    key={i}
                                                                    src={attendee}
                                                                    alt="Attendee"
                                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 grayscale hover:grayscale-0 transition-all"
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal font-sans">
                                                            + friends
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => navigate("/admin?tab=timeline")}
                        aria-label="Add new memory"
                        className="fixed bottom-10 right-10 z-40 bg-white dark:bg-slate-800 text-timeline-primary dark:text-white rounded-full p-4 shadow-xl border border-line-grey dark:border-slate-700 hover:bg-[#C5A059] hover:border-[#C5A059] hover:text-white transition-all duration-500 group hover:scale-110"
                    >
                        <Plus className="w-6 h-6 font-light" />
                    </button>
                )}
            </div>
        </PageTransition>
    );
}
