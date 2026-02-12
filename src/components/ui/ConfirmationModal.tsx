import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = 'danger'
}: ConfirmationModalProps) {

    const variantStyles = {
        danger: "bg-red-950/10 text-red-500 border-red-500/20",
        warning: "bg-amber-950/10 text-amber-500 border-amber-500/20",
        info: "bg-stone-950 text-stone-300 border-stone-800"
    };

    const buttonStyles = {
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/10",
        warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10",
        info: "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
    };

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
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-all duration-300"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 z-[110] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 transform p-6"
                    >
                        <div className="relative overflow-hidden rounded-[2rem] bg-background-light dark:bg-stone-950 shadow-2xl ring-1 ring-stone-200 dark:ring-stone-800 p-8">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border ${variantStyles[variant]}`}>
                                    <AlertTriangle className="w-8 h-8" />
                                </div>

                                {/* Header */}
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-serif italic text-stone-900 dark:text-white">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col w-full gap-3 pt-2">
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={`w-full py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${buttonStyles[variant]}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : confirmText}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="w-full py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                                    >
                                        {cancelText}
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
