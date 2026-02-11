
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function SmoothScroll() {
    const location = useLocation();
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: "vertical",
            gestureDirection: "vertical",
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;
        (window as any).lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    useEffect(() => {
        // Immediate scroll reset on route change
        // Added setTimeout to ensure it runs after any browser native scroll restoration attempts
        const timeoutId = setTimeout(() => {
            lenisRef.current?.scrollTo(0, { immediate: true });
            window.scrollTo(0, 0); // Double enforcement
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [location.pathname]);

    return null;
}
