import { Database, Server, Layout, ArrowRight, Award, Sparkles, Cloud } from 'lucide-react';

interface MainHeroProps {
    onOpenTracking?: () => void;
}

export default function MainHero({ onOpenTracking }: MainHeroProps) {
    return (
        <div
            id="main-hero"
            className="luxury-card transform-gpu relative w-full overflow-hidden rounded-2xl p-6 sm:p-8 md:p-9 transition-all duration-300"
        >
            {/* Top Specular Rim Light */}
            <div className="specular-top" />

            {/* Glowing Ambient Mesh Accents */}
            <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-violet-600/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-cyan-600/10 blur-3xl" />

            {/* Top Status & Architectural Specs Bar */}
            <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 shadow-xs">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
                    </span>
                    <span className="text-[10.5px] font-mono font-semibold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                        Tersedia untuk Proyek & Kontrak Rekayasa
                    </span>
                </div>

                <div className="hidden sm:inline-flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">PSR-12</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">TypeScript</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Stateless Cloud</span>
                </div>
            </div>

            {/* Headline Typography with Titanium & Sapphire Sheen */}
            <h1 className="relative z-10 mb-4 text-2xl sm:text-3xl lg:text-[2.35rem] leading-tight font-black tracking-tight text-zinc-900 dark:text-white">
                Membangun{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
                    Aplikasi Web Skala Produksi
                </span>{' '}
                yang Cepat, Aman, & Teruji.
            </h1>

            {/* Sub-headline description */}
            <p className="relative z-10 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-350">
                Full Stack Web Developer dengan spesialisasi rekayasa perangkat lunak end-to-end. Berpengalaman merancang arsitektur backend andal menggunakan <strong>Laravel</strong>, antarmuka SPA responsif dengan <strong>React & TypeScript</strong>, serta manajemen database performa tinggi (PostgreSQL, MySQL, & MongoDB).
            </p>

            {/* Action CTA Buttons (Luxury 3D Depth) */}
            <div className="relative z-10 mt-7 flex flex-wrap items-center gap-3">
                <a
                    href="#karya"
                    className="luxury-btn-primary group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold tracking-wide"
                >
                    <Sparkles size={14} />
                    <span>Jelajahi Portofolio</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </a>

                <a
                    href="#sertifikat"
                    className="luxury-btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200"
                >
                    <Award size={14} className="text-violet-500" />
                    <span>Sertifikasi & Lisensi</span>
                </a>
            </div>

            {/* 4 Architectural Pillars (Luxury Modules - NOT Flat!) */}
            <div className="relative z-10 mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Pillar 1: Laravel */}
                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-lg dark:hover:border-red-500/30">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-[#FF2D20] shadow-[0_2px_10px_rgba(255,45,32,0.2)] dark:bg-red-950/40">
                            <Server size={16} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Backend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-1">
                            Laravel Ecosystem
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-normal">
                            Eloquent ORM, Queues, Auth, & REST API berstandar clean code.
                        </p>
                    </div>
                </div>

                {/* Pillar 2: React */}
                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/50 hover:shadow-lg dark:hover:border-sky-500/30">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-[#61DAFB] shadow-[0_2px_10px_rgba(97,218,251,0.2)] dark:bg-sky-950/40">
                            <Layout size={16} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Frontend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-1">
                            React & TypeScript
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-normal">
                            Inertia.js SPA, typed components, & fluid 60fps micro-animations.
                        </p>
                    </div>
                </div>

                {/* Pillar 3: Data */}
                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg dark:hover:border-emerald-500/30">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.2)] dark:bg-emerald-950/40">
                            <Database size={16} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Database
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-1">
                            SQL & NoSQL
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-normal">
                            PostgreSQL, MySQL, indexing optimal, & Redis caching layer.
                        </p>
                    </div>
                </div>

                {/* Pillar 4: Cloud */}
                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg dark:hover:border-violet-500/30">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex size-9 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-[0_2px_10px_rgba(139,92,246,0.2)] dark:bg-violet-950/40">
                            <Cloud size={16} />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                            Cloud
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white mb-1">
                            Stateless Storage
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-normal">
                            S3 Object Storage, zero local disk dependency, cloud-native.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
