import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemDetails?: string;
    isLoading?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "CONFIRM DELETION",
    message = "THIS ACTION IS PERMANENT AND IRREVERSIBLE.",
    itemDetails,
    isLoading = false,
}: DeleteConfirmationModalProps) {

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-all duration-300"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed left-1/2 top-1/2 z-[110] w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform p-4"
                    >
                        <div className="relative bg-white dark:bg-[#09090b] border-2 border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">

                            {/* Header */}
                            <div className="bg-red-600 text-white p-3 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 fill-white text-red-600" />
                                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                                        SYSTEM_ALERT // {title}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:bg-black/20 p-1 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-red-600/10 flex items-center justify-center border-2 border-red-600 rounded-none relative group">
                                    <div className="absolute inset-0 border border-red-600 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500"></div>
                                    <Trash2 className="w-10 h-10 text-red-600" />
                                </div>

                                <div className="space-y-4 w-full">
                                    <p className="font-mono text-lg font-bold uppercase text-red-600 leading-tight">
                                        {message}
                                    </p>

                                    {itemDetails && (
                                        <div className="bg-gray-100 dark:bg-white/5 p-4 border border-black/10 dark:border-white/10 text-left">
                                            <p className="font-mono text-[10px] text-gray-500 uppercase mb-1">TARGET RECORD:</p>
                                            <p className="font-mono text-sm font-bold line-clamp-2">{itemDetails}</p>
                                        </div>
                                    )}

                                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                        PROCEEDING WILL ERASE DATA FROM ARCHIVE.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="py-4 border-2 border-black dark:border-white font-mono text-xs uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50"
                                    >
                                        ABORT_SEQUENCE
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className="py-4 bg-red-600 text-white font-mono text-xs uppercase font-bold hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>ERASING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                <span>CONFIRM_DELETE</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
