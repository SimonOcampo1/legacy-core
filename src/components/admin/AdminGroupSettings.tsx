import { useState, useEffect } from "react";
import { useGroup } from "../../context/GroupContext";
import type { Group } from "../../types";
import { Save, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

function normalizeSvg(svgString: string) {
    if (!svgString) return "";

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const svgElement = doc.querySelector("svg");

        if (!svgElement) return svgString;

        const width = svgElement.getAttribute("width");
        const height = svgElement.getAttribute("height");
        const viewBox = svgElement.getAttribute("viewBox");

        if (!viewBox && width && height) {
            const w = width.replace(/[^0-9.]/g, "");
            const h = height.replace(/[^0-9.]/g, "");
            svgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }

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
        svgElement.setAttribute("fill", "currentColor");

        return new XMLSerializer().serializeToString(doc);
    } catch (e) {
        console.error("SVG Normalization failed:", e);
        return svgString;
    }
}

export function AdminGroupSettings({ group }: { group: Group }) {
    const { updateGroup } = useGroup();
    const [name, setName] = useState(group.name);
    const [accentColor, setAccentColor] = useState(group.accent_color || '#C5A059');
    const [logoSvg, setLogoSvg] = useState(group.logo_svg || '');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>(group.logo_url || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(group.name);
        setAccentColor(group.accent_color || '#C5A059');
        setLogoSvg(group.logo_svg || '');
        setLogoPreview(group.logo_url || '');
        setLogoFile(null);
    }, [group]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    setLogoSvg(content);
                    const blob = new Blob([content], { type: 'image/svg+xml' });
                    setLogoPreview(URL.createObjectURL(blob));
                    setLogoFile(null);
                };
                reader.readAsText(file);
            } else {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
                setLogoSvg('');
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateGroup(group.$id, {
                name,
                accent_color: accentColor,
                logo_svg: logoSvg,
                logo_file: logoFile || undefined
            });
            toast.success("Group settings updated successfully");
        } catch (error) {
            console.error("Failed to update group:", error);
            toast.error("Failed to update group settings");
        } finally {
            setIsSaving(false);
        }
    };

    const normalizedPreviewSvg = logoSvg ? normalizeSvg(logoSvg) : "";

    return (
        <div className="bg-white dark:bg-black border border-black dark:border-white/20 p-6 md:p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Group Settings</h2>
                    <p className="font-mono text-xs text-gray-500">CONFIGURE_GROUP_PARAMETERS</p>
                </div>
                <div className="font-mono text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 rounded">
                    ID: {group.$id}
                </div>
            </div>

            <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <label className="font-mono text-xs uppercase text-gray-500">GROUP_NAME</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 bg-transparent border border-black dark:border-white font-mono text-lg font-bold focus:outline-none focus:bg-gray-50 dark:focus:bg-white/5 focus:border-gold transition-colors"
                        placeholder="ENTER_GROUP_NAME..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-mono text-xs uppercase text-gray-500">ACCENT_COLOR (HEX)</label>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 border border-black dark:border-white shadow-sm"
                            style={{ backgroundColor: accentColor }}
                        />
                        <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1 p-4 bg-transparent border border-black dark:border-white font-mono text-lg font-bold focus:outline-none focus:bg-gray-50 dark:focus:bg-white/5 focus:border-gold transition-colors uppercase"
                            placeholder="#000000"
                            maxLength={7}
                        />
                        <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-12 h-12 p-0 border-0 cursor-pointer bg-transparent"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="font-mono text-xs uppercase text-gray-500">GROUP_LOGO_IDENTITY</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="relative aspect-square w-full max-w-[200px] border-2 border-dashed border-black dark:border-white/20 hover:border-gold transition-colors bg-gray-50 dark:bg-white/5 flex items-center justify-center group overflow-hidden">
                                {logoSvg ? (
                                    <div
                                        className="w-full h-full p-4 flex items-center justify-center text-black dark:text-white [&_svg]:h-full [&_svg]:w-auto [&_svg]:max-w-full [&_svg]:block"
                                        dangerouslySetInnerHTML={{ __html: normalizedPreviewSvg }}
                                    />
                                ) : logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo Preview"
                                        className="w-full h-full object-contain p-4"
                                    />
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full space-y-2">
                                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-gold transition-colors" />
                                        <p className="font-mono text-[10px] uppercase text-gray-400 group-hover:text-gold">UPLOAD_LOGO</p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                )}

                                {(logoPreview || logoSvg) && (
                                    <button
                                        onClick={() => {
                                            setLogoFile(null);
                                            setLogoPreview('');
                                            setLogoSvg('');
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-black text-white hover:bg-gold hover:text-black transition-colors z-20"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2">
                                <h4 className="font-mono text-[10px] font-bold uppercase">ADVANCED: SVG_DATA</h4>
                                <textarea
                                    value={logoSvg}
                                    onChange={(e) => setLogoSvg(e.target.value)}
                                    className="w-full p-2 bg-transparent border border-black/20 dark:border-white/20 font-mono text-[10px] focus:outline-none focus:border-gold transition-colors min-h-[80px]"
                                    placeholder="<svg>...</svg>"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase hover:bg-gold hover:text-black dark:hover:bg-gold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "SAVING..." : "SAVE_CONFIGURATION"}
                    </button>
                </div>
            </div>
        </div>
    );
}
