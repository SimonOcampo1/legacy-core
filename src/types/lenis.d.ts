
declare module 'lenis' {
    export interface LenisOptions {
        duration?: number;
        easing?: (t: number) => number;
        direction?: 'vertical' | 'horizontal';
        gestureDirection?: 'vertical' | 'horizontal';
        smooth?: boolean;
        smoothTouch?: boolean;
        touchMultiplier?: number;
        infinite?: boolean;
        orientation?: 'vertical' | 'horizontal';
        gestureOrientation?: 'vertical' | 'horizontal';
        wheelMultiplier?: number;
        normalizeWheel?: boolean;
    }

    export default class Lenis {
        constructor(options?: LenisOptions);
        raf(time: number): void;
        destroy(): void;
        start(): void;
        stop(): void;
        on(event: string, callback: (args: any) => void): void;
        scrollTo(target: any, options?: any): void;
    }
}
