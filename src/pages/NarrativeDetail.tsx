import { useParams, Link } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { useEffect, useState, useRef } from "react";
import { databases, storage, DATABASE_ID, NARRATIVES_COLLECTION_ID, PROFILES_COLLECTION_ID } from "../lib/appwrite";
import type { Narrative, Member } from "../types";
import { ArrowLeft, Share2 } from "lucide-react";
import { CommentsSection } from "../components/comments/CommentsSection";
import { motion, useScroll, useSpring } from "framer-motion";

export function NarrativeDetail() {
    const { id } = useParams<{ id: string }>();
    const [narrative, setNarrative] = useState<Narrative | null>(null);
    const [author, setAuthor] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [headerImage, setHeaderImage] = useState<string>("");
    const contentRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: contentRef,
        offset: ["start start", "end end"]
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const BUCKET_ID = "legacy_core_assets";

    useEffect(() => {
        const fetchNarrative = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const doc = await databases.getDocument(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    id
                );
                setNarrative(doc as unknown as Narrative);

                if (doc.cover_image_id) {
                    if (doc.cover_image_id.startsWith("http")) {
                        setHeaderImage(doc.cover_image_id);
                    } else if (!doc.cover_image_id.startsWith("mock")) {
                        try {
                            const img = storage.getFileView(BUCKET_ID, doc.cover_image_id);
                            setHeaderImage(img.toString());
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        setHeaderImage("https://images.unsplash.com/photo-1497018686234-eb1aba3c6e94?q=80&w=1200&auto=format&fit=crop");
                    }
                } else {
                    setHeaderImage("https://images.unsplash.com/photo-1497018686234-eb1aba3c6e94?q=80&w=1200&auto=format&fit=crop");
                }

                // Fetch Author Profile
                if (doc.author_id) {
                    try {
                        const memberDoc = await databases.getDocument(
                            DATABASE_ID,
                            PROFILES_COLLECTION_ID,
                            doc.author_id
                        );

                        let avatarUrl = "https://placehold.co/400x400/png?text=Profile";
                        if (memberDoc.avatar_id) {
                            if (memberDoc.avatar_id.startsWith("http")) {
                                avatarUrl = memberDoc.avatar_id;
                            } else {
                                try {
                                    avatarUrl = storage.getFileView(BUCKET_ID, memberDoc.avatar_id).toString();
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }

                        setAuthor({
                            id: memberDoc.$id,
                            name: memberDoc.name,
                            role: memberDoc.role,
                            imageUrl: avatarUrl,
                            bio: memberDoc.bio,
                            bioIntro: memberDoc.bioIntro,
                            quote: memberDoc.quote,
                        });
                    } catch (err) {
                        console.error("Failed to fetch author profile:", err);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch narrative:", error);
                setNarrative(null);
            } finally {
                setLoading(false);
            }
        };

        fetchNarrative();
    }, [id]);



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
                <div className="font-mono text-sm animate-pulse">[ DECRYPTING_LOG_FILE ]</div>
            </div>
        );
    }

    if (!narrative) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#09090b] font-mono">
                <h2 className="text-xl mb-4 uppercase">[ ERROR: FILE_CORRUPTED_OR_MISSING ]</h2>
                <Link to="/narratives" className="text-xs uppercase border-b border-black dark:border-white hover:text-gold hover:border-gold">
                    Return to Archives
                </Link>
            </div>
        );
    }

    const date = new Date(narrative.date_event || narrative.$createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return (
        <PageTransition>
            <div className="bg-white dark:bg-[#09090b] min-h-screen font-sans">
                {/* Progress Bar Top */}
                <div className="fixed top-0 left-0 w-full h-1 bg-black/10 dark:bg-white/10 z-50">
                    <motion.div
                        className="h-full bg-gold origin-left"
                        style={{ scaleX }}
                    />
                </div>

                <article className="max-w-[1920px] mx-auto">
                    {/* Header Region */}
                    <header className="grid grid-cols-1 lg:grid-cols-12 min-h-[50vh] border-b-2 border-black dark:border-white/20">
                        {/* Meta Data Sidebar */}
                        <div className="lg:col-span-3 border-r border-black dark:border-white/20 bg-gray-100 dark:bg-white/5 p-8 flex flex-col justify-between">
                            <div className="font-mono text-xs space-y-4 text-gray-500">
                                <div>
                                    <span className="block opacity-50">LOG_ID</span>
                                    <span className="text-black dark:text-white uppercase">{narrative.$id.substring(0, 8)}</span>
                                </div>
                                <div>
                                    <span className="block opacity-50">DATE_RECORDED</span>
                                    <span className="text-black dark:text-white">{date}</span>
                                </div>
                                <div>
                                    <span className="block opacity-50">AUTHORIZATION</span>
                                    <span className="text-black dark:text-white uppercase">{author?.name || "REDACTED"}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 hidden lg:block">
                                <Link to="/narratives" className="flex items-center gap-2 font-mono text-xs uppercase hover:text-gold transition-colors group">
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    [ RETURN_TO_INDEX ]
                                </Link>
                            </div>

                            <div className="mt-12 lg:mt-0">
                                <Link to={`/directory/${narrative.author_id}`} className="group flex items-center gap-4">
                                    <div className="w-12 h-12 border border-black dark:border-white grayscale group-hover:grayscale-0 transition-all">
                                        {author?.imageUrl ? (
                                            <img src={author.imageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm uppercase leading-none group-hover:text-gold transition-colors">
                                            {author?.name || narrative.author}
                                        </p>
                                        <p className="font-mono text-[10px] text-gray-500">VIEW_PROFILE ↗</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Title & Hero */}
                        <div className="lg:col-span-9 relative">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={headerImage}
                                    alt="Header"
                                    className="w-full h-full object-cover opacity-20 dark:opacity-30 grayscale contrast-125"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent" />
                            </div>

                            <div className="relative z-10 p-8 lg:p-16 h-full flex flex-col justify-end">
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                                    {narrative.title}
                                </h1>
                                <p className="text-xl md:text-2xl font-medium max-w-3xl leading-tight border-l-4 border-gold pl-6 py-2">
                                    {narrative.description}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Content Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Main Text */}
                        <div className="lg:col-span-8 lg:col-start-4 p-8 lg:p-16 border-l border-black dark:border-white/20">
                            <div
                                ref={contentRef}
                                className="prose prose-xl dark:prose-invert max-w-none font-serif leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:uppercase first-letter:float-left first-letter:mr-4 first-letter:mt-[-10px] text-justify"
                                dangerouslySetInnerHTML={{ __html: narrative.content }}
                            />

                            {/* Footer Actions */}
                            <div className="mt-20 pt-8 border-t border-black dark:border-white/20 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 font-mono text-xs uppercase hover:text-gold transition-colors border border-black dark:border-white/20 px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                                        <Share2 className="w-4 h-4" />
                                        Share_Log
                                    </button>
                                </div>
                                <span className="font-mono text-xs text-gray-500">END_OF_RECORD</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <section className="border-t-2 border-black dark:border-white/20 bg-gray-50 dark:bg-white/5 p-8 lg:p-16">
                        <div className="max-w-4xl mx-auto">
                            <CommentsSection narrativeId={narrative.$id} />
                        </div>
                    </section>
                </article>
            </div>
        </PageTransition>
    );
}
