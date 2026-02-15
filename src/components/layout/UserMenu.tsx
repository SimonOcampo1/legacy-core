import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, LayoutDashboard, ChevronDown, User, TerminalSquare } from "lucide-react";
import { cn } from "../../lib/utils";

interface UserMenuProps {
    isHome?: boolean;
    isScrolled?: boolean;
    className?: string;
}

export function UserMenu({ isHome, isScrolled, className }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAuthorized, isSuperAdmin } = useAuth();
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
        ? "text-black dark:text-white"
        : "text-black dark:text-white";

    return (
        <div className={cn("relative font-mono text-xs uppercase", className)} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1 border border-transparent hover:border-gold transition-all duration-200 group bg-transparent",
                    textColorClass,
                    isOpen && "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                )}
            >
                <span className="tracking-widest font-bold">[{user.name?.split(' ')[0].toUpperCase() || 'USER'}]</span>
                <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-300",
                    isOpen ? "rotate-180 text-white dark:text-black" : "text-gold"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-64 border-2 border-black dark:border-white bg-white dark:bg-black p-0 shadow-none z-[100]"
                    >
                        <div className="border-b border-black dark:border-white p-3 bg-gray-100 dark:bg-white/10">
                            <p className="text-[10px] text-gray-500 mb-1">CURRENT_SESSION:</p>
                            <p className="font-bold truncate">{user.email}</p>
                        </div>

                        <div className="p-0 flex flex-col">
                            {isAuthorized && (
                                <>
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gold hover:text-black transition-colors border-b border-black/10 dark:border-white/10"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>ADMIN_CONSOLE</span>
                                    </Link>

                                    {isSuperAdmin && (
                                        <Link
                                            to="/global"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gold hover:text-black transition-colors border-b border-black/10 dark:border-white/10"
                                        >
                                            <TerminalSquare className="w-4 h-4" />
                                            <span>GLOBAL_CONSOLE</span>
                                        </Link>
                                    )}

                                    <Link
                                        to={`/directory/${user.$id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gold hover:text-black transition-colors border-b border-black/10 dark:border-white/10"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>MY_PROFILE</span>
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-white transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>TERMINATE_SESSION</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
