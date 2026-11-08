import { Terminal, Database, Server, Layout, ArrowRight, Award, Sparkles, Cloud, ShieldCheck } from 'lucide-react';

interface MainHeroProps {
    onOpenTracking?: () => void;
}

export default function MainHero({ onOpenTracking }: MainHeroProps) {
    return (
        <div
            id="main-hero"
            className="glass-card transform-gpu relative w-full overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30"
        >
            {/* Dynamic Mesh Accents inside card (GPU accelerated) */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl transform-gpu will-change-transform dark:from-violet-500/15 dark:via-indigo-500/10"></div>
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-blue-500/15 via-emerald-500/10 to-transparent blur-3xl transform-gpu will-change-transform dark:from-blue-500/15 dark:via-emerald-500/10"></div>

            {/* Top Status & Specs Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-1 text-emerald-700 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="text-[10.5px] font-extrabold tracking-wider uppercase">
                        Tersedia untuk Proyek & Peluang Kerja
                    </span>
                </div>

                <div className="hidden sm:inline-flex items-center gap-2 text-[10.5px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                    <span>PSR-12</span>
                    <span>•</span>
                    <span>TypeScript</span>
                    <span>•</span>
                    <span>Stateless Cloud</span>
                </div>
            </div>

            {/* Refined Headline Typography */}
            <h1 className="mb-4 text-2xl sm:text-3xl lg:text-4xl leading-tight font-black tracking-tight text-slate-900 dark:text-white">
                Membangun{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
                    Aplikasi Web Skala Produksi
                </span>{' '}
                yang Cepat, Aman, & Teruji.
            </h1>

            {/* Sub-headline description */}
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                Full Stack Web Developer yang berfokus pada rekayasa perangkat lunak menyeluruh. Berpengalaman merancang arsitektur backend andal menggunakan <strong>Laravel</strong>, antarmuka SPA responsif dengan <strong>React & TypeScript</strong>, serta manajemen database performa tinggi (PostgreSQL, MySQL, & MongoDB).
            </p>

            {/* Action CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                    href="#karya"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Sparkles size={15} />
                    <span>Jelajahi Proyek Unggulan</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <a
                    href="#sertifikat"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-slate-800"
                >
                    <Award size={15} className="text-violet-500" />
                    <span>Sertifikasi & Lisensi</span>
                </a>
            </div>

            {/* Interactive Engineering Pillars Bento Grid */}
            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Pillar 1: Laravel */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 transition-all duration-300 hover:border-red-500/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-red-500/30 dark:hover:bg-slate-900/70">
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-xl bg-red-500/10 p-2 text-[#FF2D20] transition-transform duration-300 group-hover:scale-110 dark:bg-red-950/40">
                            <Server size={18} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                            Backend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                            Laravel Ecosystem
                        </h4>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Eloquent ORM, Queues, Auth, & REST API berstandar clean code.
                        </p>
                    </div>
                </div>

                {/* Pillar 2: React */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 transition-all duration-300 hover:border-sky-400/50 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-sky-500/30 dark:hover:bg-slate-900/70">
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-xl bg-sky-500/10 p-2 text-[#61DAFB] transition-transform duration-300 group-hover:scale-110 dark:bg-sky-950/40">
                            <Layout size={18} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                            Frontend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                            React & TypeScript
                        </h4>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Inertia.js SPA, typed components, & fluid 60fps micro-animations.
                        </p>
                    </div>
                </div>

                {/* Pillar 3: Data */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 transition-all duration-300 hover:border-emerald-500/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-emerald-500/30 dark:hover:bg-slate-900/70">
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Database size={18} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                            Database
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                            SQL & NoSQL
                        </h4>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            PostgreSQL, MySQL, indexing optimal, & Redis caching layer.
                        </p>
                    </div>
                </div>

                {/* Pillar 4: Cloud & Architecture */}
                <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 transition-all duration-300 hover:border-violet-500/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-violet-500/30 dark:hover:bg-slate-900/70">
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-xl bg-violet-500/10 p-2 text-violet-600 transition-transform duration-300 group-hover:scale-110 dark:bg-violet-950/40 dark:text-violet-400">
                            <Cloud size={18} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                            Cloud
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                            Stateless Storage
                        </h4>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            S3 Object Storage, zero local disk dependency, cloud-native.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
