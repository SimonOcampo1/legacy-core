
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface TextRevealProps {
    children: string;
    className?: string;
    delay?: number;
    width?: "fit-content" | "100%";
}

export const TextReveal = ({ children, className = "", delay = 0, width = "fit-content" }: TextRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className={className}>
            <motion.div
                variants={{
                    hidden: { y: "100%" },
                    visible: { y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1], // Custom "editorial" ease
                    delay,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
