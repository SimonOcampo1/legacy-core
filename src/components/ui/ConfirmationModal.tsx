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
        danger: {
            header: "bg-red-600 text-white",
            border: "border-red-600",
            shadow: "shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]",
            icon: "bg-red-600/10 text-red-600 border-red-600"
        },
        warning: {
            header: "bg-gold text-black",
            border: "border-gold",
            shadow: "shadow-[8px_8px_0px_0px_rgba(197,160,89,1)]",
            icon: "bg-[var(--accent-color)]/10 text-gold border-gold"
        },
        info: {
            header: "bg-black dark:bg-white text-white dark:text-black",
            border: "border-black dark:border-white",
            shadow: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
            icon: "bg-black/5 dark:bg-white/5 text-black dark:text-white border-black dark:border-white"
        }
    };

    const buttonStyles = {
        danger: "bg-red-600 text-white hover:bg-red-700",
        warning: "bg-gold text-black hover:bg-gold/90",
        info: "bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200"
    };

    const currentVariant = variantStyles[variant];

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
                        <div className={`relative bg-white dark:bg-[#09090b] border-2 ${currentVariant.border} ${currentVariant.shadow}`}>

                            {/* Header */}
                            <div className={`${currentVariant.header} p-3 flex justify-between items-center`}>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                                        SYSTEM MESSAGE // {title}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="hover:bg-black/10 dark:hover:bg-white/10 p-1 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 flex flex-col items-center text-center space-y-6">
                                {/* Icon */}
                                <div className={`w-20 h-20 flex items-center justify-center border-2 ${currentVariant.icon}`}>
                                    <AlertTriangle className="w-10 h-10" />
                                </div>

                                {/* Body */}
                                <div className="space-y-4 w-full">
                                    <p className={`font-mono text-lg font-bold uppercase leading-tight ${variant === 'danger' ? 'text-red-600' : 'text-black dark:text-white'}`}>
                                        {message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="py-4 border-2 border-black dark:border-white font-mono text-xs uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50"
                                    >
                                        {cancelText.toUpperCase().replace(' ', '_')}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={`py-4 font-mono text-xs uppercase font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 ${buttonStyles[variant]}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            confirmText.toUpperCase().replace(' ', '_')
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
