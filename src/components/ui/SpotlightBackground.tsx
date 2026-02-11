import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SpotlightBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: ReactNode;
    spotlightParams?: {
        size?: string;
        color?: string;
    };
    showRadialGradient?: boolean;
}

export const SpotlightBackground = ({
    className,
    children,
    spotlightParams,
    showRadialGradient = true,
    ...props
}: SpotlightBackgroundProps) => {
    return (
        <main
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Ambient Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Spotlight 1: Main Beam */}
            {/* Light Mode: Warm/Subtle Indigo, Dark Mode: White/Cool */}
            <div
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] rounded-full blur-[100px] md:blur-[120px] opacity-60 dark:opacity-40 z-0 animate-spotlight-pulse"
                style={{
                    // Use CSS variables or conditional classes for dynamic color injection based on theme is hard in inline styles if theme is just a class.
                    // We rely on Tailwind classes for the generic color, but spotlightParams might override.
                    // Let's use a class approach for the default, and style for override.
                }}
            >
                {/* We use an inner div or just apply classes. Since style prop handles color override, we need to be careful. */
                    /* Better approach for theme support: separate style for light/dark if no override provided. */
                }
                <div className={cn(
                    "w-full h-full rounded-full",
                    // Light mode: Subtle Indigo/Purple gradient feel
                    "bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)]",
                    // Dark mode: White/Cool
                    "dark:bg-white"
                )} style={{ backgroundColor: spotlightParams?.color }}></div>
            </div>

            {/* Spotlight 2: Secondary Ambient Glow (Bottom Right) */}
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[80px] md:blur-[100px] opacity-30 dark:opacity-20 z-0"
            >
                <div className={cn(
                    "w-full h-full rounded-full",
                    // Light mode: Warm Amber hint
                    "bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)]",
                    // Dark mode: White
                    "dark:bg-[rgba(255,255,255,0.3)]"
                )}></div>
            </div>

            {/* Spotlight 3: Subtle Left Fill */}
            <div
                className="absolute top-[20%] left-[-10%] w-[30vw] h-[30vw] rounded-full blur-[60px] md:blur-[80px] opacity-20 dark:opacity-10 z-0"
            >
                <div className={cn(
                    "w-full h-full rounded-full",
                    // Light mode: Blue hint
                    "bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)]",
                    // Dark mode: White
                    "dark:bg-[rgba(255,255,255,0.2)]"
                )}></div>
            </div>


            {showRadialGradient && (
                <div className="absolute inset-0 bg-zinc-50/20 dark:bg-zinc-950/20 z-0 pointer-events-none"></div>
            )}

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>

            <style>{`
                @keyframes spotlight-pulse {
                    0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
                    50% { opacity: 0.6; transform: translateX(-50%) scale(1.1); }
                }
                .animate-spotlight-pulse {
                    animation: spotlight-pulse 8s ease-in-out infinite;
                    /* Ensure translate is applied from keyframes */
                    transform-origin: center top; 
                }
            `}</style>
        </main>
    );
};
