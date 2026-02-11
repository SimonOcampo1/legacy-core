import { members } from "../data/members";
import { MemberCard } from "../components/MemberCard";
import { PageTransition } from "../components/PageTransition";
import { motion, type Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function Directory() {
    return (
        <PageTransition>
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="mb-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-end border-b border-slate-200 dark:border-slate-800 pb-16">
                    <div className="md:col-span-8 lg:col-span-7">
                        <span className="block text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-6 pl-1">
                            Class of 2014
                        </span>
                        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-slate-900 dark:text-white leading-[0.9] tracking-tight">
                            The<br />
                            <span className="text-[#C5A059] italic">Members.</span>
                        </h1>
                    </div>
                    <div className="md:col-span-4 lg:col-span-5 md:pb-4">
                        <p className="font-editorial text-2xl md:text-3xl italic text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                            "Rekindle old friendships and walk down memory lane. Our shared history, preserved in digital amber."
                        </p>
                        <div className="mt-8 flex gap-8 text-sm">
                            <button className="uppercase tracking-widest text-xs font-semibold border-b border-slate-300 pb-1 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer">
                                Filter by Major
                            </button>
                            <button className="uppercase tracking-widest text-xs font-semibold border-b border-slate-300 pb-1 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer">
                                Sort A-Z
                            </button>
                        </div>
                    </div>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
                >
                    {members.map((member) => (
                        <motion.div key={member.id} variants={item}>
                            <MemberCard member={member} />
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-32 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-8">
                    <a
                        href="#"
                        className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400 hover:text-[#C5A059] transition-colors"
                    >
                        Previous
                    </a>
                    <div className="font-serif italic text-slate-500">Page 1 of 8</div>
                    <a
                        href="#"
                        className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-900 dark:text-white hover:text-[#C5A059] transition-colors"
                    >
                        Next
                    </a>
                </div>
            </div>
        </PageTransition >
    );
}
