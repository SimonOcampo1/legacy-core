import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { NarrativeManager } from "../components/admin/NarrativeManager";
import { GalleryManager } from "../components/admin/GalleryManager";
import { TimelineManager } from "../components/admin/TimelineManager";
import { MemberManager } from "../components/admin/MemberManager";
import { AdminGroupSettings } from "../components/admin/AdminGroupSettings";
import { cn } from "../lib/utils";
import { useGroup } from "../context/GroupContext";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID, GALLERY_COLLECTION_ID, MEMBERS_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import {
    LayoutDashboard,
    Edit3,
    Image as ImageIcon,
    History,
    Users,
    ArrowLeft,
    Shield,
    TerminalSquare
} from "lucide-react";

type ViewType = 'dashboard' | 'create-narrative' | 'gallery' | 'timeline' | 'members' | 'group-requests' | 'global-members';

export function AdminConsole() {
    const { currentGroup } = useGroup();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('tab') as ViewType || 'dashboard';
    const [currentView, setCurrentView] = useState<ViewType>(initialView);
    const [stats, setStats] = useState({ narratives: 0, gallery: 0, members: 0 });

    useEffect(() => {
        if (currentGroup?.$id) {
            fetchStats(currentGroup.$id);
        }
    }, [currentGroup]);

    const fetchStats = async (groupId: string) => {
        try {
            const [narratives, gallery, members] = await Promise.all([
                databases.listDocuments(DATABASE_ID, NARRATIVES_COLLECTION_ID, [
                    Query.equal('group_id', groupId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, GALLERY_COLLECTION_ID, [
                    Query.equal('group_id', groupId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, MEMBERS_COLLECTION_ID, [
                    Query.equal('groups', groupId),
                    Query.limit(1)
                ])
            ]);
            setStats({
                narratives: narratives.total,
                gallery: gallery.total,
                members: members.total
            });
        } catch (error: any) {
            console.error("Error fetching stats:", error);
            // Don't show toast error here to avoid spamming if just one fails, or handle gracefully
        }
    };

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

    // If no group is active, showing admin console might be confusing or empty.
    // However, the layout likely handles header selection.
    // If currentGroup is null, we can show a placeholder or redirect.
    if (!currentGroup) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="font-mono text-gray-500 uppercase">NO_ACTIVE_GROUP_SCOPE</p>
                    <p className="text-sm mt-2">Please select a group from the header to administer.</p>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'create-narrative', label: 'Narratives', icon: Edit3 },
        { id: 'gallery', label: 'Visuals', icon: ImageIcon },
        { id: 'timeline', label: 'Timeline', icon: History },
        // Only show Members if Admin (which they are if they are here)
        { id: 'members', label: 'Personnel', icon: Shield },
    ] as const;

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] font-sans text-black dark:text-white pb-24">
            {/* Top Bar */}
            <div className="border-b border-black dark:border-white/20 bg-gray-50 dark:bg-white/5 px-6 py-2 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                    <TerminalSquare className="w-4 h-4 text-gold" />
                    <span>ADMIN_CONSOLE_V2.0</span>
                    <span className="hidden md:inline text-gray-300">|</span>
                    <span className="hidden md:inline">{currentGroup.name.toUpperCase()}</span>
                </div>
                <Link to="/" className="font-mono text-xs hover:text-gold uppercase flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3" />
                    Exit_Console
                </Link>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-41px)]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 border-r border-black dark:border-white/20 flex flex-col pt-8 md:pt-12 bg-white dark:bg-[#09090b]">
                    <div className="px-6 mb-8">
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
                            Cmd<span className="text-gold">/</span>Center
                        </h1>
                        <p className="font-mono text-xs text-gray-400 leading-tight mb-6">
                            GROUP_CONTROL_INTERFACE
                        </p>

                        <div className="p-3 border border-dashed border-black/20 dark:border-white/20">
                            <p className="font-mono text-[10px] uppercase text-gray-400 mb-1">ACTIVE_SCOPE</p>
                            <p className="font-bold uppercase text-gold">{currentGroup.name}</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-px border-y border-black dark:border-white/20 bg-black dark:bg-white/20">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => changeView(item.id as ViewType)}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all text-left bg-white dark:bg-[#09090b] hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-black group",
                                        isActive && "bg-black text-gold dark:bg-white dark:text-black hover:bg-black hover:text-gold"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-gold dark:text-black" : "text-gray-400 group-hover:text-gold dark:group-hover:text-black")} />
                                    <span>{item.label}</span>
                                    {isActive && <div className="ml-auto w-2 h-2 bg-gold dark:bg-black" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-[#09090b] relative overflow-hidden flex flex-col">
                    {/* Background Grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    <div className="relative z-10 p-6 md:p-12 flex-1 overflow-y-auto">
                        {/* View Header - only for dashboard since other views have their own headers */}
                        {currentView === 'dashboard' && (
                            <div className="mb-12 border-b-2 border-black dark:border-white/20 pb-4 flex items-end justify-between">
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                                    {menuItems.find(i => i.id === currentView)?.label}
                                </h2>
                                <span className="font-mono text-xs text-gold">
                                    /// VIEW_MODE
                                </span>
                            </div>
                        )}

                        {currentView === 'dashboard' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                    <StatCard
                                        label="Total Narratives"
                                        value={stats.narratives.toString().padStart(3, '0')}
                                        id="LOGS"
                                    />
                                    <StatCard
                                        label="Archived Images"
                                        value={stats.gallery.toString().padStart(3, '0')}
                                        id="IMGS"
                                    />
                                    <StatCard
                                        label="Active Personnel"
                                        value={stats.members.toString().padStart(3, '0')}
                                        id="USRS"
                                    />
                                </div>
                                <AdminGroupSettings group={currentGroup} />
                            </>
                        )}

                        {currentView === 'create-narrative' && <NarrativeManager groupId={currentGroup.$id} />}
                        {currentView === 'gallery' && <GalleryManager groupId={currentGroup.$id} />}
                        {currentView === 'members' && <MemberManager groupId={currentGroup.$id} />}
                        {currentView === 'timeline' && <TimelineManager groupId={currentGroup.$id} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, id }: { label: string, value: string, id: string }) {
    return (
        <div className="border border-black dark:border-white/20 p-6 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group cursor-default">
            <div className="flex justify-between items-start mb-8">
                <span className="font-mono text-xs opacity-50">{id}</span>
                <Users className="w-5 h-5 text-gold group-hover:text-white dark:group-hover:text-black" />
            </div>
            <div className="text-5xl font-black mb-2 tracking-tighter">{value}</div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-70 group-hover:text-gold dark:group-hover:text-black transition-colors">{label}</div>
        </div>
    );
}
