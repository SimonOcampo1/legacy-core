import { PageTransition } from "../components/PageTransition";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Activity, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID, GALLERY_COLLECTION_ID, TIMELINE_COLLECTION_ID, getImageUrl } from "../lib/appwrite";
import { Query, type Models } from "appwrite";
import { GroupLogo } from "../components/groups/GroupLogo";
import { InteractiveGridBackground } from "../components/ui/InteractiveGridBackground";
import { useGroup } from "../context/GroupContext";
import { EmptyState } from "../components/ui/EmptyState";
import { LayoutGrid, ScrollText, Calendar } from "lucide-react";

interface HomeNarrative {
    id: string;
    title: string;
    excerpt: string;
    date: string;
}

interface GalleryImage {
    id: string;
    imageUrl: string;
}

interface GalleryDocument extends Models.Document {
    image_id: string;
}

interface NarrativeDocument extends Models.Document {
    title: string;
    content: string;
    date_event: string;
}

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    date: string;
}

export function Home() {
    const { currentGroup } = useGroup();
    const [narratives, setNarratives] = useState<HomeNarrative[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentGroup) return;

            try {
                // Fetch Gallery Images
                const galleryResponse = await databases.listDocuments(
                    DATABASE_ID,
                    GALLERY_COLLECTION_ID,
                    [
                        Query.equal('group_id', currentGroup.$id),
                        Query.limit(20)
                    ]
                );

                const mappedGalleryImages = galleryResponse.documents.map((doc: Models.Document) => {
                    const galleryDoc = doc as GalleryDocument;
                    const imageId = galleryDoc.image_id;
                    if (!imageId) return null;

                    const imageUrl = imageId.startsWith("http") ? imageId : getImageUrl(imageId);
                    return { id: doc.$id, imageUrl };
                }).filter(item => item !== null) as GalleryImage[];

                setGalleryImages(mappedGalleryImages);

                // Fetch Narratives
                const narrativesResponse = await databases.listDocuments(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    [
                        Query.equal('group_id', currentGroup.$id),
                        Query.orderDesc("date_event"),
                        Query.limit(5)
                    ]
                );

                const mappedNarratives: HomeNarrative[] = narrativesResponse.documents.map((doc: Models.Document) => {
                    const narrativeDoc = doc as NarrativeDocument;
                    return {
                        id: doc.$id,
                        title: narrativeDoc.title,
                        excerpt: narrativeDoc.content || "",
                        date: new Date(narrativeDoc.date_event).getFullYear().toString()
                    };
                });
                setNarratives(mappedNarratives);

                // Fetch Timeline Events
                const timelineResponse = await databases.listDocuments(
                    DATABASE_ID,
                    TIMELINE_COLLECTION_ID,
                    [
                        Query.equal('group_id', currentGroup.$id),
                        Query.orderDesc("date_event"),
                        Query.limit(3)
                    ]
                );

                const mappedEvents: TimelineEvent[] = timelineResponse.documents.map((doc: Models.Document) => ({
                    id: doc.$id,
                    title: (doc as any).title,
                    description: (doc as any).description,
                    date: (doc as any).date_event
                }));
                setTimelineEvents(mappedEvents);

            } catch (error) {
                console.error("Failed to fetch home data:", error);
            }
        };

        fetchData();
    }, [currentGroup]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <PageTransition>
            <div className="bg-white dark:bg-[#09090b] text-black dark:text-gray-100 min-h-screen font-sans selection:bg-gold selection:text-black">

                {/* Hero Section */}
                <section id="hero" ref={heroRef} className="relative w-full h-screen flex flex-col justify-between p-4 md:p-8 border-b-2 border-black dark:border-white/20 overflow-hidden">
                    {/* Interactive Grid Background */}
                    <InteractiveGridBackground />

                    {/* Top Bar */}
                    <motion.div
                        className="flex justify-between items-start relative z-10 pointer-events-none"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-gold animate-pulse" />
                            <span className="font-mono text-xs md:text-sm tracking-tighter text-gold">[ {currentGroup?.name.toUpperCase() || "LEGACY CORE"} v1.0 ]</span>
                        </div>
                        <div className="text-right">
                            <span className="font-mono text-xs md:text-sm block">EST. 2022</span>
                            <span className="font-mono text-xs md:text-sm block text-gray-400">ARCHIVE_SYSTEM</span>
                        </div>
                    </motion.div>

                    {/* Main Title - Left Aligned */}
                    <div className="relative z-10 select-none flex flex-col justify-center items-start h-full pointer-events-none">
                        <motion.div
                            style={{ scale: heroScale, opacity: heroOpacity }}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-left"
                        >
                            <motion.h1 variants={itemVariants} className="text-[12vw] leading-[0.85] font-black tracking-tighter text-black dark:text-white mix-blend-difference flex flex-col items-start">
                                <span className="block hover:text-transparent hover:text-stroke-black dark:hover:text-stroke-white transition-all duration-300">
                                    {currentGroup ? currentGroup.name.split(' ')[0] : "LEGACY"}
                                </span>
                                <span className="block text-gold">
                                    {currentGroup ? (currentGroup.name.split(' ').slice(1).join(' ') || "CORE") : "CORE"}
                                </span>
                            </motion.h1>
                        </motion.div>
                    </div>

                    {/* Bottom Bar */}
                    <motion.div
                        className="flex justify-between items-end relative z-10 pointer-events-none"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    >
                        <div className="max-w-md">
                            <p className="font-mono text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                <span className="text-gold">///</span> MEMORY ARCHIVAL SYSTEM<br />
                                PRESERVING ECHOES OF THE PAST WITH CLARITY.<br />
                                ACCESSING DATABANK...
                            </p>
                        </div>
                        <motion.div
                            className="hidden md:flex flex-col items-center gap-2 text-gold"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="font-mono text-xs writing-vertical-rl rotate-180">SCROLL_DOWN</span>
                            <ArrowRight className="w-4 h-4 rotate-90" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Narratives List (Brutalist Table) */}
                <section className="w-full border-b-2 border-black dark:border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black dark:divide-white/20 border-b border-black dark:border-white/20">
                        <div className="p-4 md:p-8 col-span-1 bg-black text-white dark:bg-white dark:text-black sticky top-0 md:h-screen md:sticky md:top-0 z-10">
                            <h2 className="font-mono text-sm tracking-widest mb-4 text-gold">/// ARCHIVE_INDEX</h2>
                            <p className="text-3xl font-bold tracking-tighter">LATEST ENTRIES</p>
                            <div className="mt-8 hidden md:block w-8 h-1 bg-gold" />
                        </div>
                        <div className="col-span-3">
                            {/* Narrative Items */}
                            {narratives.length === 0 ? (
                                <EmptyState
                                    title="NARRATIVE_VOID"
                                    message="NO NARRATIVE DATA FOUND."
                                    icon={ScrollText}
                                    actionLabel="[ INITIALIZE_FIRST_ENTRY ]"
                                    actionLink="/admin/narratives"
                                />
                            ) : (
                                <>
                                    {narratives.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                        >
                                            <Link to={`/narratives/${item.id}`} className="block group">
                                                <div className="grid grid-cols-12 gap-4 p-4 md:p-6 border-b border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                                    <div className="col-span-2 font-mono text-xs opacity-50 pt-1 group-hover:text-gold transition-colors">{(index + 1).toString().padStart(2, '0')}</div>
                                                    <div className="col-span-8">
                                                        <h3 className="text-xl md:text-3xl font-bold uppercase tracking-tight mb-2 group-hover:translate-x-2 transition-transform duration-200">{item.title}</h3>
                                                        <p className="font-mono text-xs md:text-sm opacity-60 line-clamp-1">{item.excerpt.replace(/<[^>]*>?/gm, '')}</p>
                                                    </div>
                                                    <div className="col-span-2 flex justify-end items-start">
                                                        <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                    <Link to="/narratives" className="block p-4 md:p-6 bg-gray-100 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                        <div className="flex justify-between items-center font-mono text-sm">
                                            <span>[ VIEW_ALL_ARCHIVES ]</span>
                                            <ArrowRight className="w-4 h-4 group-hover:text-gold transition-colors" />
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Timeline Preview Section */}
                <section className="w-full border-b-2 border-black dark:border-white/20 bg-gray-50 dark:bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black dark:divide-white/20">
                        <div className="p-8 md:w-1/3 flex flex-col justify-center">
                            <h2 className="font-mono text-sm tracking-widest mb-4 text-gold">/// CHRONO_FLOW</h2>
                            <p className="text-4xl font-black uppercase tracking-tighter">Timeline<br />Highlights</p>
                        </div>
                        <div className="flex-1 p-8">
                            {timelineEvents.length === 0 ? (
                                <EmptyState
                                    title="CHRONO_VOID"
                                    message="NO TEMPORAL RECORDS FOUND."
                                    icon={Calendar}
                                    actionLabel="[ ARCHIVE_NEW_EVENT ]"
                                    actionLink="/admin/timeline"
                                />
                            ) : (
                                <div className="space-y-8">
                                    {timelineEvents.map((event, idx) => (
                                        <div key={event.id} className="flex gap-6 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full border border-black dark:border-white flex items-center justify-center font-bold text-lg group-hover:bg-gold transition-colors">
                                                    {new Date(event.date).getFullYear().toString().slice(-2)}
                                                </div>
                                                {idx !== timelineEvents.length - 1 && <div className="w-px h-full bg-black/10 dark:bg-white/10" />}
                                            </div>
                                            <div className="pb-8">
                                                <h4 className="text-xl font-bold uppercase tracking-tight group-hover:text-gold transition-colors">{event.title}</h4>
                                                <p className="font-mono text-xs text-gray-500 mb-2 uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                <p className="font-mono text-sm opacity-60 line-clamp-2">{event.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <Link to="/timeline" className="inline-block font-mono text-xs uppercase tracking-widest text-gold hover:underline">
                                        [ ACCESS_FULL_CHRONICLE ]
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Gallery Marquee */}
                <section className="w-full overflow-hidden border-b-2 border-black dark:border-white/20 py-8 md:py-16 brutal-grid bg-white dark:bg-[#09090b]">
                    <div className="mb-8 px-4 md:px-8 flex justify-between items-end">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase relative inline-block">
                            Visual<br />
                            <span className="text-gold">Databank</span>
                        </h2>
                        <Link to="/gallery" className="font-mono text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black p-1 transition-colors">
                            [ VIEW_FULL_GALLERY ]
                        </Link>
                    </div>

                    {/* Seamless Infinite Marquee */}
                    {/* Seamless Infinite Marquee or Empty State */}
                    {galleryImages.length === 0 ? (
                        <EmptyState
                            title="VISUAL_VOID"
                            message="NO VISUAL ASSETS FOUND."
                            icon={LayoutGrid}
                            actionLabel="[ UPLOAD_VISUALS ]"
                            actionLink="/admin/gallery"
                            className="h-[400px] border-y"
                        />
                    ) : (
                        <div className="relative w-full flex overflow-hidden group py-4">
                            {/* Track 1 */}
                            <div className="animate-marquee flex gap-4 min-w-full pr-4 flex-shrink-0">
                                {[...galleryImages].map((img, i) => (
                                    <div
                                        key={`${img.id}-track1-${i}`}
                                        className="relative w-[300px] h-[400px] bg-gray-200 dark:bg-gray-800 flex-none overflow-hidden border border-transparent hover:border-gold cursor-pointer group/image"
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <div className="absolute inset-0 bg-black/20 group-hover/image:bg-transparent transition-colors z-10" />
                                        <img
                                            src={img.imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover transition-all duration-300 filter grayscale group-hover/image:grayscale-0 group-hover/image:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 left-2 z-20 bg-gold text-black text-[10px] font-mono px-1 py-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity font-bold">
                                            IMG_{img.id.substring(0, 6)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Track 2 */}
                            <div className="animate-marquee flex gap-4 min-w-full pr-4 flex-shrink-0 absolute top-4 left-0 translate-x-full">
                                {[...galleryImages].map((img, i) => (
                                    <div
                                        key={`${img.id}-track2-${i}`}
                                        className="relative w-[300px] h-[400px] bg-gray-200 dark:bg-gray-800 flex-none overflow-hidden border border-transparent hover:border-gold cursor-pointer group/image"
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <div className="absolute inset-0 bg-black/20 group-hover/image:bg-transparent transition-colors z-10" />
                                        <img
                                            src={img.imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover transition-all duration-300 filter grayscale group-hover/image:grayscale-0 group-hover/image:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 left-2 z-20 bg-gold text-black text-[10px] font-mono px-1 py-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity font-bold">
                                            IMG_{img.id.substring(0, 6)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Lightbox Overlay */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 text-white hover:text-gold transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="max-w-6xl max-h-[90vh] relative p-1 border border-white/20 bg-black" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={selectedImage.imageUrl}
                                alt={`IMG_${selectedImage.id}`}
                                className="max-h-[85vh] w-auto object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 border-t border-white/20 flex justify-between items-end">
                                <div>
                                    <h3 className="font-bold text-xl uppercase tracking-tight text-white">IMG_{selectedImage.id.substring(0, 6)}</h3>
                                    <p className="font-mono text-xs text-gold">VISUAL_RECORD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                <footer className="p-4 md:p-8 flex flex-col md:flex-row justify-between items-end gap-8 bg-black text-white dark:bg-white dark:text-black border-t border-gold">
                    <div className="flex items-center gap-6 h-full">
                        <div className="flex flex-col justify-between h-[72px]">
                            <h3 className="font-black text-2xl tracking-tighter leading-none pt-1">{currentGroup?.name || "LEGACY CORE"}</h3>
                            <p className="font-mono text-xs opacity-60 leading-tight pb-1">
                                <span className="text-gold">●</span> SYSTEM_STATUS: ONLINE<br />
                                V1.0.4.5-BETA
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-mono text-[10px] block opacity-50">CREATED BY SIMON OCAMPO</span>
                        <span className="font-mono text-[10px] block opacity-50">© 2026 // ALL RIGHTS RESERVED</span>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
}
