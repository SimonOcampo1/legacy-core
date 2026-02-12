import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Share, Bookmark, ArrowRight, Shield } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
// import { cn } from "../lib/utils";
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
    // Optional fields if needed for UI but not present in current mapping
    role?: string;
    category?: string;
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

                // Parse honors if it's a string disguised as array or just use raw
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
                        Query.equal("author_id", [id || ""]), // Matching by ID (slug)
                        Query.orderDesc("date_event")
                    ]
                );

                const mappedNarratives: ProfileNarrative[] = (narrativesResponse.documents as unknown as Narrative[]).map((doc) => ({
                    id: doc.$id,
                    title: doc.title,
                    excerpt: doc.content || "",
                    date: doc.date_event ? new Date(doc.date_event).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A",
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
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-48 w-48 bg-stone-200 dark:bg-stone-800 rounded-full mb-8"></div>
                    <div className="h-8 w-64 bg-stone-200 dark:bg-stone-800 rounded mb-4"></div>
                    <div className="h-4 w-96 bg-stone-100 dark:bg-stone-900 rounded"></div>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-background-light dark:bg-background-dark text-charcoal dark:text-white">
                <h2 className="font-serif text-4xl mb-4">Member Not Found</h2>
                <Link to="/directory" className="text-sm uppercase tracking-widest border-b border-current pb-1 hover:opacity-60 transition-opacity">
                    Back to Directory
                </Link>
            </div>
        );
    }

    const honors = member.honors || ["Class of 2014", member.role];

    if (isPending) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-charcoal dark:text-white px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-8">
                    <Shield className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <h2 className="font-serif text-4xl italic mb-4">Membership Pending Approval</h2>
                <p className="max-w-md text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-8">
                    Your profile has been created successfully, {member.name}. An administrator will review your application soon. Once approved, you'll be visible in the community directory.
                </p>
                <Link to="/" className="text-sm uppercase tracking-widest border-b border-current pb-1 hover:opacity-60 transition-opacity">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
                <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center">
                    {/* Header: Profile Info */}
                    <div className="flex flex-col items-center text-center mb-16 px-4">
                        {/* 1. Portrait */}
                        <div className="relative size-48 md:size-64 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 ease-out shadow-xl mb-8 bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
                            {member.imageUrl ? (
                                <img
                                    alt={`Portrait of ${member.name}`}
                                    className="w-full h-full object-cover"
                                    src={member.imageUrl}
                                />
                            ) : (
                                <span className="text-6xl font-display text-gold opacity-40 select-none">
                                    {member.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        {/* 2. Name */}
                        <h1 className="text-text-main dark:text-white text-5xl md:text-6xl font-medium leading-[0.9] tracking-tighter mb-4 italic font-newsreader">
                            {member.name}
                        </h1>

                        {/* 3. Honors/Role */}
                        <div className="flex flex-wrap justify-center items-center gap-3 text-text-muted dark:text-gray-400 text-xs font-sans font-medium uppercase tracking-[0.2em] mb-8">
                            {honors.map((honor, index) => (
                                <span key={index} className="flex items-center gap-3">
                                    {honor}
                                    {index < honors.length - 1 && (
                                        <span className="w-1 h-1 bg-current rounded-full opacity-40"></span>
                                    )}
                                </span>
                            ))}
                        </div>

                        {/* 4. Bio/Description */}
                        <div className="max-w-2xl prose prose-sm dark:prose-invert mb-8 text-center">
                            {member.bioIntro && (
                                <p className="text-lg text-slate-900 dark:text-slate-200 font-newsreader font-normal leading-tight mb-4">
                                    {member.bioIntro}
                                </p>
                            )}
                            <p className="text-base text-slate-600 dark:text-slate-400 font-newsreader leading-relaxed">
                                {member.bio || member.quote}
                            </p>
                        </div>

                        {/* Social Actions */}
                        <div className="flex gap-6">
                            <button aria-label="Email" className="text-slate-400 hover:text-[#C5A059] transition-colors duration-300">
                                <Mail className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                            <button aria-label="Share" className="text-slate-400 hover:text-[#C5A059] transition-colors duration-300">
                                <Share className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                            <button aria-label="Bookmark" className="text-slate-400 hover:text-[#C5A059] transition-colors duration-300">
                                <Bookmark className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    {/* Content: Narratives or Empty State */}
                    <div className="w-full">
                        {narratives.length > 0 ? (
                            <section className="w-full">
                                <div className="flex items-baseline justify-between mb-12 border-b border-black text-black pb-4 dark:border-white dark:text-white">
                                    <h3 className="text-3xl md:text-4xl font-newsreader font-light italic">Narratives</h3>
                                    <span className="text-xs font-sans uppercase tracking-widest">Index of Stories</span>
                                </div>
                                <div className="flex flex-col gap-0">
                                    {narratives.map((story, index) => (
                                        <article
                                            key={story.id}
                                            onClick={() => navigate(`/narratives/${story.id}`)}
                                            className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 py-8 border-b border-slate-200 dark:border-slate-800 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-500 cursor-pointer"
                                        >
                                            <div className="md:col-span-2 flex flex-col justify-start pt-1">
                                                <span className="text-3xl font-newsreader font-light text-slate-300 group-hover:text-[#C5A059]/60 transition-colors duration-300 ml-2">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 mt-2">
                                                    {story.date}
                                                </span>
                                            </div>
                                            <div className="md:col-span-10 flex flex-col gap-3">
                                                <h4 className="text-2xl md:text-3xl font-newsreader font-medium text-slate-900 dark:text-white leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-slate-300">
                                                    {story.title}
                                                </h4>
                                                <div
                                                    className="text-base text-slate-500 dark:text-slate-400 font-newsreader leading-relaxed line-clamp-2 max-w-2xl"
                                                    dangerouslySetInnerHTML={{ __html: story.excerpt }}
                                                />
                                                <Link
                                                    to={`/narratives/${story.id}`}
                                                    className="mt-2 flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 group-hover:text-[#C5A059]"
                                                >
                                                    Read Story <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                <div className="mt-16 text-center">
                                    <Link
                                        to="/timeline"
                                        className="inline-block border-b border-black dark:border-white pb-1 text-sm font-sans font-bold uppercase tracking-[0.15em] hover:text-[#C5A059] hover:border-[#C5A059] transition-all duration-300"
                                    >
                                        View Full Archive
                                    </Link>
                                </div>
                            </section>
                        ) : (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4">
                                <div className="w-24 h-px bg-stone-200 dark:bg-stone-800 mb-8"></div>
                                <p className="font-newsreader text-2xl italic text-stone-400 dark:text-stone-500 mb-4">
                                    This chapter of the legacy is yet to be written.
                                </p>
                                <p className="font-sans text-[10px] uppercase tracking-widest text-stone-400 opacity-60 max-w-xs leading-relaxed">
                                    No narratives have been published by this member at this time.
                                </p>
                                <div className="w-12 h-px bg-stone-100 dark:bg-stone-900 mt-8"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </PageTransition >
    );
}
