import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { PpgLogo } from "../ui/PpgLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const navigate = useNavigate();
    const { login, register, loginWithGoogle, checkUserStatus, verifying } = useAuth();
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
                toast.success("Account created! Waiting for admin approval.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Action failed. Please check your credentials.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // Redirect is handled by Appwrite/AuthContext, but we can close modal
            onClose();
        } catch (err: any) {
            setError(err.message || "Google login failed.");
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
                        className="fixed inset-0 z-[60] bg-black/60 transition-all duration-300"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform p-6"
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-dark shadow-2xl ring-1 ring-stone-200 dark:ring-stone-800 p-8">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col items-center space-y-6">
                                {/* Header */}
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="mb-2">
                                        <PpgLogo className="h-16 w-auto text-[#C5A059]" />
                                    </div>
                                    <h2 className="text-3xl font-serif font-medium text-stone-900 dark:text-white">
                                        {activeTab === 'login' ? "Welcome Back" : "Join the Legacy"}
                                    </h2>
                                    <p className="text-sm text-stone-500 dark:text-stone-400">
                                        {activeTab === 'login'
                                            ? "Enter your credentials to access the archives"
                                            : "Create your account to become part of the digital community"}
                                    </p>
                                </div>

                                {/* Tab Toggle */}
                                <div className="flex p-1 bg-stone-100 dark:bg-stone-900 rounded-xl w-full">
                                    <button
                                        onClick={() => setActiveTab('login')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'login'
                                            ? "bg-white dark:bg-stone-800 text-[#C5A059] shadow-sm"
                                            : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                            }`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('register')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'register'
                                            ? "bg-white dark:bg-stone-800 text-[#C5A059] shadow-sm"
                                            : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                            }`}
                                    >
                                        Join
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="w-full space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 text-red-600 dark:text-red-400 text-xs rounded-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {activeTab === 'register' && (
                                            <div className="group relative">
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Full Name"
                                                    required
                                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent px-4 py-3 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                                                />
                                            </div>
                                        )}
                                        <div className="group relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email Address"
                                                required
                                                className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent px-4 py-3 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="group relative">
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password"
                                                required
                                                className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent px-4 py-3 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={verifying}
                                        className="w-full rounded-lg bg-stone-900 dark:bg-white py-3 text-sm font-medium text-white dark:text-stone-900 shadow-lg shadow-stone-900/10 hover:bg-black dark:hover:bg-stone-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {verifying ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            activeTab === 'login' ? "Sign In" : "Create Account"
                                        )}
                                    </button>
                                </form>

                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-stone-200 dark:border-stone-800" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white dark:bg-stone-900 px-3 text-xs text-stone-400 uppercase tracking-wider">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full rounded-lg border border-[#C5A059] bg-[#C5A059]/10 py-3 text-sm font-medium text-[#C5A059] hover:bg-[#C5A059] hover:text-white transition-all flex items-center justify-center gap-2 group"
                                >
                                    <svg className="w-4 h-4 transition-colors group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.48 10.92v3.28h7.88c-.3 1.66-1.17 3.08-2.43 4.14-1.28 1.09-3.04 1.73-5.44 1.73-4.34 0-7.85-3.51-7.85-7.85 0-4.34 3.51-7.85 7.85-7.85 2.14 0 4.02.77 5.51 2.18l2.63-2.63C18.17 1.57 15.35.53 12.48.53 6.01.53.77 5.77.77 12.24s5.24 11.71 11.71 11.71c3.55 0 6.64-1.32 8.94-3.69 2.56-2.63 2.56-6.83 2.06-8.34h-10.8z" />
                                    </svg>
                                    Google
                                </button>

                                <div className="pt-2 w-full">
                                    <button
                                        onClick={async () => {
                                            await checkUserStatus();
                                        }}
                                        className="w-full text-[10px] text-stone-400 hover:text-[#C5A059] uppercase tracking-[0.2em] transition-colors"
                                    >
                                        Sync Session (Diagnostic)
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
