import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { databases, DATABASE_ID, NARRATIVES_COLLECTION_ID } from "../lib/appwrite";
import { Query } from "appwrite";
import type { Narrative } from "../types";
import { PageTransition } from "../components/PageTransition";
import { ArrowRight, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useScrollLock } from "../hooks/useScrollLock";
import { AnimatePresence, motion } from "framer-motion";
import { NarrativeEditor } from "../components/admin/NarrativeEditor";

export const MOCK_NARRATIVES: Narrative[] = [
    {
        $id: "1",
        title: "The Genesis of Core",
        content: "Initial system architecture documentation...",
        author: "SYSTEM",
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        status: "published",
        likes: 0
    },
    {
        $id: "2",
        title: "Protocol Alpha",
        content: "First successful data transmission...",
        author: "ADMIN",
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        status: "published",
        likes: 0
    }
];

export function SharedNarratives() {
    const [narratives, setNarratives] = useState<Narrative[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useScrollLock(isModalOpen);
    const { isAdmin, isAuthorized, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNarratives = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    NARRATIVES_COLLECTION_ID,
                    [
                        Query.equal("status", "published"),
                        Query.orderDesc("$createdAt")
                    ]
                );

                const dbNarratives = response.documents.map((doc: any) => ({
                    $id: doc.$id,
                    title: doc.title,
                    content: doc.content,
                    author: doc.author_id || "UNKNOWN",
                    $createdAt: doc.$createdAt,
                    $updatedAt: doc.$updatedAt,
                    status: doc.status,
                    likes: doc.likes,
                    coverImage: doc.cover_image_id,
                    date_event: doc.date_event,
                    category: doc.category,
                    description: doc.description
                })) as Narrative[];

                setNarratives([...dbNarratives, ...MOCK_NARRATIVES]);
            } catch (error) {
                console.error("Failed to fetch narratives:", error);
                setNarratives(MOCK_NARRATIVES);
            } finally {
                setLoading(false);
            }
        };

        fetchNarratives();
    }, []);

    const handleAppend = () => {
        setIsModalOpen(true);
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-[#09090b] pt-12">
                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2">
                            Shared<span className="text-[#C5A059]">_Narratives</span>
                        </h1>
                        <p className="font-mono text-xs md:text-sm text-gray-500">
                            /// COLLECTIVE MEMORY BANK<br />
                            ACCESSING COLLECTIVE RECORDS...
                        </p>
                    </div>

                    {/* Append Button */}
                    {isAuthorized && (
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={handleAppend}
                                className="bg-black text-white dark:bg-white dark:text-black font-mono text-xs px-6 py-3 hover:bg-[#C5A059] hover:text-black transition-colors uppercase font-bold"
                            >
                                [ + APPEND_ENTRY ]
                            </button>
                            {/* Index Stats */}
                            <div className="font-mono text-xs text-right hidden md:block text-gray-500">
                                TOTAL_ENTRIES: {narratives.length.toString().padStart(3, '0')}<br />
                                LAST_UPDATE: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                        [ DECRYPTING_ARCHIVES ]
                    </div>
                ) : (
                    <div className="divide-y divide-black/10 dark:divide-white/10">
                        {narratives.map((narrative, index) => (
                            <Link
                                to={`/narratives/${narrative.$id}`}
                                key={narrative.$id}
                                className="group block hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[200px]">
                                    {/* Index Column */}
                                    <div className="md:col-span-1 p-6 md:p-8 border-l border-black dark:border-white/20 font-mono text-xs opacity-40">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>

                                    {/* Content Column */}
                                    <div className="md:col-span-8 p-6 md:p-8 border-l border-black dark:border-white/20 flex flex-col justify-between">
                                        <div>
                                            {narrative.category && (
                                                <span className="inline-block border border-black dark:border-white px-2 py-1 font-mono text-[10px] uppercase mb-4">
                                                    {narrative.category}
                                                </span>
                                            )}
                                            <div className="flex items-baseline gap-4">
                                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter group-hover:text-[#C5A059] transition-colors line-clamp-2">
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

                {/* Modal for Member Logs */}
                <AnimatePresence>
                    {isModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
                            >
                                <div data-lenis-prevent className="bg-white dark:bg-[#09090b] w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black dark:border-white shadow-2xl pointer-events-auto">
                                    <div className="p-4 border-b border-black dark:border-white flex justify-between items-center bg-gray-50 dark:bg-white/5">
                                        <h2 className="font-black text-xl uppercase tracking-tighter">NEW_LOG_ENTRY</h2>
                                        <button onClick={() => setIsModalOpen(false)}>
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <NarrativeEditor memberId={user?.$id} onSuccess={() => setIsModalOpen(false)} />
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
