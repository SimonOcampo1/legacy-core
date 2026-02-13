import { useEffect, useState, useRef } from "react";
import { cn } from "../../lib/utils";

export function InteractiveGridBackground() {
    const [columns, setColumns] = useState(0);
    const [rows, setRows] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const calculateGrid = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                const cellSize = 40; // Size of the squares
                const cols = Math.ceil(width / cellSize);
                const rows = Math.ceil(height / cellSize);
                setColumns(cols);
                setRows(rows);
            }
        };

        calculateGrid();
        window.addEventListener("resize", calculateGrid);
        return () => window.removeEventListener("resize", calculateGrid);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
            <div
                className="grid w-full h-full"
                style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
            >
                {Array.from({ length: columns * rows }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-full h-full border-[0.5px] border-black/5 dark:border-white/5 transition-colors duration-0 hover:duration-0",
                            "hover:bg-black dark:hover:bg-white"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
