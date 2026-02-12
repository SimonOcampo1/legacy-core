import { PageTransition } from "../components/PageTransition";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { TextReveal } from "../components/ui/TextReveal";
import { GraphiteBackground } from "../components/ui/GraphiteBackground";
import { useRef, useEffect, useState } from "react";
import { databases, storage, DATABASE_ID, NARRATIVES_COLLECTION_ID, GALLERY_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

interface HomeNarrative {
    id: string;
    title: string;
    excerpt: string;
}

interface GalleryImage {
    id: string;
    imageUrl: string;
}

export function Home() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const [narratives, setNarratives] = useState<HomeNarrative[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const BUCKET_ID = "legacy_core_assets";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Gallery Images
                const galleryResponse = await databases.listDocuments(
                    DATABASE_ID,
                    GALLERY_COLLECTION_ID,
                    [Query.limit(50)] // Fetch a good number for randomization
                );

                const mappedGalleryImages = galleryResponse.documents.map((doc: any) => {
                    let imageUrl = "";
                    if (doc.image_id && doc.image_id.startsWith("http")) {
                        imageUrl = doc.image_id;
                    } else {
                        try {
                            // OPTIMIZATION: Use getFilePreview to load smaller thumbnails instead of original 4K images
                            // Width: 400px, Height: 600px (matches aspect ratio), Quality: 80
                            imageUrl = storage.getFilePreview(BUCKET_ID, doc.image_id, 400, 600, undefined, 80).toString();
                        } catch (e) {
                            console.error("Error getting image preview:", e);
                            return null;
                        }
                    }
                    return {
                        id: doc.$id,
                        imageUrl: imageUrl
                    };
                }).filter(item => item !== null) as GalleryImage[];

                // Randomize Array (Fisher-Yates)
                for (let i = mappedGalleryImages.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mappedGalleryImages[i], mappedGalleryImages[j]] = [mappedGalleryImages[j], mappedGalleryImages[i]];
                }

                setGalleryImages(mappedGalleryImages);

                // Fetch Narratives
                const narrativesResponse = await databases.listDocuments(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    [
                        Query.orderDesc("date_event"),
                        Query.limit(3)
                    ]
                );

                const mappedNarratives: HomeNarrative[] = narrativesResponse.documents.map((doc: any) => ({
                    id: doc.$id,
                    title: doc.title,
                    excerpt: doc.content || "",
                }));
                setNarratives(mappedNarratives);

            } catch (error) {
                console.error("Failed to fetch home data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <PageTransition>
            <div ref={containerRef} className="bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen">
                {/* Hero Section */}
                <section className="relative w-full h-screen min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
                    <GraphiteBackground className="absolute inset-0 z-0">
                        <motion.div
                            style={{ y, opacity }}
                            className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center"
                        />


                        <div className="max-w-[1800px] w-full mx-auto relative z-10 flex flex-col items-center justify-center h-full text-center pb-24 md:pb-32 pt-32 md:pt-48">
                            <div className="flex items-center gap-4 mb-6 md:mb-8 opacity-80">
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: "6rem" }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                                    className="h-[1px] bg-gradient-to-r from-transparent to-charcoal dark:to-slate-400"
                                ></motion.span>
                                <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-charcoal dark:text-slate-300 flex gap-2">
                                    <span>Est.</span>
                                    <span className="text-[#C5A059]">2022</span>
                                </span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    animate={{ width: "6rem" }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                                    className="h-[1px] bg-gradient-to-l from-transparent to-charcoal dark:to-slate-400"
                                ></motion.span>
                            </div>
                            <motion.h1
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col md:flex-row items-baseline justify-center font-serif leading-none text-charcoal dark:text-white select-none gap-3 md:gap-6 lg:gap-8 flex-wrap mb-8 md:mb-12"
                            >
                                <div className="relative overflow-hidden">
                                    <TextReveal className="text-[15vw] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-normal tracking-tight">
                                        LEGACY
                                    </TextReveal>
                                </div>
                                <div className="relative">
                                    <TextReveal
                                        delay={0.2}
                                        className="text-[15vw] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-normal italic tracking-tight font-editorial text-[#C5A059] pr-4"
                                    >
                                        Core
                                    </TextReveal>
                                    <motion.span
                                        initial={{ scaleX: 0, opacity: 0 }}
                                        animate={{ scaleX: 1, opacity: 1 }}
                                        transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                                        className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-[1px] md:h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"
                                    />
                                </div>
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="w-full flex justify-center mb-20"
                            >
                                <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-slate-400 font-medium text-center max-w-xl leading-relaxed">
                                    Where the echoes of our past meet the clarity of the present
                                </p>
                            </motion.div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-charcoal dark:text-slate-300 z-20"
                        >
                            <motion.span
                                animate={{ height: [40, 64, 40] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-px bg-charcoal dark:bg-slate-400"
                            ></motion.span>
                            <span className="text-[9px] uppercase tracking-[0.25em] font-medium">Scroll</span>
                        </motion.div>
                        {/* Diffusive Gradient at Bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background-light via-background-light/50 to-transparent dark:from-background-dark dark:via-background-dark/50 dark:to-transparent z-10 pointer-events-none"></div>
                    </GraphiteBackground>
                </section>

                {/* Stories Archive Section */}
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 relative z-20">
                    <div className="flex flex-col items-center mb-32">
                        <span className="w-px h-12 bg-charcoal/30 dark:bg-white/30 mb-8"></span>
                        <h2 className="font-serif text-3xl md:text-4xl text-center text-charcoal dark:text-white tracking-wide mb-3">
                            Stories Archive
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium">
                            Curated Moments from the Past
                        </p>
                    </div>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        className="flex flex-col border-t border-charcoal/10 dark:border-white/10"
                    >
                        {narratives.map((story, index) => (
                            <motion.article
                                key={story.id}
                                variants={fadeInUp}
                                className="group relative py-24 border-b border-charcoal/10 dark:border-white/10 hover:bg-stone-50/50 dark:hover:bg-white/5 transition-colors duration-500 cursor-pointer"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-baseline">
                                    <div className="md:col-span-2 relative h-full min-h-[80px]">
                                        <span className="font-editorial italic text-6xl md:text-7xl lg:text-8xl text-stone-200 dark:text-stone-800 absolute top-1/2 -translate-y-1/2 left-8 select-none z-0 opacity-50 group-hover:opacity-100 group-hover:text-[#C5A059]/40 transition-all duration-500">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="md:col-span-7">
                                        <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-charcoal dark:text-white mb-6 leading-[1.1] tracking-tight group-hover:text-black dark:group-hover:text-slate-200 transition-colors duration-300">
                                            {story.title}
                                        </h3>
                                        <div
                                            className="font-serif text-lg md:text-xl text-stone-600 dark:text-slate-400 leading-relaxed max-w-2xl font-light line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: story.excerpt }}
                                        />
                                    </div>
                                    <div className="md:col-span-3 flex justify-end md:items-start pt-2 pr-8">
                                        <Link
                                            to={`/narratives/${story.id}`}
                                            className="relative inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-charcoal dark:text-white group/link overflow-hidden pb-1"
                                        >
                                            <span className="relative z-10 group-hover/link:text-[#C5A059] transition-colors duration-300">Read Story</span>
                                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-charcoal dark:bg-white origin-left transform scale-x-0 transition-transform duration-300 ease-out group-hover/link:scale-x-100 group-hover/link:bg-[#C5A059]" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>

                {/* Featured Carousel Section */}
                <div className="w-full pb-32 relative z-20 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="mb-16"
                    >
                        <h2 className="font-serif text-3xl md:text-4xl text-center text-charcoal dark:text-white tracking-wide mb-3">
                            Visual Memories
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-medium text-center">
                            Glimpses of a Lifetime
                        </p>
                    </motion.div>

                    {/* Infinite Marquee */}
                    <div className="flex w-full overflow-hidden mask-image-hero py-8">
                        <motion.div
                            className="flex gap-8 flex-nowrap will-change-transform"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 40,
                            }}
                        >
                            {[...galleryImages, ...galleryImages, ...galleryImages].map((image, idx) => (
                                <div
                                    key={`${image.id}-${idx}`}
                                    className="relative h-[300px] aspect-[3/4] shrink-0 overflow-hidden rounded-sm group cursor-pointer hover:scale-105 hover:z-10 transition-transform duration-500 ease-in-out origin-center hover:shadow-xl"
                                    onClick={() => setSelectedImageIndex(idx % galleryImages.length)}
                                >
                                    <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse" />
                                    <img
                                        src={image.imageUrl}
                                        alt="Gallery Memory"
                                        className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            to="/gallery"
                            className="relative inline-flex items-center gap-2 px-8 py-4 bg-charcoal dark:bg-white text-white dark:text-charcoal text-xs uppercase tracking-[0.2em] font-medium overflow-hidden group"
                        >
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-white group-hover:[text-shadow:0_1px_3px_rgba(0,0,0,0.3)]">View Complete Gallery</span>
                            <div className="absolute inset-0 bg-[#C5A059] translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0 origin-bottom" />
                        </Link>
                    </div>
                </div>

                {/* Lightbox Overlay */}
                {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImageIndex(null)}
                    >
                        <button
                            onClick={() => setSelectedImageIndex(null)}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length));
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 hidden md:block"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>

                        <div className="max-w-5xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={galleryImages[selectedImageIndex].imageUrl}
                                alt="Gallery Lightbox"
                                className="max-h-[80vh] w-auto object-contain shadow-2xl"
                            />
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length));
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 hidden md:block"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
