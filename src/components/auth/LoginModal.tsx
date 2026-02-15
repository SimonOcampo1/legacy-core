import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useScrollLock } from "../../hooks/useScrollLock";
import { PPGLogo } from "../ui/PPGLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const navigate = useNavigate();
    const { login, register, loginWithGoogle, checkUserStatus, verifying } = useAuth();
    useScrollLock(isOpen);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    // Reset state when modal opens or tab changes
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setEmail("");
            setPassword("");
            setName("");
        }
    }, [isOpen, activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (activeTab === 'login') {
                await login(email, password);
                onClose();
                navigate("/admin");
            } else {
                await register(name, email, password);
                onClose();
                toast.success("Identity established. Awaiting clearance.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Authentication failed.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            onClose();
        } catch (err: any) {
            setError(err.message || "Google handshake failed.");
        }
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
                        className="fixed inset-0 z-[60] bg-white/80 dark:bg-black/80 backdrop-blur-sm transition-all duration-300"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform p-4"
                    >
                        <div data-lenis-prevent className="relative overflow-y-auto max-h-[90vh] bg-white dark:bg-black border-2 border-black dark:border-stone-800 p-8 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-1 text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors rounded-none border border-transparent hover:border-black dark:hover:border-stone-700"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col space-y-8">
                                {/* Header */}
                                <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                    <div className="mb-2">
                                        <PPGLogo className="h-12 w-auto text-gold" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-mono uppercase tracking-tighter text-black dark:text-white">
                                            {activeTab === 'login' ? "System Access" : "Initiate Protocol"}
                                        </h2>
                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--accent-color)]/50 to-transparent" />
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 pt-1">
                                            {activeTab === 'login'
                                                ? "Enter Credentials"
                                                : "Establish New Identity"}
                                        </p>
                                    </div>
                                </div>

                                {/* Tab Toggle */}
                                <div className="flex border-b border-stone-200 dark:border-stone-800">
                                    <button
                                        onClick={() => setActiveTab('login')}
                                        className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest transition-all relative ${activeTab === 'login'
                                            ? "text-gold"
                                            : "text-stone-400 hover:text-black dark:hover:text-stone-200"
                                            }`}
                                    >
                                        Log In
                                        {activeTab === 'login' && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gold"
                                            />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('register')}
                                        className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest transition-all relative ${activeTab === 'register'
                                            ? "text-gold"
                                            : "text-stone-400 hover:text-black dark:hover:text-stone-200"
                                            }`}
                                    >
                                        Join
                                        {activeTab === 'register' && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gold"
                                            />
                                        )}
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="w-full space-y-6">
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-500 dark:border-red-900 text-red-600 dark:text-red-500 font-mono text-[10px] uppercase tracking-wide">
                                            Error: {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {activeTab === 'register' && (
                                            <div className="group relative">
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="FULL_NAME"
                                                    required
                                                    className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 px-0 py-3 text-sm font-mono text-black dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-700 focus:border-gold focus:ring-0 outline-none transition-all rounded-none"
                                                />
                                            </div>
                                        )}
                                        <div className="group relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="EMAIL_ADDRESS"
                                                required
                                                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 px-0 py-3 text-sm font-mono text-black dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-700 focus:border-gold focus:ring-0 outline-none transition-all rounded-none"
                                            />
                                        </div>
                                        <div className="group relative">
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="PASSWORD"
                                                required
                                                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 px-0 py-3 text-sm font-mono text-black dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-700 focus:border-gold focus:ring-0 outline-none transition-all rounded-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={verifying}
                                        className="w-full bg-gold text-white dark:text-black py-4 text-xs font-mono font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
                                    >
                                        {verifying ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                PROCESSING...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-3 w-3 fill-current" />
                                                {activeTab === 'login' ? "AUTHENTICATE" : "INITIATE"}
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                                        <span className="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-600">
                                            Alternative Access
                                        </span>
                                        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                                    </div>

                                    <button
                                        onClick={handleGoogleLogin}
                                        className="w-full border border-stone-200 dark:border-stone-800 bg-transparent py-4 text-xs font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:border-gold hover:text-gold transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.48 10.92v3.28h7.88c-.3 1.66-1.17 3.08-2.43 4.14-1.28 1.09-3.04 1.73-5.44 1.73-4.34 0-7.85-3.51-7.85-7.85 0-4.34 3.51-7.85 7.85-7.85 2.14 0 4.02.77 5.51 2.18l2.63-2.63C18.17 1.57 15.35.53 12.48.53 6.01.53.77 5.77.77 12.24s5.24 11.71 11.71 11.71c3.55 0 6.64-1.32 8.94-3.69 2.56-2.63 2.56-6.83 2.06-8.34h-10.8z" />
                                        </svg>
                                        CONTINUE WITH GOOGLE
                                    </button>
                                </div>

                                <div className="pt-2 w-full text-center">
                                    <button
                                        onClick={async () => {
                                            await checkUserStatus();
                                        }}
                                        className="text-[9px] font-mono text-stone-400 dark:text-stone-700 hover:text-gold uppercase tracking-[0.2em] transition-colors"
                                    >
                                        [ SYNC_SESSION_DIAGNOSTIC ]
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
