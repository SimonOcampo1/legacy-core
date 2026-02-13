import { useState, useEffect } from 'react';
import { storage, databases, DATABASE_ID, GALLERY_COLLECTION_ID } from '../../lib/appwrite';
import { ID, Query, ImageGravity } from 'appwrite';
import { Trash2, Plus, Upload, X, Loader2, Image as ImageIcon, Check, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';

const BUCKET_ID = "legacy_core_assets";

interface GalleryItem {
    $id: string;
    title: string;
    image_id: string;
    sort_date: string;
    display_date: string;
    imageUrl?: string;
}

export const GalleryManager = () => {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    // New Image State
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Delete State
    const [deletingImage, setDeletingImage] = useState<{ id: string, imageId: string, title: string } | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                GALLERY_COLLECTION_ID,
                [Query.orderDesc('sort_date')]
            );

            const items = response.documents.map((doc: any) => {
                let imageUrl = "";
                if (doc.image_id.startsWith("http")) {
                    imageUrl = doc.image_id;
                } else {
                    try {
                        imageUrl = storage.getFilePreview(BUCKET_ID, doc.image_id, 800, 800, ImageGravity.Center, 85).toString();
                    } catch (e) {
                        console.error("Error generating preview URL", e);
                    }
                }

                return {
                    ...doc,
                    imageUrl
                };
            });

            setImages(items);
        } catch (error) {
            console.error("Failed to fetch gallery images:", error);
            toast.error("Failed to load visual archive.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!newImageFile || !newTitle) {
            toast.error("A capture and its designation are required.");
            return;
        }

        setIsUploading(true);
        try {
            const fileUpload = await storage.createFile(BUCKET_ID, ID.unique(), newImageFile);

            const dateObj = new Date(newDate);
            const displayDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            await databases.createDocument(
                DATABASE_ID,
                GALLERY_COLLECTION_ID,
                ID.unique(),
                {
                    title: newTitle,
                    image_id: fileUpload.$id,
                    sort_date: new Date(newDate).toISOString(),
                    display_date: displayDate,
                }
            );

            toast.success("Visual record preserved.");
            setShowUpload(false);
            setNewImageFile(null);
            setNewTitle('');
            setPreviewUrl(null);
            await fetchImages();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to preserve visual record.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (id: string, imageId: string, title: string) => {
        setDeletingImage({ id, imageId, title });
    };

    const confirmDelete = async () => {
        if (!deletingImage) return;

        setIsUploading(true); // Reuse isUploading for loading state to block UI
        try {
            await databases.deleteDocument(DATABASE_ID, GALLERY_COLLECTION_ID, deletingImage.id);
            await storage.deleteFile(BUCKET_ID, deletingImage.imageId);
            setImages(prev => prev.filter(img => img.$id !== deletingImage.id));
            toast.success("Visual record discarded.");
            setDeletingImage(null);
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to remove record.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-black dark:border-white pb-6">
                <div>
                    <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter flex items-center gap-4">
                        VISUAL_DB
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2">
                        // MEMORY_IMAGE_ARCHIVE
                    </p>
                </div>

                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="group flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-[#C5A059] hover:text-black dark:hover:bg-[#C5A059] transition-all"
                >
                    {showUpload ? (
                        <>
                            <X className="w-4 h-4" />
                            <span>ABORT_UPLOAD</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            <span>INITIATE_UPLOAD</span>
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border border-black dark:border-white p-6 bg-gray-50 dark:bg-white/5"
                    >
                        <h3 className="font-mono text-xs uppercase mb-6 font-bold flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            UPLOAD_CONSOLE
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="font-mono text-[10px] uppercase text-gray-500">SOURCE_FILE</label>
                                <label className="relative flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed border-black dark:border-white/20 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all cursor-pointer overflow-hidden group bg-white dark:bg-black">
                                    <input type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="font-mono text-xs text-white uppercase">CHANGE_SOURCE</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center group">
                                            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center mx-auto mb-3 group-hover:bg-[#C5A059] group-hover:border-[#C5A059] group-hover:text-black transition-colors">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-[#C5A059]">SELECT_IMAGE_DATA</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="flex flex-col justify-between space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase text-gray-500">FILE_DESIGNATION</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="ENTER_TITLE_ID..."
                                            className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black focus:border-[#C5A059] transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase text-gray-500">TEMPORAL_MARKER</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={newDate}
                                                onChange={(e) => setNewDate(e.target.value)}
                                                className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-black focus:border-[#C5A059] transition-colors uppercase"
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="w-full md:w-auto px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-[#C5A059] hover:text-black dark:hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        {isUploading ? "PROCESSING_DATA..." : "EXECUTE_UPLOAD"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 dark:bg-white/5 animate-pulse border border-transparent" />
                    ))
                ) : images.length === 0 ? (
                    <div className="col-span-full py-24 border border-dashed border-black/20 dark:border-white/20 text-center">
                        <p className="font-mono text-sm uppercase text-gray-500">ARCHIVE_EMPTY // NO_DATA_FOUND</p>
                        <button onClick={() => setShowUpload(true)} className="mt-4 text-[#C5A059] font-mono text-xs underline decoration-1 underline-offset-4 hover:bg-[#C5A059] hover:text-black p-1 transition-colors">INITIALIZE_FIRST_ENTRY</button>
                    </div>
                ) : (
                    images.map((img) => (
                        <motion.div
                            key={img.$id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group relative aspect-square bg-gray-100 dark:bg-black border border-black dark:border-white overflow-hidden"
                        >
                            <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
                            />

                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                                <div className="flex justify-between items-start">
                                    <span className="font-mono text-[9px] text-[#C5A059] uppercase tracking-wider border border-[#C5A059] px-1">IMG_{img.$id.substring(0, 4)}</span>
                                    <button
                                        onClick={() => handleDelete(img.$id, img.image_id, img.title)}
                                        className="text-white hover:text-red-500 transition-colors"
                                        title="DELETE_RECORD"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold uppercase text-sm leading-tight mb-1">{img.title}</h3>
                                    <p className="font-mono text-[9px] text-gray-400 uppercase">{img.display_date}</p>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={!!deletingImage}
                onClose={() => setDeletingImage(null)}
                onConfirm={confirmDelete}
                title="CONFIRM IMAGE DELETION"
                message="PERMANENTLY REMOVE VISUAL RECORD? IRREVERSIBLE."
                itemDetails={deletingImage?.title}
                isLoading={isUploading}
            />
        </div>
    );
};
