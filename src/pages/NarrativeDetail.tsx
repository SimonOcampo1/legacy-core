import { useParams, Link } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "../components/ui/TextReveal";
import { useRef, useEffect, useState } from "react";
import { databases, storage, DATABASE_ID, NARRATIVES_COLLECTION_ID, PROFILES_COLLECTION_ID } from "../lib/appwrite";
import type { Narrative, Member } from "../types";
import { ArrowRight } from "lucide-react";

import { MOCK_NARRATIVES } from "./SharedNarratives";
import { CommentsSection } from "../components/comments/CommentsSection";

export function NarrativeDetail() {
    const { id } = useParams<{ id: string }>();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const [narrative, setNarrative] = useState<Narrative | null>(null);
    const [author, setAuthor] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [headerImage, setHeaderImage] = useState<string>("");

    const BUCKET_ID = "legacy_core_assets";

    useEffect(() => {
        const fetchNarrative = async () => {
            if (!id) return;
            setLoading(true);

            // Check if it's a mock ID first
            const mockStory = MOCK_NARRATIVES.find(n => n.$id === id);
            if (mockStory) {
                setNarrative(mockStory);
                setHeaderImage("https://placehold.co/1200x800/png?text=Narrative+Header");
                setLoading(false);
                return;
            }

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
                        const img = storage.getFileView(BUCKET_ID, doc.cover_image_id);
                        setHeaderImage(img.toString());
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
                                avatarUrl = storage.getFileView(BUCKET_ID, memberDoc.avatar_id).toString();
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
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-charcoal dark:border-stone-800 dark:border-t-stone-200"></div>
            </div>
        );
    }

    if (!narrative) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-charcoal dark:text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-serif mb-4">Story not found</h2>
                    <Link to="/narratives" className="text-xs uppercase tracking-widest border-b border-current pb-1 hover:text-[#C5A059] transition-colors">Return to Archive</Link>
                </div>
            </div>
        );
    }

    const date = new Date(narrative.date_event || narrative.$createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <PageTransition>
            <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen text-charcoal dark:text-slate-100 flex flex-col antialiased">

                {/* Hero Header */}
                <header className="relative w-full h-[70vh] min-h-[500px] mb-24 md:mb-32 overflow-hidden">
                    <motion.div style={{ y: imageY }} className="absolute inset-0 bg-charcoal mask-image-hero">
                        <div
                            className="w-full h-full bg-cover bg-center opacity-90 nostalgic-filter scale-110"
                            style={{ backgroundImage: `url("${headerImage}")` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-black/30 dark:from-background-dark"></div>
                    </motion.div>

                    <div className="absolute -bottom-24 left-0 w-full pb-0 pt-32 bg-gradient-to-t from-background-light via-background-light/90 to-transparent dark:from-background-dark dark:via-background-dark/90">
                        <div className="max-w-3xl mx-auto px-6 text-center">
                            <div className="font-sans text-xs font-semibold tracking-[0.25em] text-stone-500 dark:text-stone-400 uppercase mb-6 flex justify-center">
                                <TextReveal>
                                    {`Memories • ${date}`}
                                </TextReveal>
                            </div>
                            <div className="mb-8 relative z-10 flex justify-center">
                                <TextReveal className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.15] tracking-tight text-charcoal dark:text-white italic text-center pb-8">
                                    {narrative.title}
                                </TextReveal>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm font-sans text-stone-500 dark:text-stone-400 relative z-10">
                                <span>By <Link to={`/directory/${narrative.author_id}`} className="hover:text-[#C5A059] transition-colors">{narrative.author || narrative.author_id}</Link></span>
                                <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                                <span>5 min read</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center pb-24 px-6 relative z-10 pt-12">
                    <article className="w-full max-w-2xl flex flex-col">
                        <div
                            className="font-serif text-xl md:text-2xl text-charcoal/90 dark:text-slate-200/90 leading-loose text-justify [&>p]:mb-12 first-letter:text-7xl first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:font-serif first-letter:italic first-letter:text-charcoal dark:first-letter:text-white whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: narrative.content }}
                        />


                        {/* Author Footer */}
                        <div className="mt-16 pt-12 border-t border-stone-200 dark:border-stone-800">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <Link to={`/directory/${narrative.author_id}`} className="h-24 w-24 shrink-0 rounded-full bg-stone-200 overflow-hidden ring-4 ring-white dark:ring-stone-800 shadow-md hover:scale-105 transition-transform nostalgic-filter">
                                    {author?.imageUrl ? (
                                        <img src={author.imageUrl} alt={author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-stone-300 flex items-center justify-center text-2xl font-serif text-stone-500">
                                            {(author?.name || narrative.author || narrative.author_id).charAt(0)}
                                        </div>
                                    )}
                                </Link>
                                <div className="text-center sm:text-left flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-2">
                                        <h3 className="text-xl font-serif text-charcoal dark:text-white">
                                            {author?.name || narrative.author || narrative.author_id}
                                        </h3>
                                        <span className="text-xs font-sans text-stone-400 uppercase tracking-widest">
                                            {author?.role || "Contributor"}
                                        </span>
                                    </div>
                                    <p className="text-stone-500 dark:text-stone-400 font-sans leading-relaxed italic mb-4">
                                        "{(author?.quote || author?.bioIntro || "Sharing memories that shaped our journey.")}"
                                    </p>
                                    <Link to={`/directory/${narrative.author_id}`} className="text-[#C5A059] text-xs font-bold uppercase tracking-widest hover:underline flex items-center justify-center sm:justify-start gap-2">
                                        View Profile
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>

                    <div className="w-full max-w-2xl mt-12">
                        <CommentsSection narrativeId={narrative.$id} />
                    </div>
                </main>

                {/* Stylistic Utilities */}
                <style>{`
                    .nostalgic-filter {
                        filter: grayscale(100%) contrast(105%) sepia(5%);
                        transition: filter 0.8s cubic-bezier(0.2, 0, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0, 0.2, 1);
                    }
                    .nostalgic-filter:hover {
                         filter: grayscale(0%) contrast(100%) sepia(0%);
                    }
                    .mask-image-hero {
                         mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
                         -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
                    }
                 `}</style>
            </div>
        </PageTransition >
    );
}
