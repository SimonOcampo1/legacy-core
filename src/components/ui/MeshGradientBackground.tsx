import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface MeshGradientBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: ReactNode;
    showRadialGradient?: boolean;
}

export const MeshGradientBackground = ({
    className,
    children,
    showRadialGradient = true,
    ...props
}: MeshGradientBackgroundProps) => {
    return (
        <main
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Mesh Gradient Container */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Orb 1: Purple/Indigo */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-400/30 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob"></div>

                {/* Orb 2: Teal/Cyan */}
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-teal-400/30 dark:bg-teal-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>

                {/* Orb 3: Blue/Indigo */}
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-indigo-400/30 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>

                {/* Orb 4: Subtle Amber/Pink (Accent) */}
                <div className="absolute bottom-[-10%] right-[-20%] w-[40vw] h-[40vw] bg-pink-300/30 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-blob animation-delay-6000"></div>
            </div>

            {/* Noise Texture Overlay for "High-Tech/Organic" feel */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07] pointer-events-none z-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Radial Gradient to focus center */}
            {showRadialGradient && (
                <div className="absolute inset-0 bg-zinc-50/10 dark:bg-zinc-950/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0"></div>
            )}

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </main>
    );
};
