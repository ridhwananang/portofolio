import { Terminal, Database, Server, Layout } from 'lucide-react';

export default function MainHero() {
    return (
        <div
            id="main-hero"
            className="glass-card relative w-full overflow-hidden rounded-[2.2rem] p-8 shadow-xl shadow-slate-100/40 md:p-11 dark:shadow-none"
        >
            {/* Dynamic Background Mesh Accents inside the card */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 blur-xl dark:from-violet-500/5 dark:to-indigo-500/5"></div>
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 blur-xl dark:from-blue-500/5 dark:to-emerald-500/5"></div>

            {/* Availability Status Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-100/80 bg-emerald-50 px-3.5 py-1.5 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase">
                    Tersedia untuk kolaborasi & proyek backend
                </span>
            </div>

            {/* Premium Big Typography Heading */}
            <h2 className="mb-6 text-3xl leading-[1.15] font-black tracking-tight text-slate-900 md:text-5xl dark:text-white">
                Halo, saya membangun <br />
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text pb-1 font-extrabold text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-indigo-400">
                    Aplikasi Web Scalable
                </span>{' '}
                <br />
                & siap produksi.
            </h2>

            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Saya adalah seorang Full Stack Developer dan mahasiswa Teknik Informatika yang berfokus pada rekayasa perangkat lunak secara end-to-end. Spesialisasi saya meliputi perancangan arsitektur backend menggunakan Laravel, pembuatan antarmuka modern yang interaktif dengan React + TypeScript, serta optimasi performa database SQL & NoSQL (MongoDB). Dengan pendekatan Clean Code dan DevOps workflow yang teratur, saya berdedikasi membangun aplikasi web modern yang aman, berkinerja tinggi, dan mudah dipelihara pada skala produksi.
            </p>

            {/* High-fidelity Micro Stats/Aesthetic pills */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-100/85 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/60 hover:bg-slate-100/20 dark:hover:bg-slate-900/20 hover:shadow-sm">
                    <div className="rounded-xl bg-red-100/60 p-2 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        <Server size={15} />
                    </div>
                    <span className="text-xs leading-tight font-bold text-slate-700 dark:text-slate-300">
                        Laravel Backend
                    </span>
                </div>

                <div className="flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-100/85 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/60 hover:bg-slate-100/20 dark:hover:bg-slate-900/20 hover:shadow-sm">
                    <div className="dark:text-sky-450 rounded-xl bg-sky-100/60 p-2 text-sky-600 dark:bg-sky-950/40">
                        <Layout size={15} />
                    </div>
                    <span className="text-xs leading-tight font-bold text-slate-700 dark:text-slate-300">
                        React + TS SPA
                    </span>
                </div>

                <div className="flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-100/85 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/60 hover:bg-slate-100/20 dark:hover:bg-slate-900/20 hover:shadow-sm">
                    <div className="rounded-xl bg-emerald-100/60 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Database size={15} />
                    </div>
                    <span className="text-xs leading-tight font-bold text-slate-700 dark:text-slate-300">
                        SQL & NoSQL
                    </span>
                </div>

                <div className="flex cursor-default items-center gap-2.5 rounded-2xl border border-slate-100/85 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-950/40 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/60 hover:bg-slate-100/20 dark:hover:bg-slate-900/20 hover:shadow-sm">
                    <div className="rounded-xl bg-violet-100/60 p-2 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                        <Terminal size={15} />
                    </div>
                    <span className="text-xs leading-tight font-bold text-slate-700 dark:text-slate-300">
                        Clean Standard
                    </span>
                </div>
            </div>
        </div>
    );
}
