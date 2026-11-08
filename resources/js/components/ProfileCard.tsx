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

    // Format real-time Jakarta WIB clock for interactive global presence
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
                className="glass-card relative flex w-full flex-col items-center overflow-hidden rounded-[2.2rem] p-8 text-center shadow-xl shadow-slate-100/40 dark:shadow-none animate-pulse"
            >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-6 h-36 w-36 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-2 h-7 w-48 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-4 h-6 w-36 rounded-full bg-slate-100 dark:bg-slate-900"></div>
                <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-6 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-6 h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-full space-y-4">
                    <div className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800"></div>
                    <div className="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800"></div>
                </div>
                <div className="mt-5 w-full border-t border-slate-200/20 pt-5 dark:border-slate-800/40 space-y-3 text-left">
                    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-10 w-full rounded-2xl bg-slate-100/50 dark:bg-slate-900/40"></div>
                    <div className="h-10 w-full rounded-2xl bg-slate-100/50 dark:bg-slate-900/40"></div>
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
            className="glass-card transform-gpu relative flex w-full flex-col items-center overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-7 md:p-8 text-center shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30 transition-all duration-300 group"
        >
            {/* Top aesthetic gradient accent line */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

            {/* Ambient subtle card glow */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-violet-500/10 blur-2xl transition-opacity group-hover:opacity-20 dark:bg-violet-400/10"></div>

            {/* Time & Availability Badge */}
            <div className="mb-6 flex w-full items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800/70">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold text-slate-650 dark:bg-slate-800/80 dark:text-slate-300">
                    <Clock size={11} className="text-violet-500" />
                    <span>{currentTime ? `${currentTime} WIB` : 'Jakarta, ID'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    </span>
                    <span>Available</span>
                </div>
            </div>

            {/* Concentric Modern Avatar Container */}
            <div className="relative mb-5 select-none">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-blue-500 via-violet-500 to-indigo-500 opacity-20 blur-md transition-all duration-500 group-hover:opacity-35" />
                <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-gradient-to-tr from-blue-500 via-violet-500 to-indigo-500 p-[3px] shadow-[0_4px_20px_rgba(139,92,246,0.2)] transition-transform duration-300 group-hover:scale-[1.02]">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-900">
                        {profile.image ? (
                            <img
                                src={profile.image}
                                alt={profile.name || 'Avatar'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-violet-500/10 text-violet-600 dark:text-violet-300 font-black text-2xl select-none">
                                {profile.name?.trim() ? profile.name.trim().slice(0, 2).toUpperCase() : <User size={36} className="text-slate-400" />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Verified Pro Badge Stamp */}
                <div
                    className="absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md ring-2 ring-white dark:bg-white dark:text-slate-900 dark:ring-slate-900"
                    title="Verified Full-Stack Software Engineer"
                >
                    <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600" />
                </div>
            </div>

            {/* Profile Name & Title */}
            {profile.name?.trim() ? (
                <div className="mb-1 flex items-center justify-center gap-1.5">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {profile.name}
                    </h2>
                </div>
            ) : null}

            {profile.role?.trim() ? (
                <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-violet-50/80 px-3.5 py-1 text-xs font-bold text-violet-700 shadow-2xs dark:border-violet-500/20 dark:bg-violet-950/40 dark:text-violet-300">
                    <Sparkles size={11} className="text-violet-500" />
                    <span>{profile.role}</span>
                </div>
            ) : null}

            {/* Bio summary */}
            {profile.bio?.trim() ? (
                <p className="mb-5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                    {profile.bio}
                </p>
            ) : null}

            {/* Core Tech Highlights Badge Row */}
            <div className="mb-6 flex flex-wrap justify-center gap-1.5">
                <span className="rounded-md border border-slate-200/70 bg-slate-100/70 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    Laravel 12
                </span>
                <span className="rounded-md border border-slate-200/70 bg-slate-100/70 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    React 19 & TS
                </span>
                <span className="rounded-md border border-slate-200/70 bg-slate-100/70 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    PostgreSQL
                </span>
                <span className="rounded-md border border-slate-200/70 bg-slate-100/70 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    Clean Arch
                </span>
            </div>

            {/* Contact Statistics List */}
            {hasContacts && (
                <>
                    <div className="mb-5 h-[1px] w-full bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60" />
                    <div className="mb-6 w-full space-y-3 text-left">
                        {profile.location?.trim() ? (
                            <div className="group flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400">
                                        <MapPin size={15} id="location-pin-icon" />
                                    </div>
                                    <div>
                                        <span className="block text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                            Location
                                        </span>
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            {profile.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {profile.email?.trim() ? (
                            <div className="group flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-violet-950 dark:group-hover:text-violet-400">
                                        <Mail size={15} strokeWidth={2.2} id="email-envelope-icon" />
                                    </div>
                                    <div className="truncate">
                                        <span className="block text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                            Email Address
                                        </span>
                                        <a
                                            href={`mailto:${profile.email}`}
                                            className="block truncate text-xs font-semibold text-slate-800 transition-colors hover:text-violet-600 dark:text-slate-200 dark:hover:text-violet-400"
                                        >
                                            {profile.email}
                                        </a>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopyEmail(profile.email || '')}
                                    className="cursor-pointer flex-shrink-0 ml-2 rounded-lg border border-slate-200/80 bg-white p-1.5 text-slate-500 shadow-2xs transition-all hover:border-violet-500 hover:text-violet-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-violet-400 dark:hover:text-violet-300"
                                    title="Salin alamat email"
                                >
                                    {copiedEmail ? (
                                        <Check size={13} className="text-emerald-500" />
                                    ) : (
                                        <Copy size={13} />
                                    )}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </>
            )}

            {/* Call To Action Buttons */}
            <div className="w-full space-y-2.5">
                <button
                    onClick={onOpenContact}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.98]"
                >
                    <Send size={15} id="profile-send-icon" strokeWidth={2.4} />
                    <span>Hubungi Saya</span>
                </button>

                <a
                    href="/images/Profile.pdf"
                    download="Ridhwan_Anang_Maruf_Resume.pdf"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <Download size={15} id="profile-download-icon" strokeWidth={2.4} />
                    <span>Download Resume (PDF)</span>
                </a>
            </div>

            {/* Social Network Grid */}
            {hasSocials && (
                <div className="mt-5 flex items-center gap-3">
                    {profile.github_url?.trim() ? (
                        <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/social flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all duration-300 hover:scale-105 hover:border-slate-900 hover:bg-slate-900 hover:text-white dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-white dark:hover:bg-white dark:hover:text-slate-950"
                            aria-label="Kunjungi profil GitHub Ridhwan"
                        >
                            <Github size={15} id="profile-github-icon" />
                            <span>GitHub</span>
                        </a>
                    ) : null}
                    {profile.linkedin_url?.trim() ? (
                        <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/social flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all duration-300 hover:scale-105 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-[#0A66C2] dark:hover:bg-[#0A66C2] dark:hover:text-white"
                            aria-label="Kunjungi profil LinkedIn Ridhwan"
                        >
                            <Linkedin size={15} id="profile-linkedin-icon" />
                            <span>LinkedIn</span>
                        </a>
                    ) : null}
                </div>
            )}

            {/* Education History Section */}
            {validEducations.length > 0 && (
                <div className="mt-6 w-full border-t border-slate-100 pt-5 text-left dark:border-slate-800/70">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                            <GraduationCap size={15} />
                        </div>
                        <span className="text-[10px] leading-none font-extrabold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            Pendidikan & Kualifikasi
                        </span>
                    </div>

                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 pl-4 space-y-4">
                        {validEducations.map((edu, idx) => (
                            <div key={idx} className="relative group/edu">
                                <div className="absolute -left-[23px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-white border-2 border-slate-300 dark:bg-slate-900 dark:border-slate-700 group-hover/edu:border-amber-500 transition-colors">
                                    <div className="h-1 w-1 rounded-full bg-slate-400 group-hover/edu:bg-amber-500 transition-colors" />
                                </div>

                                <div>
                                    {edu.school && (
                                        <h5 className="text-xs font-extrabold leading-snug text-slate-800 dark:text-slate-200 group-hover/edu:text-amber-500 dark:group-hover/edu:text-amber-400 transition-colors">
                                            {edu.school}
                                        </h5>
                                    )}
                                    {edu.major && (
                                        <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                            {edu.major}
                                        </span>
                                    )}
                                    {edu.period && (
                                        <span className="inline-block text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-1 font-mono rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
                                            {edu.period}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
