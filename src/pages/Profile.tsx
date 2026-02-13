import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Share, Bookmark, ArrowRight, Shield } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { useState, useEffect } from "react";
import { databases, storage, DATABASE_ID, PROFILES_COLLECTION_ID, NARRATIVES_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import type { Member, Narrative } from "../types";

// Local interface for the display-ready narrative structure
interface ProfileNarrative {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    description: string;
}

export function Profile() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [member, setMember] = useState<Member | null>(null);
    const [narratives, setNarratives] = useState<ProfileNarrative[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const BUCKET_ID = "legacy_core_assets";

    useEffect(() => {
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

                let imageUrl = "https://placehold.co/400x400/png?text=Profile";
                if (memberDoc.avatar_id) {
                    if (memberDoc.avatar_id.startsWith("http")) {
                        imageUrl = memberDoc.avatar_id;
                    } else {
                        try {
                            imageUrl = storage.getFileView(BUCKET_ID, memberDoc.avatar_id).toString();
                        } catch (e) {
                            console.error("Error getting image view:", e);
                        }
                    }
                }

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
                    }
                };
                setMember(mappedMember);

                // Fetch Narratives for this member
                const narrativesResponse = await databases.listDocuments(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    [
                        Query.equal("author_id", [id || ""]),
                        Query.orderDesc("date_event")
                    ]
                );

                const mappedNarratives: ProfileNarrative[] = (narrativesResponse.documents as unknown as Narrative[]).map((doc) => ({
                    id: doc.$id,
                    title: doc.title,
                    excerpt: doc.content || "",
                    description: doc.description || "",
                    date: doc.date_event ? new Date(doc.date_event).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "N/A",
                }));

                setNarratives(mappedNarratives);

            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

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
                <Link to="/directory" className="text-xs uppercase border-b border-black dark:border-white hover:text-[#C5A059] hover:border-[#C5A059]">
                    Return to Index
                </Link>
            </div>
        );
    }

    const honors = member.honors || ["Class of 2014", member.role];

    if (isPending) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#09090b] px-6 text-center font-mono">
                <Shield className="w-12 h-12 mb-6 text-[#C5A059]" />
                <h2 className="text-2xl uppercase tracking-tighter mb-4">Status: Pending Approval</h2>
                <p className="max-w-md text-gray-500 text-xs mb-8">
                    // ID: {member.id.substring(0, 8)}<br />
                    AWAITING ADMINISTRATOR REVIEW...
                </p>
                <Link to="/" className="text-xs uppercase border-b border-black dark:border-white hover:text-[#C5A059] hover:border-[#C5A059]">
                    [ LOGOUT ]
                </Link>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="bg-white dark:bg-[#09090b] min-h-screen pt-12 font-sans">
                {/* Header Section with Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-black dark:border-white/20 min-h-[60vh]">

                    {/* Left: Image & Identity */}
                    <div className="lg:col-span-5 relative min-h-[60vh] lg:min-h-0 bg-gray-100 dark:bg-stone-900 border-r border-black dark:border-white/20">
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
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="p-8 lg:p-16 border-b border-black dark:border-white/20 flex-grow">
                            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
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
                                <span className="text-xl font-bold">2014</span>
                            </div>
                            <div className="p-6 flex flex-col justify-between hover:bg-black hover:text-[#C5A059] dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer group">
                                <span className="group-hover:text-[#C5A059]">CONTACT</span>
                                <span className="text-xl font-bold text-gray-500 group-hover:text-[#C5A059]">EMAIL ↗</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Narratives Section */}
                <div className="max-w-[1920px] mx-auto">
                    <div className="border-b border-black dark:border-white/20 px-4 md:px-8 py-4 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 className="font-bold uppercase tracking-tight">Personnel Logs [{narratives.length}]</h3>
                        <span className="font-mono text-xs text-gray-500">/// ARCHIVED_DATA</span>
                    </div>

                    <div className="divide-y divide-black dark:divide-white/20">
                        {narratives.length > 0 ? (
                            narratives.map((story, index) => (
                                <div
                                    key={story.id}
                                    className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 p-4 md:p-8 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-0 cursor-pointer"
                                    onClick={() => navigate(`/narratives/${story.id}`)}
                                >
                                    <div className="md:col-span-2 font-mono text-xs text-gray-500 group-hover:text-[#C5A059] flex flex-row md:flex-col justify-between md:justify-start gap-2">
                                        <span>{story.date}</span>
                                        <span>LOG_{index.toString().padStart(3, '0')}</span>
                                    </div>
                                    <div className="md:col-span-8">
                                        <h4 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2 group-hover:text-[#C5A059] transition-colors">{story.title}</h4>
                                        <p className="font-mono text-sm opacity-70 line-clamp-2 max-w-3xl">{story.description || story.excerpt.replace(/<[^>]*>?/gm, '')}</p>
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-end">
                                        <ArrowRight className="w-6 h-6 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300 group-hover:text-[#C5A059]" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center font-mono text-sm text-gray-400">
                                [ NO_LOGS_AVAILABLE_FOR_USERS ]
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
