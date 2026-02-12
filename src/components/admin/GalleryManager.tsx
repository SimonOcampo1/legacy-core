import { useState, useEffect } from 'react';
import { storage, databases, DATABASE_ID, GALLERY_COLLECTION_ID } from '../../lib/appwrite';
import { ID, Query, ImageGravity } from 'appwrite';
import { Trash2, Plus, Upload, X, Loader2 } from 'lucide-react';

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

            const items = response.documents.map((doc: any) => ({
                ...doc,
                imageUrl: storage.getFilePreview(BUCKET_ID, doc.image_id, 400, 400, ImageGravity.Center, 75).toString()
            }));

            setImages(items);
        } catch (error) {
            console.error("Failed to fetch gallery images:", error);
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
            alert("Please select an image and provide a title.");
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload to Storage
            const fileUpload = await storage.createFile(BUCKET_ID, ID.unique(), newImageFile);

            // 2. Create Database Document
            // Format display date from sorting date
            const dateObj = new Date(newDate);
            const displayDate = dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

            await databases.createDocument(
                DATABASE_ID,
                GALLERY_COLLECTION_ID,
                ID.unique(),
                {
                    title: newTitle,
                    image_id: fileUpload.$id,
                    sort_date: new Date(newDate).toISOString(),
                    display_date: displayDate,
                } // Appwrite Auto-generates $id, $createdAt, etc.
            );

            // Refetch
            await fetchImages();

            // Reset Form
            setShowUpload(false);
            setNewImageFile(null);
            setNewTitle('');
            setPreviewUrl(null);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, imageId: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            await databases.deleteDocument(DATABASE_ID, GALLERY_COLLECTION_ID, id);
            await storage.deleteFile(BUCKET_ID, imageId);
            setImages(prev => prev.filter(img => img.$id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete image.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif text-slate-800">Gallery Management</h2>
                    <p className="text-stone-500 text-sm">Manage your visual memories.</p>
                </div>
                <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium shadow-sm"
                >
                    {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showUpload ? "Cancel" : "Add Photo"}
                </button>
            </div>

            {/* Upload Area */}
            {showUpload && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-4 items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-lg bg-stone-50 hover:bg-white transition-colors">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="max-h-48 object-contain rounded-md shadow-sm" />
                            ) : (
                                <div className="text-center text-stone-400">
                                    <Upload className="w-8 h-8 mx-auto mb-2" />
                                    <span className="text-xs">Select Image</span>
                                </div>
                            )}
                            <input type="file" onChange={handleFileSelect} accept="image/*" className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200" />
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Summer Trip 2024"
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Date</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-400 focus:outline-none"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isUploading ? "Uploading..." : "Save to Gallery"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div key={img.$id} className="group relative aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all">
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <h3 className="text-white font-serif text-sm truncate">{img.title}</h3>
                                <p className="text-white/80 text-xs">{img.display_date}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(img.$id, img.image_id)}
                                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {images.length === 0 && !isLoading && (
                        <div className="col-span-full py-12 text-center text-stone-400 text-sm">
                            No images in gallery yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
