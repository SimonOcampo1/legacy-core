import { timelineEvents } from "../data/timeline";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import { PageTransition } from "../components/PageTransition";

export function Timeline() {
    return (
        <PageTransition>
            <div className="bg-background-light dark:bg-background-dark min-h-screen text-timeline-primary dark:text-slate-200">
                <div className="w-full max-w-4xl text-center mb-24 relative mx-auto pt-16 px-4">
                    <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-6 relative z-10">
                        Our <span className="text-[#C5A059] italic">Journey</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-sans font-light leading-relaxed">
                        A curated collection of moments, captured in time.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 mt-12 border-b border-line-grey dark:border-slate-800 pb-4 max-w-md mx-auto">
                        <button className="text-[#C5A059] border-b-2 border-[#C5A059] pb-4 -mb-5 text-xs uppercase tracking-widest font-medium transition-all">
                            All Time
                        </button>
                        <button className="text-slate-500 hover:text-[#C5A059] text-xs uppercase tracking-widest font-medium transition-all">
                            2024
                        </button>
                        <button className="text-slate-500 hover:text-[#C5A059] text-xs uppercase tracking-widest font-medium transition-all">
                            2023
                        </button>
                        <button className="text-slate-500 hover:text-[#C5A059] text-xs uppercase tracking-widest font-medium transition-all">
                            2022
                        </button>
                    </div>
                </div>

                <div className="w-full max-w-6xl mx-auto relative px-4 md:px-0">
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-line-grey dark:bg-slate-800 md:-translate-x-1/2 h-full z-0"></div>
                    <div className="flex flex-col gap-24 md:gap-36 pb-20">
                        {timelineEvents.map((event, index) => (
                            <motion.article
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                key={event.id}
                                className={`relative flex flex-col md:flex-row md:justify-between group`}
                            >
                                {/* Date Section - Alternates sides based on index logic in original design, but HTML was hardcoded. 
                                We will keep data on left/right consistent with the HTML snapshot for visual rhythm.
                                First item: Date Right (Content Left) ??? No, HTML shows Date Left for item 1?
                                Wait, HTML item 1: Date Div (w-1/2 justify-end) -> order-2 md:order-1. 
                                It's complex flex ordering. Let's simplify with alternating logic if possible, or sticking to one side if easier.
                                HTML Item 1: Description is order-3 (Right), Date is order-1 (Left).
                                HTML Item 2: Description is order-1 (Left), Date is order-2 (Right).
                                So it alternates.
                            */}

                                {/* Date Column */}
                                <div className={`flex md:w-1/2 mb-4 md:mb-0 w-full relative ${index % 2 === 0
                                    ? "md:justify-end md:pr-16 order-2 md:order-1 pl-12 md:pl-0" // Date Left
                                    : "md:pl-16 order-2 md:order-2 pl-12" // Date Right (Wait, date is always Order 2 in mobile? No.)
                                    // Let's force consistent mobile order: Date top, Content bottom.
                                    // Desktop: Even -> Date Left, Content Right. Odd -> Date Right, Content Left.
                                    }`}>
                                    <div className={`text-left ${index % 2 === 0 ? "md:text-right" : "md:text-left"} sticky top-32 self-start transition-opacity duration-500`}>
                                        <span className="block font-serif font-light text-4xl md:text-5xl mb-2 text-timeline-primary dark:text-white">
                                            {event.date}
                                        </span>
                                        <span className="block text-slate-500 dark:text-slate-400 font-sans font-light text-xl mb-1">
                                            {event.year}
                                        </span>
                                        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                                            {event.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Center Dot */}
                                <div className="absolute left-4 md:left-1/2 top-2 md:top-6 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 group-hover:border-[#C5A059] group-hover:scale-125 transition-all duration-500 rounded-full z-10 md:-translate-x-1/2 flex items-center justify-center order-1 shadow-sm">
                                </div>

                                {/* Content Column */}
                                <div className={`flex md:w-1/2 w-full pl-12 ${index % 2 === 0
                                    ? "md:pl-16 order-3 md:order-2" // Content Right
                                    : "md:justify-end md:pr-16 order-3 md:order-1" // Content Left
                                    }`}>
                                    <div className={`bg-background-light dark:bg-transparent rounded-sm p-8 transition-all duration-500 w-full md:text-left border-none shadow-none ring-0 ${index % 2 !== 0 ? "md:text-right" : ""}`}>
                                        {event.image && (
                                            <div className={`aspect-[4/3] w-full bg-stone-50 dark:bg-slate-800 mb-6 overflow-hidden relative group/image ${index % 2 !== 0 ? "ml-auto" : ""}`}>
                                                <img
                                                    alt={event.title}
                                                    className="w-full h-full object-cover grayscale group-hover/image:grayscale-0 transition-all duration-700 ease-in-out"
                                                    src={event.image}
                                                />
                                            </div>
                                        )}
                                        <div className={`max-w-md ${index % 2 !== 0 ? "ml-auto" : ""}`}>
                                            <h3 className="text-2xl font-serif font-normal mb-3 text-timeline-primary dark:text-white">
                                                {event.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-sans font-light text-sm leading-7 mb-6">
                                                {event.description}
                                            </p>

                                            {event.attendees && event.attendees.length > 0 && (
                                                <div className={`flex items-center gap-3 pt-4 border-t border-line-grey/30 dark:border-slate-800 ${index % 2 !== 0 ? "justify-end md:flex-row-reverse" : ""}`}>
                                                    <div className="flex -space-x-3 overflow-hidden">
                                                        {event.attendees.map((attendee, i) => (
                                                            <img
                                                                key={i}
                                                                src={attendee}
                                                                alt="Attendee"
                                                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 grayscale hover:grayscale-0 transition-all"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal font-sans">
                                                        + friends
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>

                <button
                    aria-label="Add new memory"
                    className="fixed bottom-10 right-10 z-40 bg-white dark:bg-slate-800 text-timeline-primary dark:text-white rounded-full p-4 shadow-xl border border-line-grey dark:border-slate-700 hover:bg-[#C5A059] hover:border-[#C5A059] hover:text-white transition-all duration-500 group hover:scale-110"
                >
                    <Plus className="w-6 h-6 font-light" />
                </button>
            </div>
        </PageTransition>
    );
}
