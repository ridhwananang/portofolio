import { ArrowRight, Award, Sparkles } from 'lucide-react';

interface MainHeroProps {
    onOpenTracking?: () => void;
    onOpenContact?: () => void;
}

export default function MainHero({ onOpenContact }: MainHeroProps) {
    return (
        <div
            id="main-hero"
            className="luxury-card transform-gpu relative flex w-full flex-col overflow-hidden rounded-xl p-5 sm:p-6 md:p-7 text-left transition-all duration-300"
        >
            {/* Top Specular Rim Light */}
            <div className="specular-top" />

            {/* Glowing Accent Topline (Gold to Deep Blue) */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-500 opacity-90 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />

            {/* Ambient Internal Light Halos */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-blue-600/10 blur-3xl" />

            {/* Top Status & Architectural Specs Bar */}
            <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-zinc-200/80 dark:border-blue-400/15">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 shadow-2xs">
                    <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
                    </span>
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-amber-600 dark:text-amber-300 uppercase">
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

            {/* Headline Typography with Champagne Gold & Sapphire Sheen */}
            <h1 className="relative z-10 mb-3.5 text-2xl sm:text-3xl lg:text-[2.1rem] leading-tight font-black tracking-tight text-zinc-900 dark:text-white">
                Membangun{' '}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-sky-300 bg-clip-text text-transparent font-black">
                    Aplikasi Web Skala Produksi
                </span>{' '}
                yang Cepat, Aman, & Teruji.
            </h1>

            {/* Sub-headline description */}
            <p className="relative z-10 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Full Stack Software Engineer dengan spesialisasi rekayasa perangkat lunak end-to-end. Berpengalaman merancang arsitektur backend andal menggunakan <strong>Laravel</strong>, antarmuka SPA responsif dengan <strong>React & TypeScript</strong>, serta manajemen database performa tinggi (PostgreSQL, MySQL, & MongoDB).
            </p>

            {/* Action CTA Buttons */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
                <a
                    href="#karya"
                    className="luxury-btn-primary group inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-black tracking-wide"
                >
                    <Sparkles size={13} />
                    <span>Jelajahi Portofolio</span>
                    <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                </a>

                <a
                    href="#sertifikat"
                    className="luxury-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200"
                >
                    <Award size={13} className="text-amber-500 dark:text-amber-400" />
                    <span>Sertifikasi & Lisensi</span>
                </a>
            </div>
        </div>
    );
}
