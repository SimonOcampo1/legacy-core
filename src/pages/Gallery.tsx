import { useState } from "react";
import { galleryItems } from "../data/gallery";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

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

import { PageTransition } from "../components/PageTransition";

export function Gallery() {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
                {selectedImageIndex !== null && (
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
                    {/* ... Rest of the component (header filters) ... */}
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

                        {/* View All Placeholder */}
                        <motion.div variants={itemVariant} className="cursor-pointer group">
                            <div className="relative overflow-hidden mb-3 aspect-square bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                <span className="font-serif italic text-gray-300 group-hover:text-gray-500 transition-colors">
                                    More...
                                </span>
                            </div>
                            <div className="text-center opacity-70 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                <p className="font-serif text-base italic text-gray-900 dark:text-white mb-0.5">
                                    Archive
                                </p>
                                <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400">
                                    View All
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="flex justify-center items-center py-20">
                        <button className="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#C5A059] transition-colors border-b border-transparent hover:border-[#C5A059] pb-1">
                            Load More Moments
                        </button>
                    </div>
                </div>
            </div>
        </PageTransition >
    );
}
