import { useState } from 'react';
import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface GroupManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GroupManager({ isOpen, onClose }: GroupManagerProps) {
    const { createGroup, requestGroup, joinGroup } = useGroup();
    const { isSuperAdmin } = useAuth();
    const [mode, setMode] = useState<'create' | 'join'>('join');
    const [isLoading, setIsLoading] = useState(false);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target?.result as string;
                    setLogoSvg(text);
                    setLogoFile(null);
                    const blob = new Blob([text], { type: 'image/svg+xml' });
                    setLogoPreview(URL.createObjectURL(blob));
                    toast.success("SVG Logo loaded!");
                };
                reader.readAsText(file);
            } else {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
                setLogoSvg('');
                toast.success("Logo file selected!");
            }
        }
    };

    // Create Form
    const [groupName, setGroupName] = useState('');
    const [accentColor, setAccentColor] = useState('#C5A059');
    const [logoSvg, setLogoSvg] = useState('');

    // Join Form
    const [joinCode, setJoinCode] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSuperAdmin) {
                await createGroup(groupName, accentColor, logoSvg, logoFile || undefined);
                toast.success("Group created successfully!");
            } else {
                await requestGroup(groupName, accentColor, logoSvg, logoFile || undefined);
                toast.success("Group request submitted for approval!");
            }
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to process group: ${error.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await joinGroup(joinCode.toUpperCase());
            toast.success("Joined group successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to join group. Check code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#09090b] border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 hover:text-gold transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">
                                <span className="text-gold">ACCESS</span>_PORTAL
                            </h2>
                            <p className="font-mono text-xs opacity-60">Connect to a secure network.</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-black/20 dark:border-white/20 mb-6">
                            <button
                                onClick={() => setMode('join')}
                                className={cn(
                                    "flex-1 py-2 font-mono text-xs uppercase hover:bg-gray-100 dark:hover:bg-white/5 transition-colors",
                                    mode === 'join' ? "border-b-2 border-gold font-bold text-gold" : "opacity-60"
                                )}
                            >
                                [ ENTER_CODE ]
                            </button>
                            <button
                                onClick={() => setMode('create')}
                                className={cn(
                                    "flex-1 py-2 font-mono text-xs uppercase hover:bg-gray-100 dark:hover:bg-white/5 transition-colors",
                                    mode === 'create' ? "border-b-2 border-gold font-bold text-gold" : "opacity-60"
                                )}
                            >
                                [ CREATE_NEW ]
                            </button>
                        </div>

                        {mode === 'join' ? (
                            <form onSubmit={handleJoin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="font-mono text-[10px] uppercase opacity-70">Security Code</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                            placeholder="XXXXXX"
                                            className="w-full bg-transparent border border-black/20 dark:border-white/20 p-2 pl-9 font-mono uppercase focus:border-gold focus:outline-none"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || joinCode.length < 6}
                                    className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 uppercase tracking-wider hover:bg-gold hover:text-black dark:hover:bg-gold dark:hover:text-black transition-colors disabled:opacity-50 border border-transparent"
                                >
                                    {isLoading ? 'VERIFYING...' : 'ESTABLISH_CONNECTION'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="font-mono text-[10px] uppercase opacity-70">Network Name</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="MY_FRIEND_GROUP"
                                        className="w-full bg-transparent border border-black/20 dark:border-white/20 p-2 font-mono focus:border-gold focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-mono text-[10px] uppercase opacity-70">Signal Color (Hex)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-10 h-10 border border-black/20 dark:border-white/20 bg-transparent cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="flex-1 bg-transparent border border-black/20 dark:border-white/20 p-2 font-mono uppercase focus:border-gold focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-mono text-[10px] uppercase opacity-70 flex justify-between items-end">
                                        <span>Group Logo (SVG)</span>
                                        <span className="text-[8px] text-gold">Rec: 512x512px | SVG for colors</span>
                                    </label>
                                    <div className="border border-black/20 dark:border-white/20 p-2 flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept=".svg"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="cursor-pointer bg-black text-white dark:bg-white dark:text-black px-3 py-1 font-mono text-[10px] uppercase hover:opacity-80 transition-opacity"
                                        >
                                            UPLOAD_SVG
                                        </label>
                                        <span className="font-mono text-[10px] opacity-50 truncate flex-1">
                                            {logoSvg ? "SVG_LOADED" : "NO_FILE_CHOSEN"}
                                        </span>
                                    </div>
                                    {(logoPreview || logoSvg) && (
                                        <div className="mt-2 text-[10px] text-green-600 font-mono">
                                            Preview:
                                            <div className="w-12 h-12 mt-1 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden p-1">
                                                {logoSvg ? (
                                                    <div
                                                        className="w-full h-full text-black dark:text-white"
                                                        dangerouslySetInnerHTML={{ __html: logoSvg }}
                                                    />
                                                ) : (
                                                    <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || !groupName.trim()}
                                    className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 uppercase tracking-wider hover:bg-gold hover:text-black dark:hover:bg-gold dark:hover:text-black transition-colors disabled:opacity-50 border border-transparent"
                                >
                                    {isLoading ? 'PROCESSING...' : (isSuperAdmin ? 'LAUNCH_NETWORK' : 'SUBMIT_REQUEST')}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
