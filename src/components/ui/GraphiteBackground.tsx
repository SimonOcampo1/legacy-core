import React from "react";
import { cn } from "../../lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface GraphiteBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: React.ReactNode;
}

export const GraphiteBackground = ({
    className,
    children,
    ...props
}: GraphiteBackgroundProps) => {
    // Mouse Interaction Hooks
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const targetX = (clientX / window.innerWidth) * 2 - 1; // -1 to 1
        const targetY = (clientY / window.innerHeight) * 2 - 1; // -1 to 1
        mouseX.set(targetX);
        mouseY.set(targetY);
    };

    const springConfig = { damping: 50, stiffness: 400 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    // Parallax Transforms
    const moveLayer1X = useTransform(x, [-1, 1], [-20, 20]);
    const moveLayer1Y = useTransform(y, [-1, 1], [-20, 20]);

    const moveLayer2X = useTransform(x, [-1, 1], [30, -30]);
    const moveLayer2Y = useTransform(y, [-1, 1], [30, -30]);

    const moveLayer3X = useTransform(x, [-1, 1], [-10, 10]);
    const moveLayer3Y = useTransform(y, [-1, 1], [-10, 10]);

    return (
        <main
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-[#F5F5F3] dark:bg-[#0a0a0a] text-charcoal dark:text-white transition-colors duration-500 overflow-hidden",
                className
            )}
            onMouseMove={handleMouseMove}
            {...props}
        >
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                {/* 
                   Dynamic Abstract Forms:
                   Large sweeping architectural curves that morph slowly.
                   Palette: 
                   - Dark: Deep charcoal/black (#0a0a0a, #1a1a1a) + Gold accents.
                   - Light: Soft Stone/Greys (#F5F5F3, #E5E5E0) + Charcoal accents.
                */}

                {/* Layer 1: Base Flow (Slow Morph) */}
                <motion.div
                    style={{ x: moveLayer1X, y: moveLayer1Y }}
                    className="absolute -bottom-[20%] -left-[10%] w-[140%] h-[140%] opacity-90"
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <motion.path
                            d="M0 100 C 40 50 60 50 100 0 V 100 H 0"
                            animate={{
                                d: [
                                    "M0 100 C 40 50 60 50 100 0 V 100 H 0",
                                    "M0 100 C 30 60 70 40 100 0 V 100 H 0",
                                    "M0 100 C 40 50 60 50 100 0 V 100 H 0",
                                ],
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                            className="fill-[#EBEBE8] dark:fill-[#141414] transition-colors duration-500"
                        />
                    </svg>
                </motion.div>

                {/* Layer 2: Main Ridge (Counter-Movement) */}
                <motion.div
                    style={{ x: moveLayer2X, y: moveLayer2Y }}
                    className="absolute -top-[10%] -right-[15%] w-[130%] h-[150%] opacity-80"
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <motion.path
                            d="M100 0 C 30 20 20 80 50 100 L 100 100 V 0"
                            animate={{
                                d: [
                                    "M100 0 C 30 20 20 80 50 100 L 100 100 V 0",
                                    "M100 0 C 40 30 10 70 60 100 L 100 100 V 0",
                                    "M100 0 C 30 20 20 80 50 100 L 100 100 V 0",
                                ],
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                            className="fill-[#8c8c8c] dark:fill-[#1F1F1F] transition-colors duration-500 mix-blend-multiply dark:mix-blend-normal opacity-40 dark:opacity-100"
                        />
                    </svg>
                </motion.div>

                {/* Layer 3: Central Accent Curve (Intersects) */}
                <motion.div
                    style={{ x: moveLayer3X, y: moveLayer3Y }}
                    className="absolute top-[20%] left-[-10%] w-[120%] h-[120%] opacity-90 z-10"
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <motion.path
                            d="M0 20 C 50 20 50 80 100 80 V 100 H 0 V 20"
                            animate={{
                                d: [
                                    "M0 20 C 50 20 50 80 100 80 V 100 H 0 V 20",
                                    "M0 30 C 40 30 60 70 100 70 V 100 H 0 V 30",
                                    "M0 20 C 50 20 50 80 100 80 V 100 H 0 V 20",
                                ],
                            }}
                            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                            className="fill-[#D6D6D3] dark:fill-[#0F0F0F] transition-colors duration-500"
                        />
                        {/* Gold Edge Highlight for Premium Feel */}
                        <motion.path
                            d="M0 20 C 50 20 50 80 100 80"
                            fill="none"
                            stroke="var(--accent-color)"
                            strokeWidth="0.3"
                            animate={{
                                d: [
                                    "M0 20 C 50 20 50 80 100 80",
                                    "M0 30 C 40 30 60 70 100 70",
                                    "M0 20 C 50 20 50 80 100 80",
                                ],
                            }}
                            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                            className="opacity-60 dark:opacity-40"
                        />
                    </svg>
                </motion.div>

                {/* Noise Texture - Optimized: Removed heavy SVG filter, using simple opacity grain or letting CSS handle if needed later. 
            For now, disabling the filter is the single biggest performance win. 
            If texture is needed, use a static PNG pattern instead of active calculation. */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-20 pointer-events-none bg-noise"></div>
            </div>
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F5F5F3] via-transparent to-[#F5F5F3] dark:from-[#0a0a0a] dark:via-transparent dark:to-[#0a0a0a] opacity-60 pointer-events-none" />

            {/* Content */}
            <div className="relative z-30 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </main>
    );
};
