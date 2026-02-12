import { useState, useEffect } from "react";
import { ModeToggle } from "../components/mode-toggle";
import { Link, useSearchParams } from "react-router-dom";
import { NarrativeEditor } from "../components/admin/NarrativeEditor";
import { GalleryManager } from "../components/admin/GalleryManager";
import { MemberManager } from "../components/admin/MemberManager";
import { TimelineManager } from "../components/admin/TimelineManager"; // Added TimelineManager import
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID, GALLERY_COLLECTION_ID, MEMBERS_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import {
    LayoutDashboard,
    Edit3,
    Image as ImageIcon,
    History,
    Users,
    ArrowLeft,
    Shield
} from "lucide-react";

type ViewType = 'dashboard' | 'create-narrative' | 'gallery' | 'timeline' | 'members';

export function AdminConsole() {
    const { isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('tab') as ViewType || 'dashboard';
    const [currentView, setCurrentView] = useState<ViewType>(initialView);
    const [stats, setStats] = useState({ narratives: 0, gallery: 0, members: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [narratives, gallery, members] = await Promise.all([
                databases.listDocuments(DATABASE_ID, NARRATIVES_COLLECTION_ID, [Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, GALLERY_COLLECTION_ID, [Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, MEMBERS_COLLECTION_ID, [Query.limit(1)])
            ]);
            setStats({
                narratives: narratives.total,
                gallery: gallery.total,
                members: members.total
            });
        } catch (error: any) {
            console.error("Error fetching stats:", error);
            if (error.code === 404) {
                console.warn("Collection 'profiles' was not found in Appwrite. Please ensure MEMBERS_COLLECTION_ID is configured correctly.");
            }
        }
    };

    // Sync state with URL if it changes externally
    useEffect(() => {
        const tab = searchParams.get('tab') as ViewType;
        if (tab && tab !== currentView) {
            setCurrentView(tab);
        }
    }, [searchParams]);

    const changeView = (view: ViewType) => {
        setCurrentView(view);
        setSearchParams({ tab: view });
    };

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'create-narrative', label: 'Write', icon: Edit3 },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'timeline', label: 'Timeline', icon: History },
        ...(isAdmin ? [{ id: 'members', label: 'Members', icon: Shield }] : []),
    ] as const;

    return (
        <div className="min-h-screen bg-[#F5F5F3] dark:bg-stone-950 font-sans selection:bg-[#C5A059]/10 selection:text-[#C5A059]">
            {/* Header / Nav Area */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-400 hover:text-charcoal dark:hover:text-white transition-all group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="text-xs font-medium">Back to Homepage</span>
                            </Link>
                            <ModeToggle />
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 font-bold">Administrative Core</span>
                            <div className="h-px w-12 bg-stone-200 dark:bg-stone-800"></div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif italic text-charcoal dark:text-white tracking-tight leading-none mb-4">
                            Console
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400 font-light max-w-md leading-relaxed">
                            Organize memories, curate the visual archive, and manage the digital legacy.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-stone-950 p-1.5 rounded-full shadow-sm border border-stone-100 dark:border-stone-800 transition-all overflow-x-auto no-scrollbar">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => changeView(item.id as ViewType)}
                                    className={cn(
                                        "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                        isActive
                                            ? "text-white dark:text-charcoal"
                                            : "text-stone-500 dark:text-stone-400 hover:text-charcoal dark:hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-tab"
                                            className="absolute inset-0 bg-charcoal dark:bg-white rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Icon className={cn("w-4 h-4 relative z-10", isActive ? "opacity-100" : "opacity-60")} strokeWidth={isActive ? 2 : 1.5} />
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="pb-24"
                    >
                        {currentView === 'dashboard' && (
                            <div className="max-w-4xl mx-auto py-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <StatCard
                                        label="Published Narratives"
                                        value={stats.narratives.toString().padStart(2, '0')}
                                        trend="live archive"
                                        icon={Edit3}
                                        color="brass"
                                    />
                                    <StatCard
                                        label="Visual Assets"
                                        value={stats.gallery.toString().padStart(2, '0')}
                                        trend="gallery"
                                        icon={ImageIcon}
                                        color="stone"
                                    />
                                    <StatCard
                                        label="Authorized Members"
                                        value={stats.members.toString().padStart(2, '0')}
                                        trend="collaborators"
                                        icon={Users}
                                        color="charcoal"
                                    />
                                </div>
                            </div>
                        )}

                        {currentView === 'create-narrative' && <NarrativeEditor />}
                        {currentView === 'gallery' && <GalleryManager />}
                        {currentView === 'members' && isAdmin && <MemberManager />}
                        {currentView === 'timeline' && <TimelineManager />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: 'brass' | 'stone' | 'charcoal' }) {
    const colorMap = {
        brass: "bg-[#C5A059]/10 text-[#C5A059]",
        stone: "bg-stone-100 text-stone-600 dark:bg-stone-950 dark:text-stone-300",
        charcoal: "bg-stone-950 text-white"
    };

    return (
        <div className="bg-white dark:bg-stone-950 p-8 rounded-3xl border border-stone-100 dark:border-stone-800/50 shadow-sm transition-transform hover:-translate-y-1 duration-500">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl", colorMap[color])}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                {trend !== 'stable' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-4xl font-serif italic text-charcoal dark:text-white mb-1 leading-none">{value}</h3>
            <p className="text-xs uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 font-bold">{label}</p>
        </div>
    );
}
