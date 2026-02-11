import { useParams, Link } from "react-router-dom";
import { Mail, Share, Bookmark, ArrowRight } from "lucide-react";
import { members } from "../data/members";
import { PageTransition } from "../components/PageTransition";

export function Profile() {
    const { id } = useParams<{ id: string }>();
    const member = members.find((m) => m.id === id);

    if (!member) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <h2 className="font-serif text-4xl mb-4">Member Not Found</h2>
                <Link to="/directory" className="text-sm uppercase tracking-widest border-b border-current pb-1 hover:opacity-60 transition-opacity">
                    Back to Directory
                </Link>
            </div>
        );
    }

    // Fallback data if fields are missing
    const narratives = member.narratives || [];
    const honors = member.honors || ["Class of 2014", member.role];

    return (
        <PageTransition>
            <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
                <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                        {/* LEFT COLUMN: Profile Info (Sticky) */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit flex flex-col items-center lg:items-start text-center lg:text-left">
                            {/* 1. Portrait */}
                            <div className="relative size-48 md:size-64 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 ease-out shadow-xl mb-8">
                                <img
                                    alt={`Portrait of ${member.name}`}
                                    className="w-full h-full object-cover"
                                    src={member.imageUrl}
                                />
                            </div>

                            {/* 2. Name */}
                            <h1 className="text-text-main dark:text-white text-5xl md:text-6xl font-medium leading-[0.9] tracking-tighter mb-4 italic font-newsreader">
                                {member.name}
                            </h1>

                            {/* 3. Honors/Role */}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-text-muted dark:text-gray-400 text-xs font-sans font-medium uppercase tracking-[0.2em] mb-8">
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
                            <div className="prose prose-sm dark:prose-invert mb-8 max-w-sm">
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
                        </aside>

                        {/* RIGHT COLUMN: Narratives (Main Content) */}
                        <main className="lg:col-span-8 w-full">
                            {narratives.length > 0 ? (
                                <section className="w-full">
                                    <div className="flex items-baseline justify-between mb-12 border-b border-black text-black pb-4 dark:border-white dark:text-white">
                                        <h3 className="text-3xl md:text-4xl font-newsreader font-light italic">Narratives</h3>
                                        <span className="text-xs font-sans uppercase tracking-widest">Index of Stories</span>
                                    </div>
                                    <div className="flex flex-col gap-0">
                                        {narratives.map((story) => (
                                            <article
                                                key={story.id}
                                                className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 py-8 border-b border-slate-200 dark:border-slate-800 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-500 cursor-pointer"
                                            >
                                                <div className="md:col-span-2 flex flex-col justify-start pt-1">
                                                    <span className="text-3xl font-newsreader font-light text-slate-300 group-hover:text-[#C5A059]/60 transition-colors duration-300 ml-2">
                                                        {story.id}
                                                    </span>
                                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 mt-2">
                                                        {story.date}
                                                    </span>
                                                </div>
                                                <div className="md:col-span-10 flex flex-col gap-3">
                                                    <h4 className="text-2xl md:text-3xl font-newsreader font-medium text-slate-900 dark:text-white leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-slate-300">
                                                        {story.title}
                                                    </h4>
                                                    <p className="text-base text-slate-500 dark:text-slate-400 font-newsreader leading-relaxed line-clamp-2 max-w-2xl">
                                                        {story.excerpt}
                                                    </p>
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
                                    <div className="mt-16 text-center lg:text-left">
                                        <Link
                                            to="/timeline"
                                            className="inline-block border-b border-black dark:border-white pb-1 text-sm font-sans font-bold uppercase tracking-[0.15em] hover:text-[#C5A059] hover:border-[#C5A059] transition-all duration-300"
                                        >
                                            View Full Archive
                                        </Link>
                                    </div>
                                </section>
                            ) : (
                                <div className="h-full flex items-center justify-center opacity-40 italic font-serif">
                                    No narratives available.
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </PageTransition >
    );
}
