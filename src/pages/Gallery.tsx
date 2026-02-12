import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { PageTransition } from "../components/PageTransition";
import { databases, storage, DATABASE_ID, GALLERY_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariant: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
};

interface GalleryDisplayItem {
    id: string;
    title: string;
    date: string;
    image: string;
}

export function Gallery() {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [galleryItems, setGalleryItems] = useState<GalleryDisplayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const BUCKET_ID = "legacy_core_assets";

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    GALLERY_COLLECTION_ID,
                    [
                        Query.orderDesc("sort_date"),
                        Query.limit(100)
                    ]
                );

                const mappedItems = response.documents.map((doc: any) => {
                    let imageUrl = "";
                    if (doc.image_id.startsWith("http")) {
                        imageUrl = doc.image_id;
                    } else {
                        // Fallback or file ID handling
                        try {
                            imageUrl = storage.getFileView(BUCKET_ID, doc.image_id).toString();
                        } catch (e) {
                            console.error("Error generating image URL", e);
                        }
                    }

                    return {
                        id: doc.$id,
                        title: doc.title,
                        date: doc.display_date,
                        image: imageUrl
                    };
                });

                setGalleryItems(mappedItems);
            } catch (error) {
                console.error("Failed to fetch gallery items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const openLightbox = (index: number) => setSelectedImageIndex(index);
    const closeLightbox = () => setSelectedImageIndex(null);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev === null ? null : (prev + 1) % galleryItems.length));
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev === null ? null : (prev - 1 + galleryItems.length) % galleryItems.length));
        }
    };

    return (
        <PageTransition>
            <div className="bg-white dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-sans relative">
                {/* Lightbox Overlay */}
                {selectedImageIndex !== null && galleryItems[selectedImageIndex] && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 hidden md:block"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>

                        <div className="max-w-5xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={galleryItems[selectedImageIndex].image}
                                alt={galleryItems[selectedImageIndex].title}
                                className="max-h-[80vh] w-auto object-contain shadow-2xl"
                            />
                            <div className="text-center mt-4 text-white">
                                <h3 className="font-serif text-2xl italic tracking-wide">{galleryItems[selectedImageIndex].title}</h3>
                                <p className="text-xs uppercase tracking-widest text-white/60 mt-2">{galleryItems[selectedImageIndex].date}</p>
                            </div>
                        </div>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 hidden md:block"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </div>
                )}

                <div className="w-full mb-12 pt-12">
                    {/* ... Header Filters ... */}
                    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
                        <h2 className="font-serif text-4xl md:text-5xl font-light italic text-gray-900 dark:text-white mb-10">
                            The Summer of <span className="text-[#C5A059] not-italic font-normal">2022</span>
                        </h2>
                        <div className="border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-8 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                            <div className="flex items-center gap-4">
                                <span className="font-serif italic text-gray-400 text-sm">Year</span>
                                <div className="flex gap-4 text-xs tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">
                                    <button className="text-[#C5A059] transition-colors font-bold border-b border-[#C5A059]">2022</button>
                                    <button className="hover:text-[#C5A059] transition-colors">
                                        2021
                                    </button>
                                    <button className="hover:text-[#C5A059] transition-colors">
                                        2020
                                    </button>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800 hidden md:block"></div>
                            <div className="flex items-center gap-4">
                                <span className="font-serif italic text-gray-400 text-sm">
                                    Event Type
                                </span>
                                <div className="flex gap-4 text-xs tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">
                                    <button className="text-[#C5A059] transition-colors font-bold border-b border-[#C5A059]">All</button>
                                    <button className="hover:text-[#C5A059] transition-colors">
                                        Editorial
                                    </button>
                                    <button className="hover:text-[#C5A059] transition-colors">
                                        Parties
                                    </button>
                                    <button className="hover:text-[#C5A059] transition-colors">
                                        Travel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow px-6 lg:px-12 pb-20 max-w-[1800px] mx-auto w-full">
                    {loading ? (
                        <div className="min-h-[40vh] flex flex-col items-center justify-center">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <div className="h-12 w-12 border-4 border-stone-200 border-t-[#C5A059] rounded-full animate-spin"></div>
                                <p className="font-serif italic text-stone-400">Loading gallery...</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12"
                        >
                            {galleryItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariant}
                                    className="cursor-pointer group"
                                    onClick={() => openLightbox(index)}
                                >
                                    <div className="relative overflow-hidden mb-3 aspect-square bg-gray-50 dark:bg-gray-900">
                                        <img
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-all duration-700 ease-out filter grayscale-[20%] group-hover:scale-105 group-hover:grayscale-0"
                                            src={item.image}
                                        />
                                    </div>
                                    <div className="text-center opacity-70 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                        <p className="font-serif text-base italic text-gray-900 dark:text-white mb-0.5">
                                            {item.title}
                                        </p>
                                        <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400">
                                            {item.date}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {!loading && (
                        <div className="flex justify-center items-center py-20">
                            <button className="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#C5A059] transition-colors border-b border-transparent hover:border-[#C5A059] pb-1">
                                Load More Moments
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition >
    );
}
