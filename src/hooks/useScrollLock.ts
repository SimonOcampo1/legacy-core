import { useEffect } from "react";

/**
 * Locks page scrolling when a modal/overlay is open.
 * - Sets body overflow to hidden to prevent native scroll.
 * - Stops the global Lenis smooth-scroll instance so it doesn't hijack scroll events.
 * - Restores both on close / unmount.
 */
export function useScrollLock(isOpen: boolean) {
    useEffect(() => {
        if (isOpen) {
            // Lock native scroll
            document.body.style.overflow = "hidden";

            // Stop Lenis smooth scroll (it ignores overflow:hidden)
            const lenis = (window as any).lenis;
            if (lenis) {
                lenis.stop();
            }
        } else {
            // Unlock native scroll
            document.body.style.overflow = "unset";

            // Restart Lenis
            const lenis = (window as any).lenis;
            if (lenis) {
                lenis.start();
            }
        }

        return () => {
            document.body.style.overflow = "unset";
            const lenis = (window as any).lenis;
            if (lenis) {
                lenis.start();
            }
        };
    }, [isOpen]);
}
