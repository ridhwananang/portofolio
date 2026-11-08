import { Database, Server, Layout, ArrowRight, Award, Sparkles, Cloud, ShieldCheck } from 'lucide-react';

interface MainHeroProps {
    onOpenTracking?: () => void;
    onOpenContact?: () => void;
}

export default function MainHero({ onOpenTracking, onOpenContact }: MainHeroProps) {
    return (
        <div
            id="main-hero"
            className="luxury-card transform-gpu relative flex w-full flex-col justify-between overflow-hidden rounded-xl p-5 sm:p-6 md:p-7 text-left transition-all duration-300"
        >
            {/* Top Specular Rim Light */}
            <div className="specular-top" />

            {/* Glowing Accent Topline */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 opacity-80" />

            {/* Ambient Internal Light Halos */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-cyan-600/08 blur-3xl" />

            <div>
                {/* Top Status & Architectural Specs Bar */}
                <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-zinc-200/80 dark:border-white/[0.07]">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 shadow-2xs">
                        <span className="relative flex size-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
                        </span>
                        <span className="text-[10px] font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                            Tersedia untuk Proyek & Kontrak Rekayasa
                        </span>
                    </div>

                    <div className="hidden sm:inline-flex items-center gap-2 text-[10.5px] font-mono text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">PSR-12</span>
                        <span>•</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">TypeScript</span>
                        <span>•</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">Clean Architecture</span>
                    </div>
                </div>

                {/* Headline Typography with Titanium & Sapphire Sheen */}
                <h1 className="relative z-10 mb-3 text-2xl sm:text-3xl lg:text-[2.1rem] leading-tight font-black tracking-tight text-zinc-900 dark:text-white">
                    Membangun{' '}
                    <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent font-black">
                        Aplikasi Web Skala Produksi
                    </span>{' '}
                    yang Cepat, Aman, & Teruji.
                </h1>

                {/* Sub-headline description */}
                <p className="relative z-10 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    Full Stack Software Engineer dengan spesialisasi rekayasa perangkat lunak end-to-end. Berpengalaman merancang arsitektur backend andal menggunakan <strong>Laravel</strong>, antarmuka SPA responsif dengan <strong>React & TypeScript</strong>, serta manajemen database performa tinggi (PostgreSQL, MySQL, & MongoDB).
                </p>

                {/* Action CTA Buttons */}
                <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2.5">
                    <a
                        href="#karya"
                        className="luxury-btn-primary group inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold tracking-wide"
                    >
                        <Sparkles size={13} />
                        <span>Jelajahi Portofolio</span>
                        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </a>

                    <a
                        href="#sertifikat"
                        className="luxury-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200"
                    >
                        <Award size={13} className="text-violet-500 dark:text-violet-400" />
                        <span>Sertifikasi & Lisensi</span>
                    </a>

                    {onOpenTracking && (
                        <button
                            type="button"
                            onClick={onOpenTracking}
                            className="luxury-btn-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                        >
                            <ShieldCheck size={13} className="text-emerald-500" />
                            <span>Cek Status Proyek</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 4 Architectural Pillar Cards (Compact Precision Modules) */}
            <div className="relative z-10 mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {/* Pillar 1: Laravel */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.02] shadow-2xs transition-all duration-200 hover:border-red-500/40 dark:hover:border-red-500/40">
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-red-500 to-rose-400 opacity-80" />
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-[#FF2D20] shadow-xs">
                            <Server size={14} />
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Backend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            Laravel Core
                        </h4>
                        <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            Eloquent ORM, Queues, REST API, & Clean Arch.
                        </p>
                    </div>
                </div>

                {/* Pillar 2: React */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.02] shadow-2xs transition-all duration-200 hover:border-sky-400/40 dark:hover:border-sky-400/40">
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-sky-400 to-cyan-400 opacity-80" />
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-sky-400/30 bg-sky-500/10 text-[#0284c7] dark:text-[#61DAFB] shadow-xs">
                            <Layout size={14} />
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Frontend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            React & TS
                        </h4>
                        <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            Inertia.js SPA, typed components, & 60fps UI.
                        </p>
                    </div>
                </div>

                {/* Pillar 3: Data */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.02] shadow-2xs transition-all duration-200 hover:border-emerald-500/40 dark:hover:border-emerald-500/40">
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs">
                            <Database size={14} />
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Database
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            SQL & NoSQL
                        </h4>
                        <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            PostgreSQL, MySQL, indexing, & Mongo pipelines.
                        </p>
                    </div>
                </div>

                {/* Pillar 4: Cloud */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.02] shadow-2xs transition-all duration-200 hover:border-violet-500/40 dark:hover:border-violet-500/40">
                    <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-violet-500 to-purple-400 opacity-80" />
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex size-7 items-center justify-center rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-xs">
                            <Cloud size={14} />
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            DevOps
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            Cloud & Deploy
                        </h4>
                        <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            S3 Storage, Docker, Linux Server, & CI/CD.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
