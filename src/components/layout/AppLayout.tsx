import { LoginModal } from "../auth/LoginModal";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ModeToggle } from "../mode-toggle";
import { UserMenu } from "./UserMenu";
import { PPGLogo } from "../ui/PPGLogo";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();
    const { user } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        (window as any).openLoginModal = () => setIsLoginModalOpen(true);
        return () => {
            delete (window as any).openLoginModal;
        };
    }, []);

    const isActive = (path: string) => {
        if (path === "/" && location.pathname === "/") return true;
        if (path !== "/" && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-black dark:text-gray-100 transition-colors duration-300 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {/* Top Navigation Bar - Technical/Solid */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#09090b] border-b-2 border-black dark:border-white/20 h-16 flex items-center justify-between px-4 md:px-8">
                {/* Logo Area */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="group flex items-center gap-2"
                        onClick={(e) => {
                            if (location.pathname === "/") {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                        }}
                    >
                        <PPGLogo className="h-16 w-auto text-black dark:text-white group-hover:text-[#C5A059] transition-colors duration-300" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
                    {[
                        { name: "HOME", path: "/" },
                        { name: "TIMELINE", path: "/timeline" },
                        { name: "GALLERY", path: "/gallery" },
                        { name: "DIRECTORY", path: "/directory" },
                        { name: "ARCHIVES", path: "/narratives" }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`px-4 py-2 border border-transparent hover:border-[#C5A059] hover:text-[#C5A059] transition-all duration-200 ${isActive(item.path)
                                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                                : "text-gray-600 dark:text-gray-400"
                                }`}
                        >
                            [{item.name}]
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <div className="h-4 w-px bg-black/20 dark:bg-white/20 hidden sm:block" />
                    <ModeToggle />
                    {user ? (
                        <div className="pl-2">
                            <UserMenu />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="font-mono text-xs hover:text-[#C5A059] underline decoration-1 underline-offset-4 transition-colors"
                        >
                            LOGIN_
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile Navigation Bar (Bottom) - if needed, or simple menu for now keeping it clean */}
            {/* For now relying on standard responsive hiding/stacking if complex, but here a simple scrollable nav or just keeping it simple */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#09090b] border-t-2 border-black dark:border-white/20 h-16 flex items-center justify-around px-2 font-mono text-[10px]">
                <Link
                    to="/"
                    className={isActive('/') ? "text-[#C5A059]" : ""}
                    onClick={(e) => {
                        if (location.pathname === "/") {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                    }}
                >
                    [HOME]
                </Link>
                <Link to="/narratives" className={isActive('/narratives') ? "text-[#C5A059]" : ""}>[ARCHIVE]</Link>
                <Link to="/timeline" className={isActive('/timeline') ? "text-[#C5A059]" : ""}>[TIME]</Link>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow pt-16 md:pb-0 pb-16">
                {children}
            </main>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
}
