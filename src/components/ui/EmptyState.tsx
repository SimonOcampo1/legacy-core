import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";

interface EmptyStateProps {
    title: string;
    message: string;
    icon?: LucideIcon;
    actionLabel?: string;
    actionLink?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    title,
    message,
    icon: Icon = AlertTriangle,
    actionLabel,
    actionLink,
    onAction,
    className = ""
}: EmptyStateProps) {
    const buttonClasses = "group relative px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-gold hover:text-black dark:hover:bg-gold dark:hover:text-black active:scale-95";

    return (
        <div className={`relative p-12 md:p-20 flex flex-col items-center justify-center text-center overflow-hidden border-2 border-dashed border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] ${className}`}>
            {/* Background Title Decor */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                <span className="text-[12vw] font-black uppercase tracking-tighter text-black/[0.03] dark:text-white/[0.03] whitespace-nowrap">
                    {title}
                </span>
            </div>

            {/* Icon/Alert Badge */}
            <div className="relative z-10 mb-8 inline-flex items-center gap-2 px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] uppercase tracking-widest leading-none">
                <Icon className="w-3 h-3" />
                <span>SYSTEM_ALERT // {title}</span>
            </div>

            <div className="relative z-10 max-w-xl space-y-6">
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none text-black dark:text-white">
                    {message}
                </h3>

                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    TERMINAL_STATUS: RESOLUTION_REQUIRED // DATA_STREAM_NULL
                </p>

                {actionLabel && (
                    <div className="pt-4">
                        {actionLink ? (
                            <Link to={actionLink} className={buttonClasses}>
                                <span className="relative z-10">{actionLabel}</span>
                                <div className="absolute inset-0 bg-gold translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                            </Link>
                        ) : (
                            <button onClick={onAction} className={buttonClasses}>
                                <span className="relative z-10">{actionLabel}</span>
                                <div className="absolute inset-0 bg-gold translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Corner Decor */}
            <div className="absolute top-4 left-4 font-mono text-[10px] opacity-20 uppercase tracking-widest">ERR_404_VOID</div>
            <div className="absolute bottom-4 right-4 font-mono text-[10px] opacity-20 uppercase tracking-widest">SEC_NULL_PTR</div>
        </div>
    );
}
