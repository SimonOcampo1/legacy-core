import { useGroup } from '../../context/GroupContext';
import { PPGLogo } from '../ui/PPGLogo';
import { cn } from '../../lib/utils';

interface GroupLogoProps {
    className?: string;
}

function normalizeSvg(svgString: string) {
    if (!svgString) return "";

    try {
        // Create a temporary parser to manipulate the SVG
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = doc.querySelector("svg");

        if (!svgElement) return svgString;

        // Get original dimensions
        const width = svgElement.getAttribute("width");
        const height = svgElement.getAttribute("height");
        const viewBox = svgElement.getAttribute("viewBox");

        // If viewBox is missing but we have width/height, create it
        if (!viewBox && width && height) {
            // Remove 'px' or other units for the viewBox
            const w = width.replace(/[^0-9.]/g, "");
            const h = height.replace(/[^0-9.]/g, "");
            svgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }

        // Force essential attributes for scaling
        svgElement.removeAttribute("width");
        svgElement.removeAttribute("height");
        svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");

        // Strip colors to allow currentColor to work
        const stripColors = (element: Element) => {
            const fill = element.getAttribute("fill");
            const stroke = element.getAttribute("stroke");

            if (fill && fill !== "none" && fill !== "transparent") {
                element.setAttribute("fill", "currentColor");
            }
            if (stroke && stroke !== "none" && stroke !== "transparent") {
                element.setAttribute("stroke", "currentColor");
            }

            // Also check styles
            const style = element.getAttribute("style");
            if (style) {
                let newStyle = style
                    .replace(/fill\s*:\s*([^;]+)/gi, (match, p1) => {
                        return (p1.trim() === "none" || p1.trim() === "transparent") ? match : "fill:currentColor";
                    })
                    .replace(/stroke\s*:\s*([^;]+)/gi, (match, p1) => {
                        return (p1.trim() === "none" || p1.trim() === "transparent") ? match : "stroke:currentColor";
                    });
                element.setAttribute("style", newStyle);
            }

            Array.from(element.children).forEach(child => stripColors(child));
        };

        stripColors(svgElement);
        // Set root fill to currentColor to ensure inheritance
        svgElement.setAttribute("fill", "currentColor");

        return new XMLSerializer().serializeToString(doc);
    } catch (e) {
        console.error("SVG Normalization failed:", e);
        return svgString;
    }
}

export function GroupLogo({ className }: GroupLogoProps) {
    const { currentGroup } = useGroup();

    if (currentGroup?.logo_svg) {
        const normalizedSvg = normalizeSvg(currentGroup.logo_svg);
        return (
            <div
                className={cn(
                    "flex items-center justify-center text-black dark:text-white transition-colors duration-300 hover:text-[var(--accent-color)] relative max-w-full h-full",
                    "[&_svg]:block [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-full",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: normalizedSvg }}
            />
        );
    }

    if (currentGroup?.logo_url) {
        return (
            <img
                src={currentGroup.logo_url}
                alt={currentGroup.name}
                className={cn("object-contain transition-all duration-300 h-full w-auto", className)}
            />
        );
    }

    // Default: PPG Logo (Legacy Core default)
    return <PPGLogo className={cn("text-black dark:text-white hover:text-[var(--accent-color)] transition-colors duration-300 h-full w-auto", className)} />;
}
