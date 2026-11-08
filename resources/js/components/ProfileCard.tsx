import {
    MapPin,
    Mail,
    Github,
    Linkedin,
    Send,
    Download,
    GraduationCap,
    User,
    CheckCircle2,
    Copy,
    Check,
    Clock,
    Sparkles,
    ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfileCardProps {
    onOpenContact: () => void;
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

export default function ProfileCard({ onOpenContact, profile, loading }: ProfileCardProps) {
    const [copiedEmail, setCopiedEmail] = useState(false);
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

    const handleCopyEmail = (email: string) => {
        if (!email) return;
        navigator.clipboard.writeText(email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    if (loading || !profile) {
        return (
            <div
                id="profile-card"
                className="luxury-card relative flex w-full flex-col overflow-hidden rounded-xl p-5 animate-pulse"
            >
                <div className="specular-top" />
                <div className="mb-3 h-20 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="mb-2 h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="mb-4 h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-900 mx-auto"></div>
                <div className="space-y-2">
                    <div className="h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="h-9 rounded-lg bg-zinc-100 dark:bg-zinc-850"></div>
                </div>
            </div>
        );
    }

    const validEducations = (Array.isArray(profile.education) ? profile.education : []).filter(
        (edu) => Boolean(edu.school?.trim() || edu.major?.trim() || edu.period?.trim())
    );
    const hasSocials = Boolean(profile.github_url?.trim() || profile.linkedin_url?.trim());

    return (
        <div
            id="profile-card"
            className="luxury-card transform-gpu relative flex w-full flex-col justify-between overflow-hidden rounded-xl p-5 text-left transition-all duration-300 group"
        >
            {/* Top Specular Rim Light */}
            <div className="specular-top" />

            {/* Subtle Radiant Top Line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 opacity-80" />

            {/* Ambient Internal Light Halo */}
            <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-violet-600/10 blur-2xl" />

            <div>
                {/* Module 1: Live Status & Presence Bar */}
                <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-zinc-200/80 dark:border-white/[0.07]">
                    <div className="flex items-center gap-1.5 rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[10.5px] font-mono text-zinc-600 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-zinc-300 shadow-2xs">
                        <Clock size={11} className="text-violet-500 dark:text-violet-400" />
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
                        <div className="relative p-[2px] rounded-xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 shadow-sm transition-transform duration-300 group-hover/avatar:scale-102">
                            <div className="size-20 overflow-hidden rounded-[10px] bg-[#101420] border border-black/40">
                                {profile.image ? (
                                    <img
                                        src={profile.image}
                                        alt={profile.name || 'Avatar'}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-300 font-bold text-xl bg-gradient-to-tr from-violet-950 to-zinc-900">
                                        {profile.name?.trim() ? profile.name.trim().slice(0, 2).toUpperCase() : <User size={26} />}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verified Stamp Badge */}
                        <div
                            className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md bg-emerald-500 text-white border-2 border-white dark:border-[#101420] shadow-xs"
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
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-violet-600 dark:text-violet-300">
                            <Sparkles size={10} className="text-violet-500 dark:text-violet-400" />
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

                {/* Module 3: Micro Tech Chips */}
                <div className="relative z-10 mt-4 grid grid-cols-2 gap-1.5">
                    {[
                        { label: 'Laravel 12', spec: 'Backend Core', dot: 'bg-red-500' },
                        { label: 'React 19 & TS', spec: 'Reactive UI', dot: 'bg-sky-400' },
                        { label: 'PostgreSQL', spec: 'Relational DB', dot: 'bg-blue-500' },
                        { label: 'Clean Arch', spec: 'Architecture', dot: 'bg-violet-400' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-2 dark:border-white/[0.07] dark:bg-white/[0.025] transition-colors hover:border-zinc-300 dark:hover:border-white/15 shadow-2xs"
                        >
                            <span className={`size-1.5 rounded-full ${item.dot} flex-shrink-0 shadow-xs`} />
                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-bold text-zinc-800 dark:text-zinc-100 leading-none">
                                    {item.label}
                                </p>
                                <p className="truncate text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 leading-none">
                                    {item.spec}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Module 4: Location & Inset Email */}
                <div className="relative z-10 mt-3.5 space-y-1.5">
                    {profile.location?.trim() && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
                            <MapPin size={12} className="text-zinc-400 dark:text-zinc-500" />
                            <span>{profile.location}</span>
                        </div>
                    )}

                    {profile.email?.trim() && (
                        <div className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2.5 py-1.5 dark:border-white/[0.07] dark:bg-black/30 shadow-inner">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Mail size={12} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
                                <span className="truncate text-xs font-mono text-zinc-700 dark:text-zinc-300">
                                    {profile.email}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopyEmail(profile.email || '')}
                                className="ml-2 flex-shrink-0 cursor-pointer rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-300 shadow-2xs transition-all active:scale-95"
                                title="Salin email"
                            >
                                {copiedEmail ? (
                                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                                        <Check size={10} /> Salin
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Copy size={10} /> Salin
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Module 5: Compact 3D CTA Buttons */}
                <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
                    <button
                        onClick={onOpenContact}
                        className="luxury-btn-primary flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold tracking-wide"
                    >
                        <Send size={12} />
                        <span>Hubungi Saya</span>
                    </button>

                    <a
                        href="/images/Profile.pdf"
                        download="Ridhwan_Anang_Maruf_Resume.pdf"
                        className="luxury-btn-secondary flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                    >
                        <Download size={12} />
                        <span>Resume (PDF)</span>
                    </a>
                </div>

                {/* Module 6: Social Links Dock */}
                {hasSocials && (
                    <div className="relative z-10 mt-3.5 flex items-center gap-1.5 pt-3 border-t border-zinc-200/80 dark:border-white/[0.07]">
                        {profile.github_url?.trim() && (
                            <a
                                href={profile.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50 py-1.5 text-[11px] font-semibold text-zinc-700 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-zinc-300 transition-all hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 shadow-2xs"
                            >
                                <Github size={12} />
                                <span>GitHub</span>
                            </a>
                        )}
                        {profile.linkedin_url?.trim() && (
                            <a
                                href={profile.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50 py-1.5 text-[11px] font-semibold text-zinc-700 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-zinc-300 transition-all hover:bg-[#0A66C2] hover:text-white dark:hover:bg-[#0A66C2] dark:hover:text-white shadow-2xs"
                            >
                                <Linkedin size={12} />
                                <span>LinkedIn</span>
                            </a>
                        )}
                        <a
                            href="https://www.dicoding.com/users/riedmarf12/academies"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-zinc-300 transition-all hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 shadow-2xs"
                            title="Dicoding Profile"
                        >
                            <span>Dicoding</span>
                            <ExternalLink size={10} className="ml-1 opacity-60" />
                        </a>
                    </div>
                )}
            </div>

            {/* Module 7: Education Timeline (Compact) */}
            {validEducations.length > 0 && (
                <div className="relative z-10 mt-4 pt-3 border-t border-zinc-200/80 dark:border-white/[0.07]">
                    <div className="flex items-center gap-1 text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                        <GraduationCap size={12} className="text-amber-500" />
                        <span>Kualifikasi Pendidikan</span>
                    </div>

                    <div className="space-y-2">
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
