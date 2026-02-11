
import { useParams } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { members } from "../data/members";
import { motion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "../components/ui/TextReveal";
import { useRef } from "react";

export function NarrativeDetail() {
    const { id } = useParams<{ id: string }>();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    // Find the narrative and author across all members
    let narrative: any = null;
    let author: any = null;

    for (const member of members) {
        const found = member.narratives?.find(n => n.id === id);
        if (found) {
            narrative = found;
            author = member;
            break;
        }
    }

    // Find "Next" story (simplistic: next in list or first of next member)
    // For now, we'll just hardcode or pick a random one if not efficient to calc
    // Let's just mock the next story logic for visual fidelity first
    const nextStory = {
        title: "The Graduation Road Trip",
        excerpt: "Six states, one broken radiator, and the mixtape that played on repeat for 1,200 miles. A journey into adulthood.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD16c7tai8X3a136vmVq_-rZmSdZ39cX5D_h9FKt7iyVkTAjXIUvPc0aa0wy6b2B8HH-JeN8k7asyRSw1pLlsUqX7TlK73zD1hTTrzRSZru8YG2tvKuYEq2hJoD_rFZD74ePARanzM6SFmKgC-ItsLqvPZ6_swJPv1aUjPScpJNwHwXJCQaoV121R5UsYzbfM9MD7ebdeSzC0G_fHpXk7Rwrg5dssFxXrrLIlWsqtPu2OjVALfXrANeK5FjuUjioR4YyUpB1UJm3zk",
        category: "ROAD TRIP"
    };

    if (!narrative || !author) {
        return <div className="min-h-screen flex items-center justify-center text-white">Story not found.</div>;
    }

    return (
        <PageTransition>
            <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen text-charcoal dark:text-slate-100 flex flex-col antialiased">

                {/* Custom Nav for this View */}


                {/* Hero Header */}
                <header className="relative w-full h-[70vh] min-h-[500px] mb-24 md:mb-32 overflow-hidden">
                    <motion.div style={{ y: imageY }} className="absolute inset-0 bg-charcoal mask-image-hero">
                        <img
                            alt="Atmospheric view"
                            className="w-full h-full object-cover opacity-90 nostalgic-filter scale-110"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzR5DB_Rd8cQ0vB9UaI-AYjHFrPP4JEOyp4ChVKkUYlJGncxHnTtQ9t7T-LuCzcfVDIS0DFkHUikPvVwMMocR76I163aaRGlL9kxF7R0XLj8XdIVYNPrWIajXHo_CNy5GUgC-bCcwMuQqYaCHQ64JpkciYnouimCGN0B5ZYef8cJAt9PPbY_2gqPs6-ayMvcpXD_lb7osoAyjVJ8qucBmQJE26ICkkAlBz5Mt9g5kxU0MS0swD9puJ09frJDT_Mfc9P5V7mFCSue0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-black/30 dark:from-background-dark"></div>
                    </motion.div>

                    <div className="absolute -bottom-24 left-0 w-full pb-0 pt-32 bg-gradient-to-t from-background-light via-background-light/90 to-transparent dark:from-background-dark dark:via-background-dark/90">
                        <div className="max-w-3xl mx-auto px-6 text-center">
                            <div className="font-sans text-xs font-semibold tracking-[0.25em] text-stone-500 dark:text-stone-400 uppercase mb-6 flex justify-center">
                                <TextReveal>
                                    {`Memories • ${narrative.date}`}
                                </TextReveal>
                            </div>
                            <div className="mb-8 relative z-10 flex justify-center">
                                <TextReveal className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.15] tracking-tight text-charcoal dark:text-white italic text-center pb-8">
                                    {narrative.title}
                                </TextReveal>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm font-sans text-stone-500 dark:text-stone-400 relative z-10">
                                <span>By {author.name}</span>
                                <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                                <span>5 min read</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow flex flex-col items-center pb-24 px-6 relative z-10 pt-12">
                    <article className="w-full max-w-2xl flex flex-col">
                        <div className="prose-content text-xl md:text-2xl leading-relaxed text-charcoal dark:text-slate-200 font-serif font-normal text-left mb-8">
                            <p className="first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] first-letter:font-serif first-letter:italic first-letter:text-charcoal dark:first-letter:text-white">
                                {/* First paragraph logic/styling simulated */}
                                "There is a specific kind of silence that falls over the humanities wing after hours. It's not empty; it's heavy with the whispers of a thousand lectures and the rustle of turning pages."
                            </p>
                        </div>

                        <div className="w-16 h-px bg-current opacity-20 mx-auto mb-10 text-charcoal dark:text-white"></div>

                        <div className="prose-content text-lg md:text-xl leading-relaxed text-stone-600 dark:text-stone-400 font-serif text-justify md:text-left space-y-6">
                            <p>
                                The air in the library always smelled of vanilla and old glue, a scent that still triggers a phantom deadline panic in the back of my mind whenever I walk past a used bookstore. Marcus was the one who found the loose grate behind the Philosophy section. He claimed it led straight into the restricted archives, a fabled place none of us had ever seen but everyone had theories about. Sarah thought it held the university's original charter; I was convinced it was just storage for broken chairs.
                            </p>
                            <p>
                                We met at 11:45 PM. The campus was quiet, save for the distant hum of the heating plant and the occasional late-night shuttle bus. We wore black, naturally, because movies had taught us that’s what thieves wear, even though against the beige sandstone of the library walls, we stood out like ink spills.
                            </p>
                        </div>

                        <div className="prose-content text-lg md:text-xl leading-relaxed text-stone-600 dark:text-stone-400 font-serif text-justify md:text-left mt-6">
                            <p>
                                The tunnel was tighter than Marcus had promised. I remember the scrape of my denim against the concrete and the terrifying thought that I might get stuck, immortalized as the idiot who died in a vent trying to steal a glimpse of history. But then the space opened up.
                            </p>
                            <blockquote className="border-l-2 border-stone-300 dark:border-stone-700 pl-6 my-10 italic text-2xl text-charcoal dark:text-white">
                                "We dropped down into a room that felt suspended in time. It wasn't archives. It wasn't storage. It was a reading room, perfectly preserved from the 1920s."
                            </blockquote>
                            <p>
                                Green-shaded brass lamps and mahogany tables gleamed under our flashlights. We didn't take anything. We just sat there for an hour, terrified and awestruck, passing a flask of cheap whiskey back and forth, feeling like we had discovered a secret world beneath the floorboards of our mundane reality. That night wasn't about the heist; it was about the realization that the world was deeper and stranger than the syllabus suggested.
                            </p>
                        </div>

                        {/* Author Footer */}
                        <div className="mt-16 pt-12 border-t border-stone-200 dark:border-stone-800">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="h-20 w-20 shrink-0 rounded-full bg-gray-200 overflow-hidden ring-4 ring-white dark:ring-stone-800 shadow-md">
                                    <img
                                        alt={`Profile portrait of ${author.name}`}
                                        className="w-full h-full object-cover grayscale"
                                        src={author.imageUrl}
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-serif italic text-charcoal dark:text-white mb-1">About {author.name}</h3>
                                    <p className="text-sm font-sans text-stone-500 dark:text-stone-400 leading-relaxed max-w-md">
                                        {author.bio || "Member of the Legacy Core group."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>
                </main>

                {/* Up Next Footer */}
                <footer className="w-full border-t border-stone-200 dark:border-stone-800 py-16 bg-white dark:bg-black/20">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-xs font-sans font-bold tracking-widest text-text-muted uppercase">Up Next</p>
                            <span className="h-px flex-grow bg-stone-200 dark:bg-stone-800 ml-6"></span>
                        </div>
                        <a href="#" className="group block relative overflow-hidden transition-all duration-300">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-full md:w-1/2 aspect-[4/3] relative overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-800">
                                    <img
                                        alt={nextStory.title}
                                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                        src={nextStory.image}
                                    />
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-sans font-semibold tracking-wider text-text-muted">{nextStory.category}</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-serif font-medium text-charcoal dark:text-white mb-4 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors italic">
                                        {nextStory.title}
                                    </h3>
                                    <p className="text-stone-500 dark:text-stone-400 font-serif text-lg leading-relaxed mb-6">
                                        {nextStory.excerpt}
                                    </p>
                                    <div className="flex items-center text-sm font-sans font-medium text-charcoal dark:text-white underline decoration-current underline-offset-4 opacity-70 group-hover:opacity-100 group-hover:text-[#C5A059] group-hover:decoration-[#C5A059] transition-all duration-300">
                                        Read Story
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </footer>

                {/* Stylistic Utilities specifically for this page */}
                <style>{`
                    .nostalgic-filter {
                        filter: grayscale(100%) contrast(105%) sepia(5%);
                        transition: filter 0.5s ease;
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
        </PageTransition>
    );
}
