import { useEffect, useState } from "react";
import { databases, storage, DATABASE_ID, PROFILES_COLLECTION_ID } from "../lib/appwrite";
import { Users } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { Query } from "appwrite";
import { PageTransition } from "../components/PageTransition";
import type { Member } from "../types";
import { Link } from "react-router-dom";
import { useGroup } from "../context/GroupContext";

export function Directory() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const BUCKET_ID = "legacy_core_assets";
    const { currentGroup } = useGroup();

    useEffect(() => {
        const fetchMembers = async () => {
            if (!currentGroup?.$id) return;
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    PROFILES_COLLECTION_ID,
                    [
                        Query.limit(100),
                        Query.equal("is_authorized", true),
                        Query.equal("group_id", currentGroup.$id)
                    ]
                );

                const mappedMembers = response.documents.map((doc: any) => {
                    let imageUrl = "https://placehold.co/400x400/png?text=Profile";
                    if (doc.avatar_id) {
                        if (doc.avatar_id.startsWith("http")) {
                            imageUrl = doc.avatar_id;
                        } else {
                            try {
                                imageUrl = storage.getFileView(BUCKET_ID, doc.avatar_id).toString();
                            } catch (e) {
                                console.error("Error getting image view:", e);
                            }
                        }
                    }

                    const socials = {
                        email: doc.has_email,
                        linkedin: doc.has_linkedin,
                        twitter: false
                    };

                    return {
                        id: doc.$id,
                        name: doc.name,
                        role: doc.role,
                        quote: doc.quote,
                        imageUrl: imageUrl,
                        bio: doc.bio,
                        bioIntro: doc.bioIntro,
                        honors: doc.honors || [],
                        socials: socials,
                    } as Member;
                });

                setMembers(mappedMembers);
            } catch (error) {
                console.error("Failed to fetch members:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [currentGroup]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-white dark:bg-[#09090b] pt-12">
                {/* Header */}
                <div className="border-b-2 border-black dark:border-white/20 px-4 md:px-8 pb-8 pt-12">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                        Member<span className="text-gold">_Directory</span>
                    </h1>
                    <p className="font-mono text-xs md:text-sm text-gray-500 max-w-xl">
                        /// CLASSIFIED PERSONNEL INDEX<br />
                        ACCESSING SECURE RECORDS...
                    </p>
                </div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center font-mono text-sm animate-pulse">
                        [ LOADING_DATABASE ]
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-black dark:border-white/20">
                        {members.length === 0 ? (
                            <EmptyState
                                title="PERSONNEL_VOID"
                                message="NO PERSONNEL RECORDS FOUND."
                                icon={Users}
                                actionLabel="[ RETURN_HOME ]"
                                actionLink="/"
                                className="col-span-full min-h-[50vh] border-0"
                            />
                        ) : (
                            members.map((member) => (
                                <Link
                                    to={`/directory/${member.id}`}
                                    key={member.id}
                                    className="group relative border-r border-b border-black dark:border-white/20 bg-white dark:bg-[#09090b] aspect-[3/4] overflow-hidden hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-0"
                                >
                                    {/* Image */}
                                    <div className="w-full h-[70%] bg-gray-200 dark:bg-gray-800 relative grayscale group-hover:grayscale-0 transition-all duration-300">
                                        <img
                                            src={member.imageUrl}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col justify-between h-[30%] border-t border-black dark:border-white/20">
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight uppercase tracking-tight group-hover:text-gold transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className="font-mono text-[10px] opacity-60 mt-1 uppercase">
                                                {member.role || "MEMBER"}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="font-mono text-[10px]">ID: {member.id.substring(0, 4)}</span>
                                            <div className="w-2 h-2 bg-black dark:bg-white group-hover:bg-gold" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}

