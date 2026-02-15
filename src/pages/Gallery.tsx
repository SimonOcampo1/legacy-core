import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { PageTransition } from "../components/PageTransition";
import { databases, DATABASE_ID, GALLERY_COLLECTION_ID, getImageUrl } from "../lib/appwrite";
import { Query } from "appwrite";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollLock } from "../hooks/useScrollLock";
import { GalleryManager } from "../components/admin/GalleryManager";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    useScrollLock(isModalOpen);
    const { isAuthorized, user } = useAuth();
    const { currentGroup } = useGroup();



    useEffect(() => {
        const fetchGallery = async () => {
            if (!currentGroup?.$id) return;
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    GALLERY_COLLECTION_ID,
                    [
                        Query.equal("group_id", currentGroup.$id),
                        Query.orderDesc("sort_date"),
                        Query.limit(100)
                    ]
                );

                const mappedItems = response.documents.map((doc: any) => ({
                    id: doc.$id,
                    title: doc.title,
                    date: doc.display_date,
                    image: getImageUrl(doc.image_id)
                }));

                setGalleryItems(mappedItems);
            } catch (error) {
                console.error("Failed to fetch gallery items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, [currentGroup]);

    const handleAppend = () => {
        setIsModalOpen(true);
    };

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
            <div className="bg-white dark:bg-[#09090b] min-h-screen text-black dark:text-gray-100 font-sans pt-12">

                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                            Visual<span className="text-gold">_Databank</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// MEDIA REPOSITORY<br />
                            INDEXED VISUAL RECORDS...
                        </p>
                    </div>
                    {/* Add Logic for Append Button */}
                    {isAuthorized && (
                        <button
                            onClick={handleAppend}
                            className="bg-black text-white dark:bg-white dark:text-black font-mono text-xs px-6 py-3 hover:bg-gold hover:text-black transition-colors uppercase font-bold"
                        >
                            [ + APPEND_ENTRY ]
                        </button>
                    )}
                </div>

                {/* Filter Tabs - Brutalist */}
                <div className="px-4 md:px-8 pb-8 flex justify-end">
                    <div className="flex gap-4 font-mono text-[10px] md:text-xs">
                        {['ALL', 'EDITORIAL', 'PARTIES', 'TRAVEL'].map((filter) => (
                            <button key={filter} className={`uppercase px-2 py-1 border border-transparent hover:border-gold hover:text-gold transition-all ${filter === 'ALL' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500'}`}>
                                [{filter}]
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lightbox Overlay */}
                {selectedImageIndex !== null && galleryItems[selectedImageIndex] && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white hover:text-gold transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors p-2 hidden md:block"
                        >
                            <ChevronLeft className="w-12 h-12" />
                        </button>

                        <div className="max-w-6xl max-h-[90vh] relative p-1 border border-white/20 bg-black" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={galleryItems[selectedImageIndex].image}
                                alt={galleryItems[selectedImageIndex].title}
                                className="max-h-[85vh] w-auto object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 border-t border-white/20 flex justify-between items-end">
                                <div>
                                    <h3 className="font-bold text-xl uppercase tracking-tight text-white">{galleryItems[selectedImageIndex].title}</h3>
                                    <p className="font-mono text-xs text-gold">{galleryItems[selectedImageIndex].date}</p>
                                </div>
                                <span className="font-mono text-[10px] text-gray-500">IMG_{galleryItems[selectedImageIndex].id.substring(0, 6)}</span>
                            </div>
                        </div>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors p-2 hidden md:block"
                        >
                            <ChevronRight className="w-12 h-12" />
                        </button>
                    </div>
                )}

                <div className="w-full">
                    {loading ? (
                        <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                            [ LOADING_VISUALS ]
                        </div>
                    ) : galleryItems.length === 0 ? (
                        <EmptyState
                            title="VISUAL_VOID"
                            message="NO VISUAL ASSETS FOUND."
                            icon={LayoutGrid}
                            actionLabel="[ UPLOAD_VISUALS ]"
                            onAction={handleAppend}
                            className="min-h-[60vh] border-y border-black/10 dark:border-white/10"
                        />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-px bg-black dark:bg-white/20 border-b border-black dark:border-white/20">
                            {galleryItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative aspect-square cursor-pointer group bg-gray-100 dark:bg-gray-900 overflow-hidden"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                                        src={item.image}
                                        loading="lazy"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                                        <p className="font-bold text-white uppercase text-sm leading-none">{item.title}</p>
                                        <p className="font-mono text-[10px] text-gold mt-1">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && (
                        <div className="flex justify-center items-center py-20 border-t border-black dark:border-white/20">
                            <button className="font-mono text-xs uppercase hover:text-gold hover:border-b hover:border-gold transition-all">
                                [ LOAD_MORE_DATA ]
                            </button>
                        </div>
                    )}
                </div>
                {/* Modal for Member Uploads */}
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
                                        <h2 className="font-black text-xl uppercase tracking-tighter">UPLOAD_VISUAL</h2>
                                        <button onClick={() => setIsModalOpen(false)}>
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <GalleryManager memberId={user?.$id} groupId={currentGroup?.$id} />
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
