import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MemberManager } from "../components/admin/MemberManager";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import {
    LayoutDashboard,
    Users,
    ArrowLeft,
    TerminalSquare
} from "lucide-react";

import { GroupRequestManager } from "../components/admin/GroupRequestManager";

type ViewType = 'dashboard' | 'group-requests' | 'global-members';

export function GlobalConsole() {
    const { isSuperAdmin } = useAuth();
    const { currentGroup } = useGroup();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('tab') as ViewType || 'dashboard';
    const [currentView, setCurrentView] = useState<ViewType>(initialView);

    // Default accent color if no group is selected or availalbe
    const accentColor = currentGroup?.accent_color || '#9333ea'; // Fallback to purple

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

    if (!isSuperAdmin) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="font-mono text-red-500">ACCESS_DENIED // SUPERADMIN_ONLY</p>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'group-requests', label: 'Group Requests', icon: TerminalSquare },
        { id: 'global-members', label: 'Global Personnel', icon: Users },
    ] as const;

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090b] font-sans text-black dark:text-white pb-24">
            {/* Top Bar */}
            <div className="border-b border-black dark:border-white/20 bg-gray-50 dark:bg-white/5 px-6 py-2 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                    <TerminalSquare className="w-4 h-4" style={{ color: accentColor }} />
                    <span>GLOBAL_CONSOLE_V1.0</span>
                    <span className="hidden md:inline text-gray-300">|</span>
                    <span className="hidden md:inline">SYSTEM_ROOT_ACCESS</span>
                </div>
                <Link
                    to="/"
                    className="font-mono text-xs hover:opacity-70 uppercase flex items-center gap-2 transition-opacity"
                    style={{ color: accentColor }}
                >
                    <ArrowLeft className="w-3 h-3" />
                    Exit_Global
                </Link>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-41px)]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 border-r border-black dark:border-white/20 flex flex-col pt-8 md:pt-12 bg-white dark:bg-[#09090b]">
                    <div className="px-6 mb-8">
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
                            Global<span style={{ color: accentColor }}>/</span>Net
                        </h1>
                        <p className="font-mono text-xs text-gray-400 leading-tight mb-6">
                            SUPERUSER_CONTROL_INTERFACE
                        </p>
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
                                        "flex items-center gap-4 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all text-left bg-white dark:bg-[#09090b] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black group",
                                        isActive && "bg-black text-white dark:bg-white dark:text-black"
                                    )}
                                    style={isActive ? { color: accentColor } : {}}
                                >
                                    <Icon
                                        className={cn("w-4 h-4 transition-colors")}
                                        style={{ color: isActive ? accentColor : undefined }}
                                    />
                                    <span>{item.label}</span>
                                    {isActive && <div className="ml-auto w-2 h-2" style={{ backgroundColor: accentColor }} />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-[#09090b] relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    <div className="relative z-10 p-6 md:p-12 flex-1 overflow-y-auto">
                        {currentView === 'dashboard' && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <TerminalSquare className="w-16 h-16 opacity-50" style={{ color: accentColor }} />
                                <h2 className="text-2xl font-black uppercase">System Overview</h2>
                                <p className="font-mono text-sm text-gray-500 max-w-md">
                                    Select a module from the sidebar to manage global resources.
                                    Use 'Group Requests' to approve new network nodes.
                                </p>
                            </div>
                        )}

                        {currentView === 'group-requests' && <GroupRequestManager />}
                        {currentView === 'global-members' && <MemberManager />}
                    </div>
                </div>
            </div>
        </div>
    );
}
