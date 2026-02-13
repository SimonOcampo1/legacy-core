import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import type { Narrative } from "../types";
import { PageTransition } from "../components/PageTransition";
import { ArrowRight } from "lucide-react";

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
        description: "A recounting of the infamous blackout during finals week.",
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
        description: "Operation Extra Cheese: The strategic acquisition of resources.",
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
    const navigate = useNavigate();

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
            <div className="min-h-screen bg-white dark:bg-[#09090b] pt-12">
                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                            Archive<span className="text-[#C5A059]">_Logs</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// SHARED_MEMORY_BANK<br />
                            ACCESSING COLLECTIVE RECORDS...
                        </p>
                    </div>
                    {/* Index Stats */}
                    <div className="font-mono text-xs text-right hidden md:block text-gray-500">
                        TOTAL_ENTRIES: {narratives.length.toString().padStart(3, '0')}<br />
                        LAST_UPDATE: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                    </div>
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                        [ DECRYPTING_ARCHIVES ]
                    </div>
                ) : (
                    <div className="divide-y divide-black dark:divide-white/20 border-b border-black dark:border-white/20">
                        {narratives.map((narrative, index) => (
                            <Link
                                to={`/narratives/${narrative.$id}`}
                                key={narrative.$id}
                                className="group block relative hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-0"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[200px]">
                                    {/* Index Column */}
                                    <div className="md:col-span-1 p-6 md:p-8 border-r border-black dark:border-white/20 font-mono text-xs text-gray-400 group-hover:text-[#C5A059]">
                                        {(index + 1).toString().padStart(3, '0')}
                                    </div>

                                    {/* Main Content */}
                                    <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-baseline gap-4 mb-2">
                                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none group-hover:text-[#C5A059]">
                                                    {narrative.title}
                                                </h2>
                                            </div>
                                            <p className="font-mono text-sm opacity-60 max-w-2xl line-clamp-2 mt-4">
                                                {narrative.description || narrative.content.substring(0, 150)}...
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-8 font-mono text-xs opacity-40 uppercase">
                                            <span>AUTH: {narrative.author || "UNKNOWN"}</span>
                                            <span>//</span>
                                            <span>DATE: {new Date(narrative.date_event || narrative.$createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="md:col-span-3 p-6 md:p-8 border-l border-black dark:border-white/20 flex flex-col justify-between items-end bg-gray-50 dark:bg-white/5 group-hover:bg-transparent transition-colors">
                                        <div className="w-full text-right">
                                            <span className="font-mono text-[10px] border border-black dark:border-white/20 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                READ_ENTRY
                                            </span>
                                        </div>
                                        <ArrowRight className="w-12 h-12 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300 group-hover:text-[#C5A059]" strokeWidth={1} />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {narratives.length === 0 && (
                            <div className="p-24 text-center font-mono text-sm text-gray-400">
                                [ SYSTEM_EMPTY: NO_RECORDS_FOUND ]
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
