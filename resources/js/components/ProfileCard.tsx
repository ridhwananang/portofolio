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
    Shield,
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
                className="luxury-card relative flex w-full flex-col overflow-hidden rounded-2xl p-6 text-center animate-pulse"
            >
                <div className="specular-top" />
                <div className="mb-4 h-24 w-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="mb-2 h-6 w-36 rounded bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="mb-4 h-5 w-28 rounded bg-zinc-100 dark:bg-zinc-900 mx-auto"></div>
                <div className="mb-2 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="mb-4 h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800 mx-auto"></div>
                <div className="w-full space-y-2.5">
                    <div className="h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-850"></div>
                </div>
            </div>
        );
    }

    const validEducations = (Array.isArray(profile.education) ? profile.education : []).filter(
        (edu) => Boolean(edu.school?.trim() || edu.major?.trim() || edu.period?.trim())
    );
    const hasContacts = Boolean(profile.location?.trim() || profile.email?.trim());
    const hasSocials = Boolean(profile.github_url?.trim() || profile.linkedin_url?.trim());

    return (
        <div
            id="profile-card"
            className="luxury-card transform-gpu relative flex w-full flex-col overflow-hidden rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 group"
        >
            {/* Top Specular Rim Light */}
            <div className="specular-top" />

            {/* Glowing Accent Topline */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 opacity-90" />

            {/* Ambient Internal Light Halos */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-blue-600/10 blur-3xl" />

            {/* Top Status Bar: Clock + Live Availability */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200/70 dark:border-white/[0.07] bg-zinc-100/60 dark:bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 shadow-2xs">
                    <Clock size={11} className="text-violet-500" />
                    <span>{currentTime ? `${currentTime} WIB` : 'Jakarta, ID'}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-mono font-medium text-emerald-700 dark:text-emerald-400 shadow-xs">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    </span>
                    <span>Open to Work</span>
                </div>
            </div>

            {/* Profile Avatar & Info Row */}
            <div className="relative z-10 pt-5 flex items-start gap-4">
                {/* Multi-layer Metallic Bezel Avatar Frame */}
                <div className="relative flex-shrink-0 group/avatar">
                    <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-white/40 via-violet-500/20 to-transparent shadow-lg dark:from-white/20 dark:via-white/5 dark:to-transparent">
                        <div className="size-20 sm:size-22 overflow-hidden rounded-[14px] bg-zinc-900 border border-zinc-200 dark:border-black/50 shadow-inner">
                            {profile.image ? (
                                <img
                                    src={profile.image}
                                    alt={profile.name || 'Avatar'}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-zinc-400 font-bold text-xl bg-gradient-to-tr from-violet-950 to-zinc-900">
                                    {profile.name?.trim() ? profile.name.trim().slice(0, 2).toUpperCase() : <User size={28} />}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Verified Badge Shield */}
                    <div
                        className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-2 border-white dark:border-[#0c0f17] shadow-[0_2px_10px_rgba(16,185,129,0.5)]"
                        title="Verified Full-Stack Software Engineer"
                    >
                        <CheckCircle2 size={13} className="text-white" />
                    </div>
                </div>

                <div className="min-w-0 flex-1 pt-1">
                    {profile.name?.trim() && (
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white truncate">
                            {profile.name}
                        </h2>
                    )}
                    {profile.role?.trim() && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-violet-700 dark:text-violet-300">
                            <Sparkles size={10} className="text-violet-500" />
                            <span className="truncate">{profile.role}</span>
                        </div>
                    )}
                    {profile.location?.trim() && (
                        <div className="flex items-center gap-1.5 text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-2">
                            <MapPin size={11.5} className="text-zinc-400 flex-shrink-0" />
                            <span className="truncate font-medium">{profile.location}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bio summary */}
            {profile.bio?.trim() && (
                <p className="relative z-10 mt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-350 font-normal">
                    {profile.bio}
                </p>
            )}

            {/* Technical Focus Chips */}
            <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
                {[
                    { label: 'Laravel 12', color: 'hover:border-red-500/50 hover:text-red-500' },
                    { label: 'React 19 & TS', color: 'hover:border-sky-400/50 hover:text-sky-400' },
                    { label: 'PostgreSQL', color: 'hover:border-blue-500/50 hover:text-blue-500' },
                    { label: 'Clean Arch', color: 'hover:border-violet-500/50 hover:text-violet-400' },
                ].map((chip) => (
                    <span
                        key={chip.label}
                        className={`rounded-lg border border-zinc-200/90 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs transition-colors duration-200 ${chip.color}`}
                    >
                        {chip.label}
                    </span>
                ))}
            </div>

            {/* Email Contact Inset Bar with 1-Click Copy */}
            {profile.email?.trim() && (
                <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/90 dark:bg-black/30 px-3 py-2 shadow-inner">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex size-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <Mail size={12} />
                        </div>
                        <span className="truncate text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200">
                            {profile.email}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCopyEmail(profile.email || '')}
                        className="ml-2 flex-shrink-0 cursor-pointer rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10.5px] font-mono font-medium text-zinc-600 hover:border-violet-500 hover:text-violet-600 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-violet-400 dark:hover:text-violet-300 shadow-2xs transition-all active:scale-95"
                        title="Salin email ke clipboard"
                    >
                        {copiedEmail ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Check size={11} /> Tersalin
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Copy size={11} /> Salin
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Action Buttons (Luxury Depth & Dimension) */}
            <div className="relative z-10 mt-5 grid grid-cols-2 gap-2.5">
                <button
                    onClick={onOpenContact}
                    className="luxury-btn-primary flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold tracking-wide"
                >
                    <Send size={13} />
                    <span>Hubungi</span>
                </button>

                <a
                    href="/images/Profile.pdf"
                    download="Ridhwan_Anang_Maruf_Resume.pdf"
                    className="luxury-btn-secondary flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200"
                >
                    <Download size={13} />
                    <span>Resume</span>
                </a>
            </div>

            {/* Social Network Links */}
            {hasSocials && (
                <div className="relative z-10 mt-4 flex items-center gap-2 pt-3 border-t border-zinc-200/70 dark:border-white/[0.07]">
                    {profile.github_url?.trim() && (
                        <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 dark:border-white/[0.08] dark:bg-white/[0.03] py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-950 hover:text-white hover:border-zinc-950 dark:hover:bg-white dark:hover:text-zinc-950 dark:hover:border-white shadow-2xs"
                        >
                            <Github size={13} />
                            <span>GitHub</span>
                        </a>
                    )}
                    {profile.linkedin_url?.trim() && (
                        <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 dark:border-white/[0.08] dark:bg-white/[0.03] py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] shadow-2xs"
                        >
                            <Linkedin size={13} />
                            <span>LinkedIn</span>
                        </a>
                    )}
                </div>
            )}

            {/* Education History with Glowing Jewel Timeline Nodes */}
            {validEducations.length > 0 && (
                <div className="relative z-10 mt-5 pt-4 border-t border-zinc-200/70 dark:border-white/[0.07]">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                        <GraduationCap size={13} className="text-amber-500" />
                        <span>Kualifikasi Pendidikan</span>
                    </div>

                    <div className="space-y-3">
                        {validEducations.map((edu, idx) => (
                            <div key={idx} className="relative pl-3.5 border-l-2 border-zinc-200 dark:border-zinc-800">
                                <div className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                {edu.school && (
                                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                                        {edu.school}
                                    </h5>
                                )}
                                {edu.major && (
                                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        {edu.major}
                                    </p>
                                )}
                                {edu.period && (
                                    <span className="inline-block font-mono text-[9.5px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 rounded bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 border border-zinc-200/50 dark:border-white/[0.05]">
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
