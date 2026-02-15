import { Link } from "react-router-dom";
import type { Member } from "../types";

interface MemberCardProps {
    member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
    return (
        <Link to={`/directory/${member.id}`} className="group cursor-pointer flex flex-col items-center text-center block">
            <div className="w-full aspect-[3/4] overflow-hidden mb-8 bg-slate-100 dark:bg-slate-900">
                <img
                    alt={member.name}
                    className="w-full h-full object-cover grayscale-img transform group-hover:scale-105 transition-transform duration-700"
                    src={member.imageUrl}
                />
            </div>
            <div className="space-y-3 max-w-xs mx-auto">
                <h3 className="font-serif text-3xl text-slate-900 dark:text-white tracking-wide group-hover:text-gold transition-colors duration-300">
                    {member.name}
                </h3>
                <p className="text-[11px] uppercase tracking-[0.25em] font-medium text-slate-500 border-b border-transparent group-hover:border-gold inline-block pb-1 transition-colors duration-300">
                    {member.role}
                </p>
                <p className="pt-2 font-editorial text-lg italic text-slate-600 dark:text-slate-400 leading-relaxed">
                    {member.quote}
                </p>
            </div>
        </Link>
    );
}
