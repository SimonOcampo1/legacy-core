import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NarrativeEditor } from "../components/admin/NarrativeEditor";
import { GalleryManager } from "../components/admin/GalleryManager";
import { cn } from "../lib/utils";

export function AdminConsole() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('tab') as 'dashboard' | 'create-narrative' | 'gallery' | 'timeline' || 'dashboard';
    const [currentView, setCurrentView] = useState<'dashboard' | 'create-narrative' | 'gallery' | 'timeline'>(initialView);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Sync state with URL if it changes externally
    useEffect(() => {
        const tab = searchParams.get('tab') as 'dashboard' | 'create-narrative' | 'gallery' | 'timeline';
        if (tab && tab !== currentView) {
            setCurrentView(tab);
        }
    }, [searchParams]);

    const changeView = (view: 'dashboard' | 'create-narrative' | 'gallery' | 'timeline') => {
        setCurrentView(view);
        setSearchParams({ tab: view });
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-slate-800 font-sans selection:bg-gray-100 selection:text-slate-900">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-8 flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 text-slate-800">
                        <span className="material-symbols-outlined text-2xl font-light">history_edu</span>
                    </div>
                    <div>
                        <h1 className="font-serif text-xl text-slate-900 tracking-wide">Legacy Core</h1>
                    </div>
                </div>
                <div className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto">
                    <button
                        onClick={() => changeView('dashboard')}
                        className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 rounded-none font-medium transition-all text-left",
                            currentView === 'dashboard' ? "text-slate-900 bg-gray-50 border-r-2 border-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                        )}
                    >
                        <span className="material-symbols-outlined text-[18px] font-light">dashboard</span>
                        <span className="text-sm">Dashboard</span>
                    </button>
                    <button
                        onClick={() => changeView('create-narrative')}
                        className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 rounded-none font-medium transition-all text-left",
                            currentView === 'create-narrative' ? "text-slate-900 bg-gray-50 border-r-2 border-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                        )}
                    >
                        <span className="material-symbols-outlined text-[18px] font-light">edit_note</span>
                        <span className="text-sm">Write Narrative</span>
                    </button>

                    <div className="pt-8 mt-4">
                        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Content</p>
                        <button
                            onClick={() => changeView('gallery')}
                            className={cn(
                                "flex w-full items-center gap-3 px-4 py-2 rounded-none transition-all text-left",
                                currentView === 'gallery' ? "text-slate-900 bg-gray-50 border-r-2 border-slate-900 font-medium" : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                            )}
                        >
                            <span className="material-symbols-outlined text-[18px] font-light">perm_media</span>
                            <span className="text-sm">Gallery</span>
                        </button>
                        <button
                            onClick={() => changeView('timeline')}
                            className={cn(
                                "flex w-full items-center gap-3 px-4 py-2 rounded-none transition-all text-left",
                                currentView === 'timeline' ? "text-slate-900 bg-gray-50 border-r-2 border-slate-900 font-medium" : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
                            )}
                        >
                            <span className="material-symbols-outlined text-[18px] font-light">timeline</span>
                            <span className="text-sm">Timeline</span>
                        </button>
                    </div>

                    <div className="mt-auto pb-4">
                        <div className="pt-8 mt-4">
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">System</p>
                            <Link className="flex items-center gap-3 px-4 py-2 rounded-none text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-all" to="#">
                                <span className="material-symbols-outlined text-[18px] font-light">settings</span>
                                <span className="text-sm">Settings</span>
                            </Link>
                            <button className="flex w-full items-center gap-3 px-4 py-2 rounded-none text-slate-500 hover:text-slate-900 hover:bg-gray-50 transition-all" onClick={handleLogout}>
                                <span className="material-symbols-outlined text-[18px] font-light">logout</span>
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-stone-200">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-cover bg-center grayscale opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCjzBy3I4wxCkJzKRvroAu_W1EmW0TkI07pN2yZoso1VL-_8AxHZEq1evzYVXRAV2VFnemPrqcv95ehpVqZrTSySd9BiE_lRfLfXz5y-LggukSvuG7FjmNvyHuMTjzrVkMzH9Jqq1qYid4TpxxTDDTdZA5dIsjrp3SOHJ2m_frRU9BiFAbJAe9h1G0Um1wN_wRt46pNiTMFZEsvhWeJgXT6NydQXJpAFpvcmehktO0JEDjIjrgZRpuC1uhqN6B9uWuY7S7WZmycNkI")' }}></div>
                        <div className="flex flex-col">
                            <span className="text-slate-900 text-sm font-medium font-serif">{user?.name || "Admin User"}</span>
                            <span className="text-slate-400 text-xs font-light truncate max-w-[150px]">{user?.email || "admin@legacy.edu"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-stone-50/50 relative">
                <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-stone-200 px-8 py-6 flex justify-between items-end">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-slate-900" onClick={() => setIsSidebarOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h2 className="text-2xl font-serif text-slate-900 font-medium">
                                {currentView === 'dashboard' && "Admin Console"}
                                {currentView === 'create-narrative' && "Write Narrative"}
                                {currentView === 'gallery' && "Gallery"}
                                {currentView === 'timeline' && "Timeline"}
                            </h2>
                            <p className="text-sm text-slate-500 font-light hidden md:block">
                                {currentView === 'dashboard' && "Manage content, users, and system settings."}
                                {currentView === 'create-narrative' && "Compose new stories for the legacy archive."}
                                {currentView === 'gallery' && "Manage the visual gallery."}
                                {currentView === 'timeline' && "Manage timeline events."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
                        </button>
                        <Link to="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1">
                            <span>View Site</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                        </Link>
                    </div>
                </header>

                <div className="p-8">
                    {currentView === 'dashboard' && (
                        <div className="max-w-6xl mx-auto space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Stats Cards */}
                                <div className="bg-white p-6 rounded-lg border border-stone-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 rounded-md text-emerald-600">
                                            <span className="material-symbols-outlined">auto_stories</span>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+2 this week</span>
                                    </div>
                                    <h3 className="text-3xl font-serif text-slate-900 mb-1">12</h3>
                                    <p className="text-sm text-slate-500">Published Narratives</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg border border-stone-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-md text-blue-600">
                                            <span className="material-symbols-outlined">perm_media</span>
                                        </div>
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+5 new</span>
                                    </div>
                                    <h3 className="text-3xl font-serif text-slate-900 mb-1">48</h3>
                                    <p className="text-sm text-slate-500">Gallery Images</p>
                                </div>
                                <div className="bg-white p-6 rounded-lg border border-stone-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-amber-50 rounded-md text-amber-600">
                                            <span className="material-symbols-outlined">group</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-serif text-slate-900 mb-1">8</h3>
                                    <p className="text-sm text-slate-500">Active Profiles</p>
                                </div>
                            </div>

                            {/* Recent Activity / Pending Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-serif text-lg text-slate-900">Pending Stories</h3>
                                        <Link to="#" className="text-xs font-medium text-slate-400 hover:text-slate-600 uppercase tracking-wider">View All</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">The First Hackathon</h4>
                                                        <p className="text-xs text-slate-400 mt-1">Draft • Last edited 2 days ago</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500">edit</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-serif text-lg text-slate-900">System Status</h3>
                                    </div>
                                    <div className="bg-slate-900 text-slate-200 p-6 rounded-lg shadow-md">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-4">
                                            <span className="text-sm font-medium text-slate-400">Database Status</span>
                                            <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                Operational
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-4">
                                            <span className="text-sm font-medium text-slate-400">Storage Usage</span>
                                            <span className="text-sm font-medium">1.2 GB / 2.0 GB</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-400">Last Backup</span>
                                            <span className="text-sm font-medium">Today, 04:00 AM</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {currentView === 'create-narrative' && (
                        <NarrativeEditor />
                    )}

                    {currentView === 'gallery' && (
                        <GalleryManager />
                    )}

                    {currentView === 'timeline' && (
                        <div className="flex flex-col items-center justify-center h-96 text-stone-400">
                            <span className="material-symbols-outlined text-4xl mb-2">construction</span>
                            <p>Timeline management coming soon.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
