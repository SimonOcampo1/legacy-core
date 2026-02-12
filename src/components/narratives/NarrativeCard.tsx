import { storage } from "../../lib/appwrite";
import { Link, useNavigate } from "react-router-dom";
import type { Narrative } from "../../types";

interface NarrativeCardProps {
    narrative: Narrative;
}

export function NarrativeCard({ narrative }: NarrativeCardProps) {
    const navigate = useNavigate();
    const getImageUrl = () => {
        const id = narrative.cover_image_id;
        if (!id) return "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop";
        if (id.startsWith("http")) return id;
        if (id.startsWith("mock")) return "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop";
        return storage.getFileView("legacy_core_assets", id).toString();
    };

    const imageUrl = getImageUrl();

    const date = new Date(narrative.date_event || narrative.$createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article
            onClick={() => navigate(`/narratives/${narrative.$id}`)}
            className="flex flex-col gap-12 mb-32 group cursor-pointer"
        >
            <Link to={`/narratives/${narrative.$id}`} className="w-full relative cursor-pointer overflow-hidden shadow-sm block rounded-xl">
                <div className="aspect-[3/2] w-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative rounded-xl">
                    <div
                        className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out scale-100 group-hover:scale-105"
                        style={{ backgroundImage: `url("${imageUrl}")` }}
                    ></div>
                </div>
            </Link>
            <div className="flex flex-col max-w-xl mx-auto w-full text-center px-4">
                <div className="flex items-center justify-center gap-4 mb-6 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                    <span>{narrative.tags || "Memory"}</span>
                    <span className="text-xs">•</span>
                    <span>{date}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-normal leading-tight mb-8 text-charcoal dark:text-stone-100 transition-colors">
                    {narrative.title}
                </h2>

                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="flex flex-col text-center">
                        <span className="font-serif italic text-sm text-stone-500 dark:text-stone-400">
                            by <Link
                                to={`/profile/${narrative.author_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-[#C5A059] transition-colors"
                            >
                                {narrative.author || narrative.author_id || "Unknown"}
                            </Link>
                        </span>
                    </div>
                </div>

                <div
                    className="prose prose-lg prose-stone dark:prose-invert text-stone-600 dark:text-stone-300 mx-auto text-left font-serif leading-loose line-clamp-4 mb-10"
                    dangerouslySetInnerHTML={{ __html: narrative.content }}
                />

                <div className="flex justify-center">
                    <Link
                        to={`/narratives/${narrative.$id}`}
                        className="relative inline-flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-widest text-charcoal dark:text-white group/link overflow-hidden pb-1 px-4 py-2"
                    >
                        <span className="relative z-10 group-hover/link:text-[#C5A059] transition-colors duration-300">Read Story</span>
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-charcoal dark:bg-white origin-left transform scale-x-0 transition-transform duration-300 ease-out group-hover/link:scale-x-100 group-hover/link:bg-[#C5A059]" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
