import { useState } from 'react';
import { databases, storage, DATABASE_ID, PROFILES_COLLECTION_ID } from '../../lib/appwrite';
import { useScrollLock } from '../../hooks/useScrollLock';
import { ID } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Member } from '../../types';

const BUCKET_ID = "legacy_core_assets";

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: Member;
    onSuccess: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose, member, onSuccess }: ProfileEditModalProps) => {
    useScrollLock(isOpen);
    const [name, setName] = useState(member.name);
    const [role, setRole] = useState(member.role);
    const [bio, setBio] = useState(member.bio || "");
    const [bioIntro, setBioIntro] = useState(member.bioIntro || "");
    const [quote, setQuote] = useState(member.quote || "");
    // Honors are comma-separated string for editing simplicity or array management
    const [honors, setHonors] = useState((member.honors || []).join(", "));

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(member.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let avatarId = null;

            // If a new file is selected, upload it
            if (avatarFile) {
                const response = await storage.createFile(BUCKET_ID, ID.unique(), avatarFile);
                avatarId = response.$id;
            }

            // Prepare honors array
            const honorsArray = honors.split(",").map(h => h.trim()).filter(h => h.length > 0);

            const updateData: any = {
                name,
                role,
                bio,
                bioIntro,
                quote,
                honors: honorsArray,
            };

            if (avatarId) {
                updateData.avatar_id = avatarId;
            }

            await databases.updateDocument(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                member.id,
                updateData
            );

            toast.success("Profile identity updated.");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Profile update failed", error);
            toast.error("Failed to update profile identity.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        data-lenis-prevent
                        className="fixed top-0 right-0 z-[110] h-full w-full max-w-2xl bg-white dark:bg-[#09090b] border-l-2 border-black dark:border-white shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-black dark:border-white flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <div>
                                <h2 className="font-black text-2xl uppercase tracking-tighter">EDIT IDENTITY</h2>
                                <p className="font-mono text-xs text-gray-500 uppercase">// ID: {member.id.substring(0, 8)}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                            <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">

                                {/* Avatar Section */}
                                <div className="space-y-4">
                                    <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">BIOMETRIC_IMAGE</label>
                                    <div className="flex items-start gap-6">
                                        <div className="relative w-32 h-32 border-2 border-black dark:border-white bg-gray-100 dark:bg-black overflow-hidden flex-shrink-0">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all cursor-pointer group">
                                                <input type="file" onChange={handleFileSelect} accept="image/*" className="hidden" />
                                                <Upload className="w-6 h-6 mb-2 text-gray-400 group-hover:text-[#C5A059]" />
                                                <span className="font-mono text-[10px] uppercase text-gray-500 group-hover:text-[#C5A059]">UPLOAD_NEW_SOURCE</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">FULL_NAME</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-4 bg-transparent border border-black dark:border-white font-bold uppercase focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">ROLE_DESIGNATION</label>
                                        <input
                                            type="text"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">BIO_INTRO_TAGLINE</label>
                                    <input
                                        type="text"
                                        value={bioIntro}
                                        onChange={(e) => setBioIntro(e.target.value)}
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-bold uppercase focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">FULL_BIOGRAPHY</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={6}
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm leading-relaxed focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">PERSONAL_QUOTE</label>
                                    <textarea
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        rows={3}
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-serif italic text-lg opacity-80 focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:opacity-100 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-mono text-xs uppercase tracking-widest opacity-50 block">HONORS_LIST (COMMA_SEPARATED)</label>
                                    <input
                                        type="text"
                                        value={honors}
                                        onChange={(e) => setHonors(e.target.value)}
                                        placeholder="CLASS OF 2014, VALEDICTORIAN..."
                                        className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-sm uppercase focus:outline-none focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black transition-colors"
                                    />
                                </div>

                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-black dark:border-white flex justify-end gap-4 bg-white dark:bg-[#09090b]">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-8 py-4 bg-transparent border border-transparent font-mono text-xs uppercase hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                form="profile-form"
                                disabled={isSubmitting}
                                className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-[#C5A059] hover:text-black dark:hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {isSubmitting ? "UPDATING..." : "COMMIT_CHANGES"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
