
export function GrainOverlay() {
    return (
        <div className="pointer-events-none fixed inset-0 z-[100] h-full w-full opacity-[0.03] sm:opacity-[0.04] mix-blend-overlay">
            <svg className="h-full w-full">
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.85"
                        numOctaves="3"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}
