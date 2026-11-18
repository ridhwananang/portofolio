import { Link } from '@inertiajs/react';
import { CalendarDays, FolderKanban, Plus, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface CockpitHeroBannerProps {
    isAdmin: boolean;
}

export function CockpitHeroBanner({ isAdmin }: CockpitHeroBannerProps) {
    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-lg shadow-slate-900/[0.03] dark:shadow-black/30">
            {/* Ambient Luxury Glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-violet-600/15 dark:bg-violet-600/20 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 right-8 size-72 rounded-full bg-cyan-500/12 dark:bg-cyan-500/15 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
            />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-700 dark:text-violet-300 text-[11px] font-semibold tracking-wide uppercase">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
                            </span>
                            <Sparkles className="size-3 text-violet-500" />
                            {isAdmin ? 'Executive Cockpit' : 'Creator & Engineer Cockpit'}
                        </span>
                        <span
                            suppressHydrationWarning
                            className="text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                            {todayFormatted}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        PMS Executive Cockpit
                    </h1>

                    <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {isAdmin
                            ? 'Pantau kesehatan pengerjaan proyek, efisiensi siklus sprint, progres tugas kanban, dan realisasi anggaran secara terstruktur dan terpadu.'
                            : 'Pantau kesehatan proyek yang Anda tangani, progres siklus sprint, distribusi jobdesk kanban, dan tenggat waktu secara real-time.'}
                    </p>
                </div>

                {/* Action Hub - shrink-0 prevents vertical squishing on desktop */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                    {isAdmin && (
                        <Button
                            asChild
                            className="h-10 sm:h-11 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <Link href="/studio/pms/projects/create">
                                <Plus className="size-4" />
                                <span>Inisialisasi Proyek</span>
                            </Link>
                        </Button>
                    )}

                    <Button
                        asChild
                        variant={isAdmin ? 'outline' : 'default'}
                        className={
                            isAdmin
                                ? 'h-10 sm:h-11 px-4 rounded-xl border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold whitespace-nowrap'
                                : 'h-10 sm:h-11 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 whitespace-nowrap'
                        }
                    >
                        <Link href="/studio/pms/projects">
                            <FolderKanban className="size-4" />
                            <span>Daftar Proyek</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="h-10 sm:h-11 px-4 rounded-xl border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold whitespace-nowrap"
                    >
                        <Link href="/studio/pms/tasks">
                            <Zap className="size-4 text-amber-500" />
                            <span>Kanban Board</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="h-10 sm:h-11 px-4 rounded-xl border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold whitespace-nowrap"
                    >
                        <Link href="/studio/pms/timeline">
                            <CalendarDays className="size-4 text-cyan-500" />
                            <span>Timeline</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
