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
                className="glass-card relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-zinc-200 p-6 text-center dark:border-white/10 animate-pulse"
            >
                <div className="mb-4 h-24 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="mb-2 h-6 w-36 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="mb-4 h-5 w-28 rounded bg-zinc-100 dark:bg-zinc-900"></div>
                <div className="mb-2 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="mb-4 h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="w-full space-y-2.5">
                    <div className="h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="h-9 rounded-xl bg-zinc-100 dark:bg-zinc-850"></div>
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
            className="glass-card transform-gpu relative flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 text-left shadow-xs dark:border-white/10 dark:bg-[#0f1117] transition-all duration-200"
        >
            {/* Top Status Bar: Clock + Availability Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <Clock size={11} className="text-zinc-400" />
                    <span>{currentTime ? `${currentTime} WIB` : 'Jakarta, ID'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Open to Work</span>
                </div>
            </div>

            {/* Profile Avatar & Info Row */}
            <div className="pt-5 flex items-start gap-4">
                <div className="relative flex-shrink-0">
                    <div className="size-20 sm:size-22 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-800 shadow-2xs">
                        {profile.image ? (
                            <img
                                src={profile.image}
                                alt={profile.name || 'Avatar'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-500 font-bold text-lg">
                                {profile.name?.trim() ? profile.name.trim().slice(0, 2).toUpperCase() : <User size={28} />}
                            </div>
                        )}
                    </div>
                    <div
                        className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md bg-zinc-900 text-white border border-white dark:bg-white dark:text-zinc-900 dark:border-zinc-900 shadow-xs"
                        title="Verified Full-Stack Engineer"
                    >
                        <CheckCircle2 size={12} className="text-emerald-400 dark:text-emerald-600" />
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    {profile.name?.trim() && (
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                            {profile.name}
                        </h2>
                    )}
                    {profile.role?.trim() && (
                        <p className="text-xs font-mono font-medium text-violet-600 dark:text-violet-400 mt-0.5 truncate">
                            {profile.role}
                        </p>
                    )}
                    {profile.location?.trim() && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                            <MapPin size={11} className="flex-shrink-0" />
                            <span className="truncate">{profile.location}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bio summary */}
            {profile.bio?.trim() && (
                <p className="mt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {profile.bio}
                </p>
            )}

            {/* Technical Focus Chips */}
            <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300">
                    Laravel 12
                </span>
                <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300">
                    React 19 & TS
                </span>
                <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300">
                    PostgreSQL
                </span>
                <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300">
                    Clean Arch
                </span>
            </div>

            {/* Email Contact Line with 1-Click Copy */}
            {profile.email?.trim() && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-2.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Mail size={13} className="text-zinc-400 flex-shrink-0" />
                        <span className="truncate text-xs font-mono text-zinc-700 dark:text-zinc-300">
                            {profile.email}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCopyEmail(profile.email || '')}
                        className="ml-2 flex-shrink-0 cursor-pointer rounded p-1 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
                        title="Salin email"
                    >
                        {copiedEmail ? (
                            <Check size={12} className="text-emerald-500" />
                        ) : (
                            <Copy size={12} />
                        )}
                    </button>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                    onClick={onOpenContact}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-98 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-2xs"
                >
                    <Send size={12} />
                    <span>Hubungi</span>
                </button>

                <a
                    href="/images/Profile.pdf"
                    download="Ridhwan_Anang_Maruf_Resume.pdf"
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-zinc-800 transition-all hover:bg-zinc-50 active:scale-98 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-850 shadow-2xs"
                >
                    <Download size={12} />
                    <span>Resume</span>
                </a>
            </div>

            {/* Social Network Links */}
            {hasSocials && (
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    {profile.github_url?.trim() && (
                        <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300"
                        >
                            <Linkedin size={13} />
                            <span>LinkedIn</span>
                        </a>
                    )}
                </div>
            )}

            {/* Education History */}
            {validEducations.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
                        <GraduationCap size={12} />
                        <span>Pendidikan</span>
                    </div>

                    <div className="space-y-2.5">
                        {validEducations.map((edu, idx) => (
                            <div key={idx} className="relative pl-3 border-l border-zinc-200 dark:border-zinc-800">
                                <div className="absolute -left-[3.5px] top-1.5 size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                {edu.school && (
                                    <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 leading-snug">
                                        {edu.school}
                                    </h5>
                                )}
                                {edu.major && (
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        {edu.major}
                                    </p>
                                )}
                                {edu.period && (
                                    <span className="inline-block font-mono text-[9.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">
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
