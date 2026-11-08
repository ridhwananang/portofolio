import { Database, Server, Layout, ArrowRight, Award, Sparkles, Cloud } from 'lucide-react';

interface MainHeroProps {
    onOpenTracking?: () => void;
}

export default function MainHero({ onOpenTracking }: MainHeroProps) {
    return (
        <div
            id="main-hero"
            className="glass-card transform-gpu relative w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 md:p-9 shadow-xs dark:border-white/10 dark:bg-[#0f1117] transition-all duration-200"
        >
            {/* Top Status & Specs Bar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10.5px] font-mono font-semibold tracking-wider uppercase">
                        Tersedia untuk Proyek & Kontrak Rekayasa
                    </span>
                </div>

                <div className="hidden sm:inline-flex items-center gap-2 text-[10.5px] font-mono text-zinc-400 dark:text-zinc-500">
                    <span>PSR-12</span>
                    <span>•</span>
                    <span>TypeScript</span>
                    <span>•</span>
                    <span>Stateless Cloud</span>
                </div>
            </div>

            {/* Headline Typography */}
            <h1 className="mb-3.5 text-2xl sm:text-3xl lg:text-[2.25rem] leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Membangun{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
                    Aplikasi Web Skala Produksi
                </span>{' '}
                yang Cepat, Aman, & Teruji.
            </h1>

            {/* Sub-headline description */}
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Full Stack Web Developer dengan spesialisasi rekayasa perangkat lunak end-to-end. Berpengalaman merancang arsitektur backend andal menggunakan <strong>Laravel</strong>, antarmuka SPA responsif dengan <strong>React & TypeScript</strong>, serta manajemen database performa tinggi (PostgreSQL, MySQL, & MongoDB).
            </p>

            {/* Action CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                    href="#karya"
                    className="group inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-98 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                    <Sparkles size={13} />
                    <span>Jelajahi Portofolio</span>
                    <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>

                <a
                    href="#sertifikat"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-2xs transition-all hover:bg-zinc-50 active:scale-98 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                >
                    <Award size={13} className="text-violet-500" />
                    <span>Sertifikasi & Lisensi</span>
                </a>
            </div>

            {/* Engineering Pillars - Compact 4-Card Grid */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Pillar 1: Laravel */}
                <div className="group flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 transition-all hover:border-red-500/40 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-red-500/30 dark:hover:bg-zinc-900">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="rounded-lg bg-red-500/10 p-1.5 text-[#FF2D20] dark:bg-red-950/40">
                            <Server size={15} />
                        </div>
                        <span className="text-[9.5px] font-mono font-medium text-zinc-400 uppercase">
                            Backend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                            Laravel Ecosystem
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                            ORM, Queues, Auth, & REST API berstandar clean code.
                        </p>
                    </div>
                </div>

                {/* Pillar 2: React */}
                <div className="group flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 transition-all hover:border-sky-400/50 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-sky-500/30 dark:hover:bg-zinc-900">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="rounded-lg bg-sky-500/10 p-1.5 text-[#61DAFB] dark:bg-sky-950/40">
                            <Layout size={15} />
                        </div>
                        <span className="text-[9.5px] font-mono font-medium text-zinc-400 uppercase">
                            Frontend
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                            React & TypeScript
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                            Inertia.js SPA, typed components, & 60fps animations.
                        </p>
                    </div>
                </div>

                {/* Pillar 3: Data */}
                <div className="group flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 transition-all hover:border-emerald-500/40 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-emerald-500/30 dark:hover:bg-zinc-900">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Database size={15} />
                        </div>
                        <span className="text-[9.5px] font-mono font-medium text-zinc-400 uppercase">
                            Database
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                            SQL & NoSQL
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                            PostgreSQL, MySQL, query indexing, & Redis cache.
                        </p>
                    </div>
                </div>

                {/* Pillar 4: Cloud */}
                <div className="group flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 transition-all hover:border-violet-500/40 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-violet-500/30 dark:hover:bg-zinc-900">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                            <Cloud size={15} />
                        </div>
                        <span className="text-[9.5px] font-mono font-medium text-zinc-400 uppercase">
                            Cloud
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                            Stateless Storage
                        </h4>
                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                            S3 Object Storage, zero disk dependency, cloud-native.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
