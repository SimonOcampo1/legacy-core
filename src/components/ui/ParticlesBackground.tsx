import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface ParticlesBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children?: React.ReactNode;
    quantity?: number;
    staticity?: number;
    ease?: number;
    size?: number;
    refresh?: boolean;
    color?: string;
    vx?: number;
    vy?: number;
}

export const ParticlesBackground = ({
    className,
    children,
    quantity = 50, // Reduced quantity for cleaner look, default was often 100
    staticity = 50,
    ease = 50,
    size = 0.4,
    refresh = false,
    color,
    vx = 0,
    vy = 0,
    ...props
}: ParticlesBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const circles = useRef<any[]>([]);
    const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

    // Theme detection for dynamic color
    const [themeColor, setThemeColor] = useState<string>("rgb(0, 0, 0)"); // Default black

    useEffect(() => {
        // Simple robust theme check
        const isDarkMode = document.documentElement.classList.contains("dark");
        setThemeColor(isDarkMode ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const isDark = document.documentElement.classList.contains("dark");
                    setThemeColor(isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Effect implementation
    useEffect(() => {
        if (canvasRef.current) {
            context.current = canvasRef.current.getContext("2d");
        }
        initCanvas();
        animate();
        window.addEventListener("resize", initCanvas);

        return () => {
            window.removeEventListener("resize", initCanvas);
        };
    }, [themeColor]); // Re-init on theme change

    useEffect(() => {
        onMouseMove();
    }, []);

    const initCanvas = () => {
        resizeCanvas();
        drawParticles();
    };

    const onMouseMove = () => {
        if (canvasContainerRef.current) {
            canvasContainerRef.current.addEventListener("mousemove", (e) => {
                const rect = canvasContainerRef.current?.getBoundingClientRect();
                if (rect) {
                    const { w, h } = canvasSize.current;
                    const x = e.clientX - rect.left - w / 2;
                    const y = e.clientY - rect.top - h / 2;
                    const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
                    if (inside) {
                        mouse.current.x = x;
                        mouse.current.y = y;
                    }
                }
            });
        }
    };

    const resizeCanvas = () => {
        if (canvasContainerRef.current && canvasRef.current && context.current) {
            circles.current.length = 0;
            canvasSize.current.w = canvasContainerRef.current.offsetWidth;
            canvasSize.current.h = canvasContainerRef.current.offsetHeight;
            canvasRef.current.width = canvasSize.current.w * dpr;
            canvasRef.current.height = canvasSize.current.h * dpr;
            canvasRef.current.style.width = `${canvasSize.current.w}px`;
            canvasRef.current.style.height = `${canvasSize.current.h}px`;
            context.current.scale(dpr, dpr);
        }
    };

    const circleParams = (): any => {
        const x = Math.floor(Math.random() * canvasSize.current.w);
        const y = Math.floor(Math.random() * canvasSize.current.h);
        const translateX = 0;
        const translateY = 0;
        const pSize = Math.floor(Math.random() * 2) + size;
        const alpha = 0;
        const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.1;
        const dy = (Math.random() - 0.5) * 0.1;
        const magnetism = 0.1 + Math.random() * 4;
        return {
            x,
            y,
            translateX,
            translateY,
            size: pSize,
            alpha,
            targetAlpha,
            dx,
            dy,
            magnetism,
        };
    };

    const drawCircle = (circle: any, update = false) => {
        if (context.current) {
            const { x, y, translateX, translateY, size, alpha } = circle;
            context.current.translate(translateX, translateY);
            context.current.beginPath();
            context.current.arc(x, y, size, 0, 2 * Math.PI);
            context.current.fillStyle = color || themeColor; // Use prop or dynamic theme color
            context.current.globalAlpha = alpha;
            context.current.fill();
            context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (!update) {
                circles.current.push(circle);
            }
        }
    };

    const clearContext = () => {
        if (context.current) {
            context.current.clearRect(
                0,
                0,
                canvasSize.current.w,
                canvasSize.current.h,
            );
        }
    };

    const drawParticles = () => {
        clearContext();
        for (let i = 0; i < quantity; i++) {
            const circle = circleParams();
            drawCircle(circle);
        }
    };

    const remapValue = (
        value: number,
        start1: number,
        end1: number,
        start2: number,
        end2: number,
    ): number => {
        const remapped =
            ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
        return value > end1 ? end2 : value < start1 ? start2 : remapped;
    };

    const animate = () => {
        clearContext();
        circles.current.forEach((circle: any, i: number) => {
            // Handle edge updates
            const edge = [
                circle.x + circle.translateX - circle.size, // distance from left
                canvasSize.current.w - circle.x - circle.translateX - circle.size, // distance from right
                circle.y + circle.translateY - circle.size, // distance from top
                canvasSize.current.h - circle.y - circle.translateY - circle.size, // distance from bottom
            ];
            const closestEdge = edge.reduce((a, b) => Math.min(a, b));
            const remapClosestEdge = parseFloat(
                remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
            );
            if (remapClosestEdge > 1) {
                circle.alpha += 0.02;
                if (circle.alpha > circle.targetAlpha) {
                    circle.alpha = circle.targetAlpha;
                }
            } else {
                circle.alpha = circle.targetAlpha * remapClosestEdge;
            }
            circle.x += circle.dx + vx;
            circle.y += circle.dy + vy;
            circle.translateX +=
                (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
                ease;
            circle.translateY +=
                (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
                ease;

            // wrap around
            if (
                circle.x < -circle.size ||
                circle.x > canvasSize.current.w + circle.size ||
                circle.y < -circle.size ||
                circle.y > canvasSize.current.h + circle.size
            ) {
                // remove the circle from the array
                circles.current.splice(i, 1);
                // create a new circle
                const newCircle = circleParams();
                drawCircle(newCircle);
                // update the circle position
            }

            drawCircle(circle, true);
        });
        window.requestAnimationFrame(animate);
    };

    return (
        <main
            className={cn(
                "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 overflow-hidden",
                className
            )}
            ref={canvasContainerRef}
            aria-hidden="true"
            {...props}
        >
            <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full opacity-60 pointer-events-none" />

            {/* Optional Radial Gradient for focus */}
            <div className="absolute inset-0 bg-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)] pointer-events-none z-0"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {children}
            </div>
        </main>
    );
};
