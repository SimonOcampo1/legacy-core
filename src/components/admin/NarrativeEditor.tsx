import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../../lib/utils';
import { useState, useCallback } from 'react';
import {
    Bold, Italic, Heading1, Heading2, Quote, Image as ImageIcon,
    Undo, Redo, Calendar, Upload, X, Check, Loader2, ChevronLeft
} from 'lucide-react';
import { storage, databases, DATABASE_ID, NARRATIVES_COLLECTION_ID } from '../../lib/appwrite';
import { ID, ImageGravity } from 'appwrite';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const BUCKET_ID = "legacy_core_assets";

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

                    const url = storage.getFilePreview(
                        BUCKET_ID,
                        response.$id,
                        2000,
                        0,
                        ImageGravity.Center,
                        100
                    ).toString();

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
        <div className="flex flex-wrap items-center gap-1 p-3 border-b border-stone-100 dark:border-stone-800 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
            <div className="flex items-center gap-1 mr-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg p-1 border border-stone-100 dark:border-stone-800">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('heading', { level: 1 }) ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal dark:text-white font-bold' : ''
                    )}
                    title="Heading 1"
                    type="button"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('heading', { level: 2 }) ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal dark:text-white font-bold' : ''
                    )}
                    title="Heading 2"
                    type="button"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-1 mr-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg p-1 border border-stone-100 dark:border-stone-800">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('bold') ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal dark:text-white font-bold' : ''
                    )}
                    title="Bold"
                    type="button"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('italic') ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal dark:text-white' : ''
                    )}
                    title="Italic"
                    type="button"
                >
                    <Italic className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-800/50 rounded-lg p-1 border border-stone-100 dark:border-stone-800">
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('blockquote') ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal dark:text-white' : ''
                    )}
                    title="Quote"
                    type="button"
                >
                    <Quote className="w-4 h-4" />
                </button>
                <button onClick={addImage} className="p-2 rounded-md hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all text-stone-500 relative" title="Image" type="button">
                    <ImageIcon className="w-4 h-4" />
                    {isUploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-stone-950/80 rounded-md">
                            <Loader2 className="w-3 h-3 text-charcoal dark:text-white animate-spin" />
                        </span>
                    )}
                </button>
            </div>

            <div className="ml-auto flex items-center gap-1 text-stone-400">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="p-2 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-30"
                    title="Undo"
                    type="button"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="p-2 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-30"
                    title="Redo"
                    type="button"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const NarrativeEditor = () => {
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [coverImageId, setCoverImageId] = useState<string | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [category, setCategory] = useState('General');
    const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const { user } = useAuth();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-2 border-[#C5A059] pl-6 py-2 my-8 italic text-2xl font-serif text-charcoal dark:text-stone-300 bg-stone-50/50 dark:bg-stone-950/50 rounded-r-2xl',
                    },
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl shadow-xl my-12 max-h-[700px] w-auto mx-auto object-cover border border-stone-100 dark:border-stone-800',
                },
            }),
            Placeholder.configure({
                placeholder: 'Begin the record...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-stone-300 dark:before:text-stone-700 before:float-left before:pointer-events-none before:font-serif before:italic',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-stone prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[600px] p-8 md:p-16 font-serif leading-relaxed text-charcoal dark:text-stone-300 selection:bg-[#C5A059]/20',
            },
        },
    });

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
                setCoverImageId(response.$id);
                const url = storage.getFilePreview(BUCKET_ID, response.$id, 1600, 800, ImageGravity.Center, 90).toString();
                setCoverImageUrl(url);
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
            await databases.createDocument(
                DATABASE_ID,
                NARRATIVES_COLLECTION_ID,
                ID.unique(),
                {
                    title,
                    content: editor.getHTML(),
                    author_id: user?.$id || "admin",
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
            setTitle('');
            setCoverImageId(null);
            setCoverImageUrl(null);
            editor.commands.setContent('');
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to preserve record.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 my-12 px-6">
            <div className="bg-white dark:bg-stone-950 shadow-2xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 rounded-[2.5rem] overflow-hidden flex flex-col">
                <div className="px-8 md:px-16 pt-16 pb-8 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <input
                            type="text"
                            placeholder="Title of the Record"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex-1 w-full text-5xl md:text-6xl font-serif text-charcoal dark:text-white placeholder-stone-200 dark:placeholder-stone-800 border-none focus:ring-0 focus:outline-none px-0 bg-transparent italic tracking-tight"
                        />
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSaving}
                                className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-6 py-3 rounded-xl font-bold transition-all hover:bg-stone-200 dark:hover:bg-stone-700 text-[10px] uppercase tracking-widest disabled:opacity-30 flex items-center gap-2 active:scale-95"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                                className="bg-charcoal dark:bg-white text-white dark:text-charcoal px-8 py-3 rounded-xl font-bold transition-all hover:bg-charcoal/90 dark:hover:bg-stone-100 text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 group active:scale-95 disabled:opacity-30"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {isSaving ? "Preserving..." : "Publish Record"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end border-t border-stone-50 dark:border-stone-800/50 pt-8">
                        <div>
                            <label className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Perspective</label>
                            {coverImageUrl ? (
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm group">
                                    <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <button
                                        onClick={handleRemoveCoverImage}
                                        className="absolute top-3 right-3 bg-white/90 dark:bg-stone-950/90 p-2 rounded-full text-stone-500 hover:text-red-500 shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        type="button"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl border-2 border-dashed border-stone-100 dark:border-stone-800 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/5 transition-all cursor-pointer text-stone-400 group">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />
                                    <div className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center mb-2 group-hover:bg-[#C5A059]/10 group-hover:text-[#C5A059] transition-colors">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Cover</span>
                                </label>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold block">Temporal Anchor</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-[#C5A059] transition-colors" />
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl text-charcoal dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all font-sans"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold block">classification</label>
                            <div className="relative group">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-5 py-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 rounded-2xl text-charcoal dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/10 focus:border-[#C5A059] transition-all font-sans appearance-none cursor-pointer"
                                >
                                    <option value="General" className="bg-white dark:bg-stone-950">General Archive</option>
                                    <option value="Academics" className="bg-white dark:bg-stone-950">Academic Pursuit</option>
                                    <option value="Social" className="bg-white dark:bg-stone-950">Social Connection</option>
                                    <option value="Milestone" className="bg-white dark:bg-stone-950">Life Milestone</option>
                                    <option value="Travel" className="bg-white dark:bg-stone-950">Expedition</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-hover:text-[#C5A059] transition-colors">
                                    <ChevronLeft className="w-4 h-4 rotate-[-90deg]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <MenuBar editor={editor} />

                <div className="flex-1 bg-white dark:bg-stone-950 cursor-text min-h-[600px]" onClick={() => editor?.chain().focus().run()}>
                    <EditorContent editor={editor} />
                </div>

                <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-950/30 flex justify-between items-center text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                    <div className="flex items-center gap-4">
                        <span>
                            {editor && editor.storage.characterCount ? `${editor.storage.characterCount.characters()} symbols` : ''}
                        </span>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", title ? "bg-emerald-500 animate-pulse" : "bg-stone-300")} />
                            <span className={title ? "text-emerald-600 dark:text-emerald-400" : ""}>{title ? "Preservation Ready" : "Draft state"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
