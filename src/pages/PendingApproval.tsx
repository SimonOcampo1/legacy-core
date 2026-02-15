import { useAuth } from "../context/AuthContext";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export const PendingApproval = () => {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-6 font-mono">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full border border-black dark:border-white p-8 bg-gray-50 dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
                <div className="flex flex-col items-center text-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gold blur-lg opacity-20 animate-pulse" />
                        <Lock className="w-16 h-16 text-black dark:text-white relative z-10" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black uppercase tracking-tighter">
                            ACCESS_PENDING
                        </h1>
                        <div className="w-full h-px bg-black/10 dark:bg-white/10" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-relaxed">
                            IDENTITY VERIFICATION REQUIRED
                        </p>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 p-4 w-full text-xs text-left font-mono space-y-2 border border-black/10 dark:border-white/10">
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                            <span className="opacity-50">USER:</span>
                            <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                            <span className="opacity-50">STATUS:</span>
                            <span className="text-gold blink">AWAITING_APPROVAL</span>
                        </div>
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                            <span className="opacity-50">UID:</span>
                            <span className="truncate">{user?.$id}</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 max-w-xs">
                        YOUR PROFILE HAS BEEN CREATED BUT REQUIRES ADMINISTRATOR AUTHORIZATION TO ACCESS THE CORE SYSTEMS.
                    </p>

                    <button
                        onClick={logout}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-gold hover:text-black dark:hover:bg-gold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                        TERMINATE_SESSION
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
