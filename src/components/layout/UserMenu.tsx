import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface UserMenuProps {
    isHome?: boolean;
    isScrolled?: boolean;
    className?: string;
}

export function UserMenu({ isHome, isScrolled, className }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAuthorized } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        navigate("/");
    };

    if (!user) return null;

    const textColorClass = isHome && !isScrolled
        ? "text-charcoal dark:text-white"
        : "text-slate-900 dark:text-white";

    return (
        <div className={cn("relative", className)} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 font-serif text-lg italic leading-none transition-all duration-300 hover:text-[#C5A059] group",
                    textColorClass
                )}
            >
                <span>{user.name?.split(' ')[0] || 'User'}</span>
                <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isOpen ? "rotate-180" : "rotate-0"
                )} strokeWidth={1.5} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-4 w-64 origin-top-right overflow-hidden rounded-[1.5rem] bg-white dark:bg-stone-950 shadow-2xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 backdrop-blur-xl z-[100]"
                    >
                        <div className="p-3 space-y-1">
                            <div className="px-4 py-3 border-b border-stone-50 dark:border-stone-800/50 mb-2">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1">Authenticated as</p>
                                <p className="text-sm font-serif italic truncate text-charcoal dark:text-stone-200">{user.email}</p>
                            </div>

                            {isAuthorized && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-charcoal dark:hover:text-white rounded-xl transition-all group"
                                >
                                    <LayoutDashboard className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    <span>Admin Console</span>
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all group"
                            >
                                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
