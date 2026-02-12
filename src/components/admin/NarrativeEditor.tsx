import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../../lib/utils';
import { useState, useCallback } from 'react';
import {
    Bold, Italic, Heading1, Heading2, Quote, Image as ImageIcon,
    Undo, Redo, Calendar, Upload, X
} from 'lucide-react';
import { storage, databases, DATABASE_ID, NARRATIVES_COLLECTION_ID } from '../../lib/appwrite';
import { ID, ImageGravity } from 'appwrite';
import { useAuth } from '../../context/AuthContext';

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
                    // Upload to Appwrite
                    const response = await storage.createFile(
                        BUCKET_ID,
                        ID.unique(),
                        file
                    );

                    // Get the file preview URL
                    const url = storage.getFilePreview(
                        BUCKET_ID,
                        response.$id,
                        2000, // width
                        0, // height (keep aspect ratio)
                        ImageGravity.Center, // gravity
                        100 // quality
                    ).toString();

                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    alert("Failed to upload image. Please try again.");
                } finally {
                    setIsUploading(false);
                }
            }
        };

        input.click();
    }, [editor]);

    return (
        <div className="flex flex-wrap items-center gap-1 p-3 border-b border-stone-100/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-1 mr-4 bg-stone-50 rounded-lg p-1 border border-stone-100">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('heading', { level: 1 }) ? 'bg-white shadow-sm text-stone-900 font-bold' : ''
                    )}
                    title="Heading 1"
                    type="button"
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('heading', { level: 2 }) ? 'bg-white shadow-sm text-stone-900 font-bold' : ''
                    )}
                    title="Heading 2"
                    type="button"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-1 mr-4 bg-stone-50 rounded-lg p-1 border border-stone-100">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('bold') ? 'bg-white shadow-sm text-stone-900 font-bold' : ''
                    )}
                    title="Bold"
                    type="button"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('italic') ? 'bg-white shadow-sm text-stone-900' : ''
                    )}
                    title="Italic"
                    type="button"
                >
                    <Italic className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-1 border border-stone-100">
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        "p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-500",
                        editor.isActive('blockquote') ? 'bg-white shadow-sm text-stone-900' : ''
                    )}
                    title="Quote / Highlight"
                    type="button"
                >
                    <Quote className="w-4 h-4" />
                </button>
                <button onClick={addImage} className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-stone-500 relative" title="Image" type="button">
                    <ImageIcon className="w-4 h-4" />
                    {isUploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                            <span className="w-2 h-2 bg-stone-900 rounded-full animate-ping"></span>
                        </span>
                    )}
                </button>
            </div>

            <div className="ml-auto flex items-center gap-1 text-stone-400">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="p-2 rounded hover:bg-stone-50 transition-colors disabled:opacity-30"
                    title="Undo"
                    type="button"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="p-2 rounded hover:bg-stone-50 transition-colors disabled:opacity-30"
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
                heading: {
                    levels: [1, 2],
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-stone-900 pl-4 py-2 my-6 italic text-xl font-serif text-stone-800 bg-stone-50 rounded-r-lg',
                    },
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg shadow-md my-8 max-h-[600px] w-auto mx-auto object-cover',
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your legacy...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-stone-300 before:float-left before:pointer-events-none',
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-stone prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8 md:p-12 font-serif leading-relaxed text-stone-700',
            },
        },
    });

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
                setCoverImageId(response.$id);
                const url = storage.getFilePreview(BUCKET_ID, response.$id, 1200, 600, ImageGravity.Center, 90).toString();
                setCoverImageUrl(url);
            } catch (error) {
                console.error("Cover image upload failed", error);
                alert("Failed to upload cover image");
            }
        }
    };

    const handleRemoveCoverImage = () => {
        setCoverImageId(null);
        setCoverImageUrl(null);
    };

    const handleSave = async () => {
        if (!title || !editor || editor.isEmpty) {
            alert("Please provide a title and content.");
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
                    status: 'published',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    likes: 0,
                    category,
                    cover_image_id: coverImageId || '',
                    date_event: new Date(eventDate).toISOString(),
                }
            );
            alert("Narrative saved successfully!");
            // Reset form
            setTitle('');
            setCoverImageId(null);
            setCoverImageUrl(null);
            editor.commands.clearContent();
        } catch (error) {
            console.error("Error saving narrative:", error);
            alert("Failed to save narrative. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 my-8">
            <div className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-stone-100 rounded-xl overflow-hidden flex flex-col">
                <div className="px-8 md:px-12 pt-12 pb-6 border-b border-stone-100/50 bg-white flex flex-col gap-6">
                    <div className="flex justify-between items-start gap-4">
                        <input
                            type="text"
                            placeholder="Narrative Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="flex-1 text-4xl md:text-5xl font-serif text-slate-800 placeholder-stone-200 border-none focus:ring-0 px-0 bg-transparent font-medium tracking-tight"
                        />
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !title}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider shadow-sm hover:shadow flex items-center gap-2"
                            type="button"
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Saving...
                                </>
                            ) : (
                                "Publish"
                            )}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-end gap-6 text-sm">
                        <div className="relative group">
                            {coverImageUrl ? (
                                <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                                    <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                                    <button
                                        onClick={handleRemoveCoverImage}
                                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-stone-500 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-24 w-40 rounded-lg border-2 border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer text-stone-400 hover:text-stone-600">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageUpload} />
                                    <Upload className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Add Cover</span>
                                </label>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Event Date</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Calendar className="w-4 h-4" />
                                </span>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-stone-400 focus:ring-0 w-40 font-sans"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Category</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="pl-4 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-stone-400 focus:ring-0 w-40 font-sans appearance-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Academics">Academics</option>
                                    <option value="Social">Social</option>
                                    <option value="Milestone">Milestone</option>
                                    <option value="Travel">Travel</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <MenuBar editor={editor} />

                <div className="flex-1 bg-white cursor-text min-h-[500px]" onClick={() => editor?.chain().focus().run()}>
                    <EditorContent editor={editor} />
                </div>

                <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-between items-center text-xs text-stone-400 font-light">
                    <span>
                        {editor && editor.storage.characterCount ? `${editor.storage.characterCount.characters()} characters` : ''}
                    </span>
                    <div className="flex gap-4">
                        <span className={title ? "text-emerald-600 flex items-center gap-1" : "text-stone-300 flex items-center gap-1"}>
                            <span className={`w-1.5 h-1.5 rounded-full ${title ? "bg-emerald-500" : "bg-stone-300"}`}></span>
                            {title ? "Ready to Save" : "Draft"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
