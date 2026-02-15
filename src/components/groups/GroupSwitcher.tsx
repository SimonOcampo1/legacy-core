import { useState } from 'react';
import { useGroup } from '../../context/GroupContext';
import { ChevronDown, Plus, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupManager } from './GroupManager';
import { toast } from 'sonner';

export function GroupSwitcher() {
    const { currentGroup, allGroups, switchGroup } = useGroup();
    const [isOpen, setIsOpen] = useState(false);
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Join code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 border border-black/10 dark:border-white/10 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
            >
                <div className="w-2 h-2 bg-gold animate-pulse" />
                <span className="font-mono text-xs uppercase font-bold max-w-[120px] truncate">
                    {currentGroup?.name || "SELECT_NETWORK"}
                </span>
                <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full text-left right-0 w-64 mt-2 bg-white dark:bg-[#09090b] border border-black dark:border-white shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                <p className="font-mono text-[10px] text-gray-500 uppercase mb-1">Current Network</p>
                                <h3 className="font-bold uppercase truncate">{currentGroup?.name}</h3>
                                {currentGroup && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="bg-black/5 dark:bg-white/5 px-2 py-1 flex items-center gap-2 rounded border border-black/10 dark:border-white/10">
                                            <span className="font-mono text-[10px] tracking-widest">{currentGroup.join_code}</span>
                                            <button onClick={() => copyCode(currentGroup.join_code)} className="hover:text-gold">
                                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="max-h-48 overflow-y-auto">
                                {allGroups.map(group => (
                                    <button
                                        key={group.$id}
                                        onClick={() => {
                                            switchGroup(group.$id);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 border-b border-black/5 dark:border-white/5 last:border-0"
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.accent_color || '#C5A059' }} />
                                        <span className={cn(
                                            "font-mono text-xs uppercase truncate flex-1",
                                            currentGroup?.$id === group.$id && "font-bold text-gold"
                                        )}>
                                            {group.name}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsManagerOpen(true);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-2 border-t border-black/10 dark:border-white/10 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                <span className="font-mono text-[10px] uppercase font-bold">Manage Networks</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <GroupManager isOpen={isManagerOpen} onClose={() => setIsManagerOpen(false)} />
        </div>
    );
}

// Helper utility (need to import cn from utils)
import { cn } from '../../lib/utils';
