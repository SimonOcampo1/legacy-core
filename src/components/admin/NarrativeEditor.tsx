import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../../lib/utils';
import { useState, useCallback, useEffect } from 'react';
import {
    Bold, Italic, Quote, Image as ImageIcon,
    Undo, Redo, Calendar, Upload, X, Check, Loader2, ChevronLeft
} from 'lucide-react';
import { storage, databases, DATABASE_ID, NARRATIVES_COLLECTION_ID, BUCKET_ID, getImageUrl } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';



interface NarrativeEditorProps {
    memberId?: string;
    initialData?: {
        $id: string;
        title: string;
        content: string;
        date_event?: string;
        cover_image_id?: string;
        category?: string;
    };
    onSuccess?: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                setIsUploading(true);

                try {
                    const response = await storage.createFile(
                        BUCKET_ID,
                        ID.unique(),
                        file
                    );

                    const url = getImageUrl(response.$id);

                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast.error("Failed to upload image.");
                } finally {
                    setIsUploading(false);
                }
            }
        };

        input.click();
    }, [editor]);

    return (
        <div className="flex flex-wrap items-center gap-px p-4 border-b border-black dark:border-white bg-gray-50 dark:bg-white/5 sticky top-0 z-10">
            <div className="flex items-center mr-4">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        "p-2 font-black text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors uppercase",
                        editor.isActive('heading', { level: 1 }) ? 'bg-black text-[gold] dark:bg-white dark:text-black' : ''
                    )}
                    title="H1"
                    type="button"
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        "p-2 font-black text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors uppercase",
                        editor.isActive('heading', { level: 2 }) ? 'bg-black text-[gold] dark:bg-white dark:text-black' : ''
                    )}
                    title="H2"
                    type="button"
                >
                    H2
                </button>
            </div>

            <div className="flex items-center mr-4 border-l border-black dark:border-white pl-4">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        "p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors",
                        editor.isActive('bold') ? 'bg-black text-[gold] dark:bg-white dark:text-black' : ''
                    )}
                    title="Bold"
                    type="button"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        "p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors",
                        editor.isActive('italic') ? 'bg-black text-[gold] dark:bg-white dark:text-black' : ''
                    )}
                    title="Italic"
                    type="button"
                >
                    <Italic className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center border-l border-black dark:border-white pl-4">
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        "p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors",
                        editor.isActive('blockquote') ? 'bg-black text-[gold] dark:bg-white dark:text-black' : ''
                    )}
                    title="Quote"
                    type="button"
                >
                    <Quote className="w-4 h-4" />
                </button>
                <button onClick={addImage} className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors relative" title="Image" type="button">
                    <ImageIcon className="w-4 h-4" />
                    {isUploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80">
                            <Loader2 className="w-3 h-3 animate-spin" />
                        </span>
                    )}
                </button>
            </div>

            <div className="ml-auto flex items-center gap-1 border-l border-black dark:border-white pl-4">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-30"
                    title="Undo"
                    type="button"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-30"
                    title="Redo"
                    type="button"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const NarrativeEditor = ({ memberId, initialData, onSuccess }: NarrativeEditorProps) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [isSaving, setIsSaving] = useState(false);
    const [coverImageId, setCoverImageId] = useState<string | null>(initialData?.cover_image_id || null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [category, setCategory] = useState(initialData?.category || 'General');
    const [eventDate, setEventDate] = useState<string>(
        initialData?.date_event
            ? new Date(initialData.date_event).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    const { user } = useAuth();

    // Effect to load cover image URL if initialData has an ID
    useEffect(() => {
        if (initialData?.cover_image_id) {
            setCoverImageUrl(getImageUrl(initialData.cover_image_id));
        }
    }, [initialData?.cover_image_id]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-[#C5A059] pl-6 py-2 my-8 italic text-xl font-serif bg-gray-50 dark:bg-white/5',
                    },
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'shadow-none my-12 max-h-[700px] w-auto mx-auto object-cover border border-black dark:border-white',
                },
            }),
            Placeholder.configure({
                placeholder: 'BEGIN_RECORD...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-300 dark:before:text-gray-700 before:float-left before:pointer-events-none before:font-mono',
            }),
        ],
        content: initialData?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-neutral prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[600px] p-8 md:p-12 font-serif leading-relaxed text-black dark:text-white selection:bg-[#C5A059] selection:text-black',
            },
        },
    });

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
                setCoverImageId(response.$id);
                setCoverImageUrl(getImageUrl(response.$id));
            } catch (error) {
                console.error("Cover image upload failed", error);
                toast.error("Failed to upload cover image.");
            }
        }
    };

    const handleRemoveCoverImage = () => {
        setCoverImageId(null);
        setCoverImageUrl(null);
    };

    const handleSave = async (isDraft: boolean = false) => {
        if (!title || !editor || editor.isEmpty) {
            toast.error("A title and content are required.");
            return;
        }

        setIsSaving(true);
        try {
            if (initialData?.$id) {
                await databases.updateDocument(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    initialData.$id,
                    {
                        title,
                        content: editor.getHTML(),
                        status: isDraft ? 'draft' : 'published',
                        updatedAt: new Date().toISOString(),
                        category,
                        cover_image_id: coverImageId || '',
                        date_event: new Date(eventDate).toISOString(),
                    }
                );
                toast.success("Record updated.");
            } else {
                await databases.createDocument(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    ID.unique(),
                    {
                        title,
                        content: editor.getHTML(),
                        author_id: memberId || user?.$id || "admin",
                        status: isDraft ? 'draft' : 'published',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        likes: 0,
                        category,
                        cover_image_id: coverImageId || '',
                        date_event: new Date(eventDate).toISOString(),
                    }
                );
                toast.success(isDraft ? "Draft preserved." : "Legacy record preserved.");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                setTitle('');
                setCoverImageId(null);
                setCoverImageUrl(null);
                editor.commands.setContent('');
            }
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to preserve record.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="border border-black dark:border-white bg-white dark:bg-[#09090b]">
                {/* Editor Header / Inputs */}
                <div className="p-6 md:p-8 border-b border-black dark:border-white bg-white dark:bg-[#09090b] flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1 w-full space-y-2">
                            <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">TITLE_RECORD</label>
                            <input
                                type="text"
                                placeholder="ENTER TITLE..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-4xl md:text-5xl font-black text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-700 border-none focus:ring-0 focus:outline-none px-0 bg-transparent uppercase tracking-tighter"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSaving}
                                className="border border-black dark:border-white px-6 py-3 font-mono text-xs uppercase hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
                            >
                                SAVE_DRAFT
                            </button>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-mono text-xs uppercase hover:bg-[#C5A059] dark:hover:bg-[#C5A059] hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                {isSaving ? "PUBLISHING..." : "PUBLISH"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-black dark:border-white">
                        <div className="border-r border-black dark:border-white p-6 -ml-6 md:ml-0 md:-my-6 pt-6">
                            <label className="font-mono text-xs uppercase tracking-widest opacity-50 mb-4 block">VISUAL_ANCHOR</label>
                            {coverImageUrl ? (
                                <div className="relative aspect-video w-full overflow-hidden border border-black dark:border-white group">
                                    <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    <button
                                        onClick={handleRemoveCoverImage}
                                        className="absolute top-2 right-2 bg-black text-white p-2 hover:bg-red-600 transition-colors"
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video w-full border border-dashed border-gray-400 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer group">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />
                                    <Upload className="w-6 h-6 mb-2" />
                                    <span className="font-mono text-xs uppercase">UPLOAD_COVER</span>
                                </label>
                            )}
                        </div>

                        <div className="border-r border-black dark:border-white p-6">
                            <label className="font-mono text-xs uppercase tracking-widest opacity-50 mb-2 block">TEMPORAL_POINT</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-transparent border border-black dark:border-white rounded-none font-mono text-sm focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
                                />
                            </div>
                        </div>

                        <div className="p-6">
                            <label className="font-mono text-xs uppercase tracking-widest opacity-50 mb-2 block">CATEGORY_TAG</label>
                            <div className="relative group">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-transparent border border-black dark:border-white rounded-none font-mono text-sm focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="General" className="bg-white text-black">GENERAL</option>
                                    <option value="Academics" className="bg-white text-black">ACADEMICS</option>
                                    <option value="Social" className="bg-white text-black">SOCIAL</option>
                                    <option value="Milestone" className="bg-white text-black">MILESTONE</option>
                                    <option value="Travel" className="bg-white text-black">EXPEDITION</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                    <ChevronLeft className="w-3 h-3 rotate-[-90deg]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <MenuBar editor={editor} />

                <div className="bg-white dark:bg-[#09090b] cursor-text min-h-[500px]" onClick={() => editor?.chain().focus().run()}>
                    <EditorContent editor={editor} />
                </div>

                <div className="p-4 border-t border-black dark:border-white bg-gray-50 dark:bg-white/5 flex justify-between items-center font-mono text-[10px] uppercase text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>
                            {editor && editor.storage.characterCount ? `${editor.storage.characterCount.characters()} CHARS` : '0 CHARS'}
                        </span>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2", title ? "bg-green-500" : "bg-gray-300")} />
                            <span>{title ? "READY_TO_LOG" : "INCOMPLETE"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
