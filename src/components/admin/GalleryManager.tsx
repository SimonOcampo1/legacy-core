import { useState, useEffect } from 'react';
import { storage, databases, DATABASE_ID, GALLERY_COLLECTION_ID } from '../../lib/appwrite';
import { ID, Query, ImageGravity } from 'appwrite';
import { Trash2, Plus, Upload, X, Loader2, Image as ImageIcon, Check, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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

    const handleDelete = async (id: string, imageId: string) => {
        if (!confirm("Are you certain you wish to discard this visual record?")) return;

        try {
            await databases.deleteDocument(DATABASE_ID, GALLERY_COLLECTION_ID, id);
            await storage.deleteFile(BUCKET_ID, imageId);
            setImages(prev => prev.filter(img => img.$id !== id));
            toast.success("Visual record discarded.");
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to remove record.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif italic text-charcoal dark:text-white flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-[#C5A059]" />
                        Visual Archive
                    </h2>
                    <p className="text-sm text-stone-400 mt-1 uppercase tracking-[0.2em] font-bold">Designated Memory Captures</p>
                </div>

                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-6 py-3 rounded-xl font-bold transition-all hover:bg-charcoal/90 dark:hover:bg-stone-100 text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 group active:scale-95"
                >
                    {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />}
                    {showUpload ? "Discard Changes" : "Capture New Memory"}
                </button>
            </div>

            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-stone-950 p-8 md:p-12 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/50 dark:shadow-none mb-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block ml-1">Visual Preview</label>
                                    <label className="relative flex flex-col items-center justify-center aspect-video w-full rounded-[2rem] border-2 border-dashed border-stone-100 dark:border-stone-800 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/5 transition-all cursor-pointer overflow-hidden group">
                                        <input type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="text-center group">
                                                <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#C5A059]/10 group-hover:text-[#C5A059] transition-colors">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Select Image File</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <div className="flex flex-col justify-end space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block ml-1">Designation</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="Chronicle Title..."
                                            className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl px-6 py-4 text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all font-serif italic text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block ml-1">Temporal Anchor</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-[#C5A059] transition-colors" />
                                            <input
                                                type="date"
                                                value={newDate}
                                                onChange={(e) => setNewDate(e.target.value)}
                                                className="w-full pl-14 pr-6 py-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl text-charcoal dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-30 hover:bg-charcoal/90 dark:hover:bg-stone-100 text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            {isUploading ? "Preserving..." : "Preserve in Gallery"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-[2rem] bg-stone-100 dark:bg-stone-800/50 animate-pulse" />
                    ))
                ) : images.length === 0 ? (
                    <div className="col-span-full py-32 bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[3rem] text-center">
                        <p className="text-stone-300 font-serif italic text-xl mb-6">Visual archive is currently empty.</p>
                        <button onClick={() => setShowUpload(true)} className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold hover:underline">Begin Collection</button>
                    </div>
                ) : (
                    images.map((img) => (
                        <motion.div
                            key={img.$id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative aspect-square bg-white dark:bg-stone-950 rounded-[2rem] overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-none transition-all duration-500"
                        >
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                <h3 className="text-white font-serif italic text-lg leading-tight truncate">{img.title}</h3>
                                <p className="text-stone-300 text-[9px] uppercase tracking-widest font-bold mt-2">{img.display_date}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(img.$id, img.image_id)}
                                className="absolute top-4 right-4 bg-white/90 dark:bg-stone-950/90 p-2.5 rounded-full text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl backdrop-blur-md"
                                title="Discard Record"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
