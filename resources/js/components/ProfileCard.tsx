import {
    GraduationCap,
    User,
    CheckCircle2,
    Clock,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfileCardProps {
    onOpenContact?: () => void;
    profile: {
        name?: string | null;
        role?: string | null;
        bio?: string | null;
        location?: string | null;
        email?: string | null;
        image?: string | null;
        github_url?: string | null;
        linkedin_url?: string | null;
        education?: Array<{
            school?: string;
            major?: string;
            period?: string;
        }> | null;
    } | null;
    loading: boolean;
}

export default function ProfileCard({ profile, loading }: ProfileCardProps) {
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            try {
                const now = new Date();
                const timeString = new Intl.DateTimeFormat('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }).format(now);
                setCurrentTime(timeString);
            } catch {
                setCurrentTime('WIB');
            }
        };

        updateClock();
        const interval = setInterval(updateClock, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !profile) {
        return (
            <div
                id="profile-card"
                className="luxury-card relative flex w-full flex-col overflow-hidden rounded-xl p-5 animate-pulse"
            >
                <div className="specular-top" />
                <div className="mb-3 h-20 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="mb-2 h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="mb-3 h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-900 mx-auto"></div>
                <div className="space-y-1.5">
                    <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-850 w-full"></div>
                    <div className="h-3 rounded bg-zinc-100 dark:bg-zinc-850 w-4/5 mx-auto"></div>
                </div>
            </div>
        );
    }

    const validEducations = (Array.isArray(profile.education) ? profile.education : []).filter(
        (edu) => Boolean(edu.school?.trim() || edu.major?.trim() || edu.period?.trim())
    );

    return (
        <div
            id="profile-card"
            className="luxury-card transform-gpu relative flex w-full flex-col justify-between overflow-hidden rounded-xl p-5 text-left transition-all duration-300 group"
        >
            {/* Top Specular Rim Light */}
            <div className="specular-top" />

            {/* Subtle Radiant Top Line (Gold to Deep Blue) */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-500 opacity-90 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />

            {/* Ambient Internal Light Halo */}
            <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-36 rounded-full bg-blue-600/10 blur-2xl" />

            <div>
                {/* Module 1: Live Status & Presence Bar */}
                <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-zinc-200/80 dark:border-blue-400/15">
                    <div className="flex items-center gap-1.5 rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-mono text-zinc-600 dark:border-blue-400/15 dark:bg-[#0a1228] dark:text-amber-200/90 shadow-2xs">
                        <Clock size={11} className="text-amber-500 dark:text-amber-400" />
                        <span>{currentTime ? `${currentTime} WIB` : 'Jakarta, ID'}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 shadow-2xs">
                        <span className="relative flex size-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
                        </span>
                        <span>Available for Work</span>
                    </div>
                </div>

                {/* Module 2: Compact Identity Showcase */}
                <div className="relative z-10 pt-4 flex flex-col items-center text-center">
                    {/* Precision Squircle Avatar */}
                    <div className="relative group/avatar mb-3">
                        <div className="relative p-[2px] rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-blue-500 shadow-sm transition-transform duration-300 group-hover/avatar:scale-102">
                            <div className="size-20 overflow-hidden rounded-[10px] bg-[#091024] border border-black/40">
                                {profile.image ? (
                                    <img
                                        src={profile.image}
                                        alt={profile.name || 'Avatar'}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-300 font-bold text-xl bg-gradient-to-tr from-blue-950 to-zinc-900">
                                        {profile.name?.trim() ? profile.name.trim().slice(0, 2).toUpperCase() : <User size={26} />}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verified Stamp Badge */}
                        <div
                            className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md bg-emerald-500 text-white border-2 border-white dark:border-[#091024] shadow-xs"
                            title="Verified Software Engineer"
                        >
                            <CheckCircle2 size={11} className="text-white" />
                        </div>
                    </div>

                    {/* Name & Role */}
                    {profile.name?.trim() && (
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                            {profile.name}
                        </h2>
                    )}

                    {profile.role?.trim() && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-300 shadow-xs">
                            <Sparkles size={10} className="text-amber-500 dark:text-amber-400" />
                            <span>{profile.role}</span>
                        </div>
                    )}

                    {/* Bio text */}
                    {profile.bio?.trim() && (
                        <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal">
                            {profile.bio}
                        </p>
                    )}
                </div>
            </div>

            {/* Module 7: Education Timeline (Compact) */}
            {validEducations.length > 0 && (
                <div className="relative z-10 mt-5 pt-4 border-t border-zinc-200/80 dark:border-white/[0.07]">
                    <div className="flex items-center gap-1 text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
                        <GraduationCap size={12} className="text-amber-500" />
                        <span>Kualifikasi Pendidikan</span>
                    </div>

                    <div className="space-y-2.5">
                        {validEducations.map((edu, idx) => (
                            <div key={idx} className="relative pl-3 border-l-2 border-zinc-300 dark:border-white/10">
                                <div className="absolute -left-[5px] top-1 size-1.5 rounded-full bg-amber-400 shadow-xs" />
                                {edu.school && (
                                    <h5 className="text-[11.5px] font-bold text-zinc-900 dark:text-white leading-tight">
                                        {edu.school}
                                    </h5>
                                )}
                                {edu.major && (
                                    <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
                                        {edu.major}
                                    </p>
                                )}
                                {edu.period && (
                                    <span className="inline-block font-mono text-[9px] text-zinc-400 mt-0.5 rounded bg-zinc-100 dark:bg-white/[0.04] px-1.5 py-0.5">
                                        {edu.period}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
