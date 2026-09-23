import { Terminal, Database, Server, Layout, ArrowRight, Calculator, Sparkles, Search } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface MainHeroProps {
    onOpenTracking?: () => void;
}

export default function MainHero({ onOpenTracking }: MainHeroProps) {
    return (
        <div
            id="main-hero"
            className="glass-card relative w-full overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-white/75 p-6 sm:p-8 md:p-9 shadow-xl shadow-slate-100/50 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none"
        >
            {/* Dynamic Background Mesh Accents inside the card */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-tr from-violet-500/15 via-indigo-500/10 to-transparent blur-2xl dark:from-violet-500/10 dark:via-indigo-500/5"></div>
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-500/15 via-emerald-500/10 to-transparent blur-2xl dark:from-blue-500/10 dark:via-emerald-500/5"></div>

            {/* Availability Status Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-1 text-emerald-700 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-[10.5px] font-bold tracking-wider uppercase">
                    Tersedia untuk Kolaborasi & Proyek Baru
                </span>
            </div>

            {/* Refined Typography Heading */}
            <h1 className="mb-4 text-2xl sm:text-3xl lg:text-[2.25rem] leading-snug font-black tracking-tight text-slate-900 dark:text-white">
                Membangun{' '}
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text pb-0.5 font-extrabold text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-indigo-400">
                    Aplikasi Web Modern
                </span>{' '}
                yang Cepat, Aman, & Skalabel.
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                Saya adalah Full Stack Web Developer yang berfokus pada rekayasa perangkat lunak secara end-to-end. Spesialisasi saya mencakup perancangan arsitektur backend andal menggunakan <strong>Laravel</strong>, antarmuka SPA interaktif dengan <strong>React & TypeScript</strong>, serta optimasi database performa tinggi (MySQL & MongoDB).
            </p>

            {/* Action CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                    href="/layanan"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Calculator size={14} />
                    <span>Hitung Estimasi Biaya</span>
                    <ArrowRight size={13} />
                </Link>

                {onOpenTracking && (
                    <button
                        onClick={onOpenTracking}
                        type="button"
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-xs font-bold text-violet-700 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300 shadow-xs transition-all duration-300 hover:bg-violet-500/20 active:scale-[0.98]"
                    >
                        <Search size={14} className="text-violet-600 dark:text-violet-400" />
                        <span>Lacak Proyek</span>
                    </button>
                )}

                <a
                    href="#karya"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-xs font-bold text-slate-700 shadow-xs transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-850"
                >
                    <Sparkles size={14} className="text-violet-500" />
                    <span>Lihat Portofolio</span>
                </a>
            </div>

            {/* High-fidelity Micro Stats/Aesthetic pills */}
            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="group flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3 transition-all duration-300 hover:border-red-400/40 hover:bg-white hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-red-500/30 dark:hover:bg-slate-900/60">
                    <div className="rounded-xl bg-red-100/70 p-1.5 text-red-600 transition-transform duration-300 group-hover:scale-110 dark:bg-red-950/40 dark:text-red-400">
                        <Server size={14} />
                    </div>
                    <span className="text-[11.5px] leading-tight font-bold text-slate-700 dark:text-slate-300">
                        Laravel Backend
                    </span>
                </div>

                <div className="group flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3 transition-all duration-300 hover:border-sky-400/40 hover:bg-white hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-sky-500/30 dark:hover:bg-slate-900/60">
                    <div className="rounded-xl bg-sky-100/70 p-1.5 text-sky-600 transition-transform duration-300 group-hover:scale-110 dark:bg-sky-950/40 dark:text-sky-400">
                        <Layout size={14} />
                    </div>
                    <span className="text-[11.5px] leading-tight font-bold text-slate-700 dark:text-slate-300">
                        React + TS SPA
                    </span>
                </div>

                <div className="group flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3 transition-all duration-300 hover:border-emerald-400/40 hover:bg-white hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-emerald-500/30 dark:hover:bg-slate-900/60">
                    <div className="rounded-xl bg-emerald-100/70 p-1.5 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Database size={14} />
                    </div>
                    <span className="text-[11.5px] leading-tight font-bold text-slate-700 dark:text-slate-300">
                        SQL & NoSQL
                    </span>
                </div>

                <div className="group flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3 transition-all duration-300 hover:border-violet-400/40 hover:bg-white hover:shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-violet-500/30 dark:hover:bg-slate-900/60">
                    <div className="rounded-xl bg-violet-100/70 p-1.5 text-violet-600 transition-transform duration-300 group-hover:scale-110 dark:bg-violet-950/40 dark:text-violet-400">
                        <Terminal size={14} />
                    </div>
                    <span className="text-[11.5px] leading-tight font-bold text-slate-700 dark:text-slate-300">
                        Clean Architecture
                    </span>
                </div>
            </div>
        </div>
    );
}

