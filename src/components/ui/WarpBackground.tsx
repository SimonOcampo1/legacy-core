import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface WarpBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: React.ReactNode;
    starCount?: number;
    starColor?: string;
    speed?: number; // Lower is slower
}

export const WarpBackground = ({
    className,
    children,
    starCount = 200,
    starColor,
    speed = 0.5,
    ...props
}: WarpBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [themeColor, setThemeColor] = useState<string>("rgb(255, 255, 255)"); // Default white for dark mode

    useEffect(() => {
        // Theme detection
        const updateThemeColor = () => {
            const isDark = document.documentElement.classList.contains("dark");
            // Dark mode: White/Gold stars. Light mode: Dark gray/Charcoal stars.
            setThemeColor(isDark ? "rgb(255, 255, 255)" : "rgb(50, 50, 50)");
        };

        updateThemeColor();
        const observer = new MutationObserver(updateThemeColor);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: { x: number; y: number; z: number; o: number }[] = [];

        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            initStars();
        };

        const initStars = () => {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width, // Depth
                    o: Math.random(), // Opacity base
                });
            }
        };

        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.fillStyle = starColor || themeColor;

            stars.forEach((star) => {
                // Move star towards viewer (decrease Z)
                star.z -= speed;

                // Reset if it passes the viewer
                if (star.z <= 0) {
                    star.z = canvas.width;
                    star.x = Math.random() * canvas.width - canvas.width / 2;
                    star.y = Math.random() * canvas.height - canvas.height / 2;
                }

                // Project 3D position to 2D
                const k = 128.0 / star.z; // Perspective factor
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
                    const size = (1 - star.z / canvas.width) * 3; // Closer stars are bigger
                    const opacity = (1 - star.z / canvas.width); // Closer stars are brighter

                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(px, py, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(drawStars);
        };

        resizeCanvas();
        drawStars();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [starCount, starColor, speed, themeColor]);

    return (
        <main
            ref={containerRef}
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-hidden",
                className
            )}
            {...props}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 h-full w-full opacity-70 pointer-events-none"
            />
            {/* Radial Gradient overlay to soften the center and fade edges specifically for this "deep" look */}
            <div className="absolute inset-0 bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_100%)] pointer-events-none z-0"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </main>
    );
};
