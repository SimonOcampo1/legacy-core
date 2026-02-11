import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GridBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: ReactNode;
    showRadialGradient?: boolean;
}

export const GridBackground = ({
    className,
    children,
    showRadialGradient = true,
    ...props
}: GridBackgroundProps) => {
    return (
        <main
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0 bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            {/* Radial Gradient Mask for Depth */}
            {showRadialGradient && (
                <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0"></div>
            )}

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </main>
    );
};
