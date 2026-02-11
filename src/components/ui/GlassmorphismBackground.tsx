import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface GlassmorphismBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: React.ReactNode;
}

export const GlassmorphismBackground = ({
    className,
    children,
    ...props
}: GlassmorphismBackgroundProps) => {
    return (
        <main
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-50 transition-colors duration-500 overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Orbs Container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Orb 1: Large primary orb (Top Left) */}
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-400/40 dark:bg-blue-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
                />

                {/* Orb 2: Secondary orb (Bottom Right) */}
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -60, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-400/40 dark:bg-purple-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen"
                />

                {/* Orb 3: Accent orb (Center-ish / Moving) */}
                <motion.div
                    animate={{
                        x: [0, 100, -100, 0],
                        y: [0, -50, 50, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[30%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-teal-300/30 dark:bg-teal-500/20 blur-[80px] mix-blend-multiply dark:mix-blend-screen"
                />
            </div>

            {/* Glass/Frost Effect Overlay */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/10 backdrop-blur-[80px] z-0 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </main>
    );
};
