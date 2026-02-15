import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Share, Bookmark, ArrowRight, Shield, FileText } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { useState, useEffect } from "react";
import { databases, DATABASE_ID, PROFILES_COLLECTION_ID, NARRATIVES_COLLECTION_ID, getImageUrl } from "../lib/appwrite";
import { Query } from "appwrite";
import type { Member, Narrative } from "../types";
import { EmptyState } from "../components/ui/EmptyState";

// Local interface for the display-ready narrative structure
interface ProfileNarrative {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    description: string;
}

type TabType = 'narratives' | 'timeline' | 'gallery';

import { TimelineManager } from "../components/admin/TimelineManager";
import { GalleryManager } from "../components/admin/GalleryManager";
import { NarrativeEditor } from "../components/admin/NarrativeEditor";
import { ProfileEditModal } from "../components/profile/ProfileEditModal";
import { Settings, Edit3, Plus, ArrowLeft } from "lucide-react";
import { useGroup } from "../context/GroupContext";

export function Profile() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { currentGroup } = useGroup();
    const { id } = useParams<{ id: string }>();
    const [member, setMember] = useState<Member | null>(null);
    const [narratives, setNarratives] = useState<ProfileNarrative[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);

    // Edit Mode State
    const [activeTab, setActiveTab] = useState<TabType>('narratives');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editingNarrative, setEditingNarrative] = useState<any>(null);
    const [showNarrativeEditor, setShowNarrativeEditor] = useState(false);



    const isOwner = currentUser && member && currentUser.$id === member.id;

    const fetchProfile = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // Fetch Member
            const memberDoc = await databases.getDocument(
                DATABASE_ID,
                PROFILES_COLLECTION_ID,
                id
            );

            const imageUrl = getImageUrl(memberDoc.avatar_id);

            const honors = memberDoc.honors || [];

            if (!memberDoc.is_authorized && memberDoc.$id !== currentUser?.$id) {
                throw new Error("This profile is currently private or pending approval.");
            }

            if (!memberDoc.is_authorized) {
                setIsPending(true);
            }

            const mappedMember: Member = {
                id: memberDoc.$id,
                name: memberDoc.name,
                role: memberDoc.role,
                imageUrl: imageUrl,
                bio: memberDoc.bio,
                bioIntro: memberDoc.bioIntro,
                quote: memberDoc.quote,
                honors: honors,
                social: {
                    email: memberDoc.has_email ? "mailto:email@example.com" : undefined,
                    linkedin: memberDoc.has_linkedin ? "#" : undefined
                },
                joined: memberDoc.$createdAt
            };
            setMember(mappedMember);

            // Fetch Narratives for this member AND current group
            const narrativeQueries = [
                Query.equal("author_id", [id || ""]),
                Query.orderDesc("date_event")
            ];

            if (currentGroup?.$id) {
                narrativeQueries.push(Query.equal("group_id", currentGroup.$id));
            }

            const narrativesResponse = await databases.listDocuments(
                DATABASE_ID,
                NARRATIVES_COLLECTION_ID,
                narrativeQueries
            );

            const mappedNarratives: ProfileNarrative[] = (narrativesResponse.documents as unknown as Narrative[]).map((doc) => ({
                id: doc.$id,
                title: doc.title,
                excerpt: doc.content || "",
                description: doc.description || "",
                date: doc.date_event ? new Date(doc.date_event).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "N/A",
                // Store raw doc for editing
                raw: doc
            }));

            // @ts-ignore
            setNarratives(mappedNarratives);

        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id, currentUser?.$id, currentGroup?.$id]);

    // Scroll to top when editor opens
    useEffect(() => {
        if (showNarrativeEditor) {
            window.scrollTo(0, 0);
        }
    }, [showNarrativeEditor]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
                <div className="font-mono text-sm animate-pulse">[ ACCESSING_RECORD ]</div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#09090b] font-mono">
                <h2 className="text-xl mb-4 uppercase">[ ERROR: RECORD_NOT_FOUND ]</h2>
                <Link to="/directory" className="text-xs uppercase border-b border-black dark:border-white hover:text-gold hover:border-gold">
                    Return to Index
                </Link>
            </div>
        );
    }

    const honors = member.honors || ["Class of 2014", member.role];

    if (isPending) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#09090b] px-6 text-center font-mono">
                <Shield className="w-12 h-12 mb-6 text-gold" />
                <h2 className="text-2xl uppercase tracking-tighter mb-4">Status: Pending Approval</h2>
                <p className="max-w-md text-gray-500 text-xs mb-8">
                    // ID: {member.id.substring(0, 8)}<br />
                    AWAITING ADMINISTRATOR REVIEW...
                </p>
                <Link to="/" className="text-xs uppercase border-b border-black dark:border-white hover:text-gold hover:border-gold">
                    [ LOGOUT ]
                </Link>
            </div>
        );
    }

    // Handlers
    const handleNarrativeSuccess = () => {
        setShowNarrativeEditor(false);
        setEditingNarrative(null);
        fetchProfile();
    };

    const handleEditNarrative = (narrative: any) => {
        setEditingNarrative(narrative);
        setShowNarrativeEditor(true);
    };

    if (showNarrativeEditor && isOwner) {
        return (
            <div className="bg-white dark:bg-[#09090b] min-h-screen pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <button
                        onClick={() => {
                            setShowNarrativeEditor(false);
                            setEditingNarrative(null);
                        }}
                        className="flex items-center gap-2 font-mono text-xs uppercase hover:text-gold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        RETURN_TO_PROFILE
                    </button>
                    <NarrativeEditor
                        memberId={member.id}
                        initialData={editingNarrative}
                        groupId={currentGroup?.$id}
                        onSuccess={handleNarrativeSuccess}
                    />
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="bg-white dark:bg-[#09090b] min-h-screen pt-12 font-sans">
                {/* Header Section with Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black dark:border-white/20 lg:min-h-[65vh] min-h-[auto]">

                    {/* Left: Image & Identity */}
                    <div className="lg:col-span-4 relative min-h-[50vh] lg:min-h-0 bg-gray-100 dark:bg-stone-900 border-r border-black dark:border-white/20 group">
                        <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                        />

                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                        {/* Status Marker Overlay */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 mix-blend-difference text-white">
                            <div className="font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm bg-black/20 px-2 py-1">
                                ID: {member.id.substring(0, 8).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2 backdrop-blur-sm bg-black/20 px-2 py-1">
                                <span className="font-mono text-[10px] uppercase tracking-widest">ACTIVE</span>
                                <div className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse rounded-full" />
                            </div>
                        </div>

                        {/* Edit Profile Button removed from here */}

                        {/* Quick Actions Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 divide-x divide-white/20 border-t border-white/20 bg-black/40 backdrop-blur-md text-white z-10">
                            {[Mail, Share, Bookmark].map((Icon, idx) => (
                                <button key={idx} className="py-4 flex justify-center items-center hover:bg-white hover:text-black transition-colors group">
                                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Data & Bio */}
                    <div className="lg:col-span-8 flex flex-col">
                        <div className="p-8 lg:p-12 border-b border-black dark:border-white/20 flex-grow relative flex flex-col justify-center">
                            <div className="absolute top-8 right-8 flex items-center gap-4">
                                {isOwner && (
                                    <button
                                        onClick={() => setIsProfileModalOpen(true)}
                                        className="flex items-center gap-2 bg-black text-white px-4 py-2 font-mono text-xs uppercase hover:bg-gold hover:text-black transition-colors"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        EDIT_IDENTITY
                                    </button>
                                )}
                                <Settings className="w-4 h-4 animate-spin-slow opacity-20" />
                            </div>

                            <h1 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                                {member.name.split(' ').map((word, i) => (
                                    <span key={i} className="block">{word}</span>
                                ))}
                            </h1>

                            <div className="flex flex-wrap gap-4 mb-12">
                                {honors.map((honor, index) => (
                                    <span key={index} className="font-mono text-xs border border-black dark:border-white/20 px-3 py-1 uppercase tracking-wider">
                                        {honor}
                                    </span>
                                ))}
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                {member.bioIntro && (
                                    <p className="text-xl font-bold uppercase leading-tight">
                                        {member.bioIntro}
                                    </p>
                                )}
                                <p className="font-mono text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                    {member.bio || member.quote}
                                </p>
                            </div>
                        </div>

                        {/* Recent Activity / Stats Placeholder */}
                        <div className="grid grid-cols-3 divide-x divide-black dark:divide-white/20 h-24 font-mono text-xs">
                            <div className="p-6 flex flex-col justify-between">
                                <span className="text-gray-500">ENTRIES</span>
                                <span className="text-xl font-bold">{narratives.length.toString().padStart(2, '0')}</span>
                            </div>
                            <div className="p-6 flex flex-col justify-between">
                                <span className="text-gray-500">JOINED</span>
                                <span className="text-xl font-bold">
                                    {member.joined
                                        ? new Date(member.joined).getFullYear()
                                        : "2014"}
                                </span>
                            </div>
                            <div className="p-6 flex flex-col justify-between hover:bg-black hover:text-gold dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer group">
                                <span className="group-hover:text-gold">CONTACT</span>
                                <span className="text-xl font-bold text-gray-500 group-hover:text-gold">EMAIL ↗</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section - Unified View */}
                <div className="max-w-[1920px] mx-auto min-h-[50vh]">
                    {/* Tabs */}
                    <div className="flex border-b border-black dark:border-white/20 sticky top-0 bg-white dark:bg-[#09090b] z-20 overflow-x-auto">
                        {[
                            { id: 'narratives', label: 'NARRATIVE_LOGS' },
                            { id: 'timeline', label: 'TIMELINE_DATA' },
                            { id: 'gallery', label: 'VISUAL_ARCHIVE' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-8 py-6 font-mono text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-8 bg-gray-50 dark:bg-black/20">
                        {activeTab === 'timeline' && (
                            // Timeline Manager handles its own view/edit logic based on memberId internally if designed correctly
                            // But here we might want to wrap it or ensure it shows list + add button
                            // Current TimelineManager seems to cover crud. 
                            // Let's ensure it has memberId prop passed which we did.
                            <TimelineManager memberId={member.id} groupId={currentGroup?.$id} />
                        )}

                        {activeTab === 'gallery' && (
                            <GalleryManager memberId={member.id} groupId={currentGroup?.$id} />
                        )}

                        {activeTab === 'narratives' && (
                            <div className="max-w-7xl mx-auto space-y-6">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-bold uppercase tracking-tight text-2xl">LOG ENTRIES</h3>
                                    {isOwner && (
                                        <button
                                            onClick={() => setShowNarrativeEditor(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-gold hover:text-black dark:hover:bg-gold transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                            NEW_ENTRY
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-4">
                                    {narratives.map((story: any) => (
                                        <div
                                            key={story.id}
                                            className="group border border-black dark:border-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#09090b] hover:shadow-lg transition-all cursor-pointer"
                                            onClick={() => navigate(`/narratives/${story.id}`)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-xs text-gold">{story.date}</span>
                                                    {isOwner && (
                                                        <span className={`font-mono text-[10px] px-2 py-0.5 border ${story.raw?.status === 'published'
                                                            ? 'border-green-500 text-green-600'
                                                            : 'border-gray-400 text-gray-500'
                                                            }`}>
                                                            {(story.raw?.status || 'published').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold uppercase text-xl group-hover:text-gold transition-colors">{story.title}</h4>
                                                <p className="font-mono text-sm leading-relaxed opacity-60 mt-2 line-clamp-2">
                                                    {story.description || story.excerpt.replace(/<[^>]*>?/gm, '')}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {isOwner ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditNarrative(story.raw);
                                                        }}
                                                        className="px-4 py-2 border border-black dark:border-white font-mono text-xs uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                                    >
                                                        EDIT_CONTENT
                                                    </button>
                                                ) : (
                                                    <ArrowRight className="w-6 h-6 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300 group-hover:text-gold" />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {narratives.length === 0 && (
                                        <EmptyState
                                            title="NARRATIVE_VOID"
                                            message={isOwner ? "NO LOGS YET." : "NO LOGS FOUND."}
                                            icon={FileText}
                                            actionLabel={isOwner ? "[ CREATE_ENTRY ]" : undefined}
                                            onAction={isOwner ? () => setShowNarrativeEditor(true) : undefined}
                                            className="border border-dashed border-gray-300 dark:border-gray-700"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Edit Modal */}
                {member && (
                    <ProfileEditModal
                        isOpen={isProfileModalOpen}
                        onClose={() => setIsProfileModalOpen(false)}
                        member={member}
                        onSuccess={fetchProfile}
                    />
                )}
            </div>
        </PageTransition>
    );
}
