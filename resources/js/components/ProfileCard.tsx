import {
    MapPin,
    Mail,
    Github,
    Linkedin,
    Send,
    Download,
    GraduationCap,
} from 'lucide-react';

interface ProfileCardProps {
    onOpenContact: () => void;
    profile: {
        name: string;
        role: string;
        bio: string;
        location: string;
        email: string;
        image?: string;
        github_url?: string;
        linkedin_url?: string;
        education?: Array<{
            school: string;
            major?: string;
            period?: string;
        }>;
    } | null;
    loading: boolean;
}

export default function ProfileCard({ onOpenContact, profile, loading }: ProfileCardProps) {
    if (loading || !profile) {
        return (
            <div
                id="profile-card"
                className="glass-card relative flex w-full flex-col items-center overflow-hidden rounded-[2.2rem] p-8 text-center shadow-xl shadow-slate-100/40 dark:shadow-none animate-pulse"
            >
                <div className="absolute inset-x-0 top-0 h-2 bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-6 h-36 w-36 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-2 h-7 w-48 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-4 h-6 w-36 rounded-full bg-slate-100 dark:bg-slate-900"></div>
                <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-6 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="mb-6 h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-full space-y-4">
                    <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                    <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                </div>
                <div className="mt-5 w-full border-t border-slate-200/20 pt-5 dark:border-slate-800/40 space-y-3 text-left">
                    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-10 w-full rounded-2xl bg-slate-100/50 dark:bg-slate-900/40"></div>
                    <div className="h-10 w-full rounded-2xl bg-slate-100/50 dark:bg-slate-900/40"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            id="profile-card"
            className="glass-card relative flex w-full flex-col items-center overflow-hidden rounded-[2.2rem] p-8 text-center shadow-xl shadow-slate-100/40 dark:shadow-none"
        >
            {/* Decorative top decoration */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500"></div>

            {/* Avatar Container with glowing rings */}
            <div className="group relative mb-6 select-none">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-violet-500 to-indigo-500 opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-50 animate-spin-slow"></div>
                <div className="relative h-36 w-36 rounded-full bg-gradient-to-tr from-blue-500 via-violet-500 to-indigo-500 p-[3px] shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-800">
                        <img
                            src={profile.image || "/images/me.jpeg"}
                            alt={profile.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                {/* Dynamic Breathing Online Status Indicator Dot */}
                <span className="absolute right-2 bottom-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span
                        className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] dark:border-slate-900"
                        title="Aktif saat ini"
                    ></span>
                </span>
            </div>

            {/* Profile Details */}
            <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {profile.name}
            </h1>
            <p className="mb-4 inline-block rounded-full bg-violet-50 px-3.5 py-1 text-sm font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                {profile.role}
            </p>

            {/* Brief bio text */}
            <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {profile.bio}
            </p>

            {/* Decorative separator line */}
            <div className="mb-6 h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>

            {/* Contact Statistics List */}
            <div className="mb-8 w-full space-y-4 text-left">
                {/* Location Row */}
                <div className="group flex items-start gap-3.5">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-colors duration-300 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400">
                        <MapPin size={16} id="location-pin-icon" />
                    </div>
                    <div>
                        <span className="mb-1 block text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            Location
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {profile.location}
                        </span>
                    </div>
                </div>

                {/* Email Row */}
                <div className="group flex items-start gap-3.5">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-colors duration-300 group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-violet-950 dark:group-hover:text-violet-400">
                        <Mail
                            size={16}
                            id="email-envelope-icon"
                            strokeWidth={2.2}
                        />
                    </div>
                    <div>
                        <span className="mb-1 block text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            Email
                        </span>
                        <a
                            href={`mailto:${profile.email}`}
                            className="text-xs font-semibold break-words text-slate-700 transition-colors hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400"
                        >
                            {profile.email}
                        </a>
                    </div>
                </div>
            </div>

            {/* Call To Action Buttons */}
            <button
                onClick={onOpenContact}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
                <Send size={15} id="profile-send-icon" strokeWidth={2.4} />
                Hubungi Saya
            </button>

            <a
                href="/images/Profile.pdf"
                download="Ridhwan_Anang_Maruf_Resume.pdf"
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200/60 bg-white py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
                <Download size={15} id="profile-download-icon" strokeWidth={2.4} />
                Download Resume (PDF)
            </a>

            {/* Social Network Grid */}
            <div className="mt-5 flex items-center gap-3.5">
                {profile.github_url && (
                    <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-slate-200/50 bg-slate-50 p-3 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-slate-950 hover:text-white hover:border-slate-950 dark:border-slate-800/50 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-white dark:hover:text-slate-950 dark:hover:border-white"
                        aria-label="Kunjungi profil GitHub Ridhwan"
                    >
                        <Github size={18} id="profile-github-icon" />
                    </a>
                )}
                {profile.linkedin_url && (
                    <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-slate-200/50 bg-slate-50 p-3 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] dark:border-slate-800/50 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-[#0A66C2] dark:hover:text-white dark:hover:border-[#0A66C2]"
                        aria-label="Kunjungi profil LinkedIn Ridhwan"
                    >
                        <Linkedin size={18} id="profile-linkedin-icon" />
                    </a>
                )}
            </div>

            {/* Education History Section */}
            {profile.education && profile.education.length > 0 && (
                <div className="mt-6 w-full border-t border-slate-100/75 pt-5 text-left dark:border-slate-800/60">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <GraduationCap size={14} />
                        </div>
                        <span className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                            Riwayat Pendidikan
                        </span>
                    </div>

                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3.5 pl-5 space-y-4">
                        {profile.education.map((edu, idx) => (
                            <div key={idx} className="relative group/edu">
                                {/* Dot positioned precisely centered on border line */}
                                <div className="absolute -left-[25px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 group-hover/edu:border-amber-400 group-hover/edu:bg-amber-50 dark:group-hover/edu:bg-amber-950/40 transition-all duration-300">
                                    <div className="h-1 w-1 rounded-full bg-slate-300 group-hover/edu:bg-amber-500 transition-colors"></div>
                                </div>

                                <div>
                                    <h5 className="text-[11px] font-extrabold leading-snug text-slate-850 dark:text-slate-200 group-hover/edu:text-amber-500 dark:group-hover/edu:text-amber-400 transition-colors">
                                        {edu.school}
                                    </h5>
                                    {edu.major && (
                                        <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                            {edu.major}
                                        </span>
                                    )}
                                    {edu.period && (
                                        <span className="block text-[9px] font-semibold text-slate-450 dark:text-slate-500 mt-0.5 font-mono">
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
