import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { members } from "../../data/members";
import { MagneticButton } from "../ui/MagneticButton";
import { PpgLogo } from "../ui/PpgLogo";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const isNarrativeDetail = location.pathname.startsWith("/narratives/");
    const isHome = location.pathname === "/";
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const threshold = isNarrativeDetail ? 400 : 50; // Use deeper threshold for Narrative Detail
            setIsScrolled(window.scrollY > threshold);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isNarrativeDetail, isHome]);

    const isActive = (path: string) => location.pathname === path;

    const handleLogoClick = () => {
        if (location.pathname === "/") {
            const lenis = (window as any).lenis;
            if (lenis) {
                // Use Lenis for smooth scroll if available
                lenis.scrollTo(0);
            } else {
                // Fallback
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } else {
            navigate("/");
        }
    };

    // Logic to determine "Back" destination for active member
    let activeMemberProfileLink = "/";
    if (isNarrativeDetail) {
        const narrativeId = location.pathname.split("/narratives/")[1];
        if (narrativeId) {
            const member = members.find(m => m.narratives?.some(n => n.id === narrativeId));
            if (member) {
                // Assuming profile route is /profile/:memberId - need to verify if Profile route exists separately or if it's Directory based
                // Based on previous chats, there is a Profile page. Let's assume /profile/:id or similar.
                // Route defined in App.tsx is /directory/:id
                activeMemberProfileLink = `/directory/${member.id}`;
            }
        }
    }

    // Determine header background/border based on state
    const getHeaderClasses = () => {
        if (isNarrativeDetail) {
            return isScrolled
                ? "top-0 border-b bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-stone-200 dark:border-stone-800 py-0"
                : "top-4 border-transparent py-0";
        }
        if (isHome) {
            return isScrolled
                ? "top-0 border-b bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-stone-200 dark:border-stone-800 py-0"
                : "top-0 bg-transparent border-transparent py-6"; // Increased padding for airy look
        }
        // Default (Directory, Gallery, etc.)
        return isScrolled
            ? "top-0 border-b bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-stone-200 dark:border-stone-800 py-0"
            : "top-0 bg-transparent border-transparent py-4";
    };



    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark transition-colors duration-300">

            <header
                className={`fixed left-0 right-0 z-50 transition-all duration-700 ease-out flex justify-center ${getHeaderClasses()}`}
            >
                <div className={`transition-all duration-500 ease-out items-center ${isNarrativeDetail && !isScrolled
                    ? "flex justify-between w-auto gap-8 px-8 py-3 rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-md border border-stone-200 dark:border-white/10 shadow-2xl"
                    : "grid grid-cols-3 w-full max-w-[1800px] px-6 h-20 rounded-none bg-transparent border-none"
                    }`}>
                    {isNarrativeDetail ? (
                        <>
                            {/* Narrative Detail Header Variant */}
                            <div className="justify-self-start">
                                <MagneticButton strength={20} className="fit-content">
                                    <Link to={activeMemberProfileLink} className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300 text-charcoal dark:text-white hover:text-[#C5A059]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:-translate-x-1"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                                        <span>Back to Narratives</span>
                                    </Link>
                                </MagneticButton>
                            </div>

                            <div className="justify-self-center hidden md:block">
                                {/* Optional Center element for Narrative Detail if needed */}
                            </div>

                            <div className="justify-self-end flex items-center gap-6 border-l border-stone-200 dark:border-white/20 pl-6">
                                <p className="hidden md:block font-serif text-lg italic leading-none transition-colors duration-300 text-charcoal dark:text-white">Alex Smith</p>
                                <div>
                                    <MagneticButton strength={15}>
                                        <ModeToggle />
                                    </MagneticButton>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Standard Global Header */}
                            <div className="justify-self-start">
                                <MagneticButton strength={25} className="fit-content">
                                    <div
                                        role="button"
                                        onClick={handleLogoClick}
                                        className="block group cursor-pointer"
                                    >
                                        <PpgLogo className={`h-16 w-auto transition-colors duration-300 group-hover:text-[#C5A059] ${isHome && !isScrolled ? "text-charcoal dark:text-white" : "text-primary dark:text-white"
                                            }`} />
                                    </div>
                                </MagneticButton>
                            </div>

                            {/* Desktop Navigation - Perfectly Centered */}
                            <nav className="hidden md:flex items-center justify-center gap-12 justify-self-center">
                                {["Timeline", "Gallery", "Directory"].map((item) => (
                                    <Link
                                        key={item}
                                        to={`/${item.toLowerCase()}`}
                                        className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${isActive(`/${item.toLowerCase()}`)
                                            ? "text-primary dark:text-white"
                                            : isHome && !isScrolled
                                                ? "text-charcoal/80 dark:text-white/80 hover:text-charcoal dark:hover:text-white"
                                                : "text-stone-400 hover:text-primary dark:text-stone-500 dark:hover:text-white"
                                            }`}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>

                            {/* Right Actions */}
                            <div className="justify-self-end flex items-center gap-6">
                                <div className="flex items-center gap-4 border-r border-stone-200 dark:border-stone-800 pr-6 mr-2">
                                    <MagneticButton strength={15}>
                                        <button className={`${isHome && !isScrolled ? "text-charcoal/80 dark:text-white/80" : "text-slate-400"
                                            } hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-2`}>
                                            <Search className="w-5 h-5 font-light" strokeWidth={1.5} />
                                        </button>
                                    </MagneticButton>
                                    <div className="text-right hidden sm:block">
                                        <p className={`font-serif text-lg italic leading-none ${isHome && !isScrolled ? "text-charcoal dark:text-white" : ""
                                            }`}>Alex Smith</p>
                                    </div>
                                    <MagneticButton strength={15}>
                                        <ModeToggle />
                                    </MagneticButton>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>


            <main className={`flex-grow ${(isNarrativeDetail || isHome) ? 'pt-0' : 'pt-28'}`}>
                {children}
            </main>


            <footer className="bg-background-light dark:bg-background-dark py-12 border-t border-stone-200 dark:border-stone-800 transition-colors duration-300">
                <div className="max-w-[1800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="font-serif text-stone-500 dark:text-stone-400 italic">
                        © 2024 The Archives. All formatting preserved.
                    </p>
                    <div className="flex gap-8 text-xs uppercase tracking-widest text-stone-400 dark:text-stone-500">
                        <a href="#" className="hover:text-charcoal dark:hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-charcoal dark:hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}
