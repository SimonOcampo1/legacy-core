import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import type { Narrative } from "../types";
import { NarrativeCard } from "../components/narratives/NarrativeCard";
import { Loader2, BookOpen } from "lucide-react";
import { PageTransition } from "../components/PageTransition";

export const MOCK_NARRATIVES: Narrative[] = [
    {
        $id: "mock1",
        $collectionId: "narratives",
        $databaseId: "legacy_core",
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        title: "The Midnight Library Session",
        content: "It was a stormy night in the university library. We were all studying for finals, but the power went out. Instead of panicking, we lit candles and told stories until dawn...",
        author: "Eleanor Rigby",
        author_id: "eleanor-rigby",
        status: "published",
        $sequence: 0,
        date_event: "2023-11-15T20:00:00.000Z",
        cover_image_id: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1200&auto=format&fit=crop"
    },
    {
        $id: "mock2",
        $collectionId: "narratives",
        $databaseId: "legacy_core",
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        title: "The Great Cafeteria Heist",
        content: "We never thought we'd pull it off. The plan was simple: get the last slice of pizza before the football team arrived. It required precision, timing, and a lot of luck...",
        author: "Marcus Chen",
        author_id: "marcus-chen",
        status: "published",
        $sequence: 0,
        date_event: "2022-05-10T12:30:00.000Z",
        cover_image_id: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"
    }
];

export function SharedNarratives() {
    const [narratives, setNarratives] = useState<Narrative[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNarratives = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    [
                        Query.equal('status', 'published'),
                        Query.orderDesc('date_event')
                    ]
                );

                if (response.documents.length > 0) {
                    setNarratives(response.documents as unknown as Narrative[]);
                } else {
                    setNarratives(MOCK_NARRATIVES);
                }
            } catch (error) {
                console.error("Error fetching narratives:", error);
                setNarratives(MOCK_NARRATIVES);
            } finally {
                setLoading(false);
            }
        };

        fetchNarratives();
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-warm-white dark:bg-background-dark pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    <header className="mb-24 text-center">
                        <div className="flex items-center justify-center gap-3 mb-6 text-[#C5A059]">
                            <BookOpen size={24} />
                            <span className="font-sans text-xs font-bold uppercase tracking-[0.3em]">The Archive</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-charcoal dark:text-stone-100 mb-8">
                            Shared Narratives
                        </h1>
                        <p className="font-serif italic text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
                            A curated collection of memories, experiences, and moments that defined our journey together.
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
                            <p className="font-sans text-xs font-bold uppercase tracking-widest text-stone-400">Loading memories...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12">
                            {narratives.map((narrative) => (
                                <NarrativeCard key={narrative.$id} narrative={narrative} />
                            ))}

                            {narratives.length === 0 && (
                                <div className="text-center py-32 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                                    <p className="font-serif italic text-xl text-stone-400">The archive is waiting for its first story.</p>
                                    <Link
                                        to="/timeline"
                                        className="mt-6 inline-block text-[#C5A059] hover:underline font-sans text-xs font-bold uppercase tracking-widest"
                                    >
                                        Explore the Timeline
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
