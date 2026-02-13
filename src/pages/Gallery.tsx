import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { databases, storage, DATABASE_ID, GALLERY_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";

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
            <div className="bg-white dark:bg-[#09090b] min-h-screen text-black dark:text-gray-100 font-sans pt-12">

                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                            Visual<span className="text-[#C5A059]">_Databank</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// MEDIA REPOSITORY<br />
                            INDEXED VISUAL RECORDS...
                        </p>
                    </div>
                    {/* Filter Tabs - Brutalist */}
                    <div className="flex gap-4 font-mono text-[10px] md:text-xs">
                        {['ALL', 'EDITORIAL', 'PARTIES', 'TRAVEL'].map((filter) => (
                            <button key={filter} className={`uppercase px-2 py-1 border border-transparent hover:border-[#C5A059] hover:text-[#C5A059] transition-all ${filter === 'ALL' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500'}`}>
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
                            className="absolute top-6 right-6 text-white hover:text-[#C5A059] transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#C5A059] transition-colors p-2 hidden md:block"
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
                                    <p className="font-mono text-xs text-[#C5A059]">{galleryItems[selectedImageIndex].date}</p>
                                </div>
                                <span className="font-mono text-[10px] text-gray-500">IMG_{galleryItems[selectedImageIndex].id.substring(0, 6)}</span>
                            </div>
                        </div>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#C5A059] transition-colors p-2 hidden md:block"
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
                                        <p className="font-mono text-[10px] text-[#C5A059] mt-1">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && (
                        <div className="flex justify-center items-center py-20 border-t border-black dark:border-white/20">
                            <button className="font-mono text-xs uppercase hover:text-[#C5A059] hover:border-b hover:border-[#C5A059] transition-all">
                                [ LOAD_MORE_DATA ]
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
