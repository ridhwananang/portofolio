import { Layers, Plus, Sparkles } from 'lucide-react';
import React from 'react';
import {
    getInitials,
    resolveAvatarUrl,
} from '@/components/studio/pms/cockpit/cockpit-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { PmsTask, PmsUser } from '@/types/pms';
import { KANBAN_COLUMNS } from './kanban-types';

interface KanbanHeaderProps {
    currentUser: PmsUser | null;
    visibleTasks: PmsTask[];
    onCreateTask: () => void;
}

export function KanbanHeader({
    currentUser,
    visibleTasks,
    onCreateTask,
}: KanbanHeaderProps) {
    const totalCount = visibleTasks.length;
    const doneCount = visibleTasks.filter((t) => t.status === 'done').length;
    const progressPercent =
        totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white/85 px-5 py-4 shadow-md shadow-slate-900/[0.03] backdrop-blur-2xl sm:px-6 sm:py-5 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/35">
            {/* Ambient Glows & Hairline */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -left-14 size-56 rounded-full bg-violet-600/12 blur-3xl dark:bg-violet-600/20"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -bottom-20 size-56 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/15"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/45 to-transparent"
            />

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-violet-700 uppercase dark:text-violet-300">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-violet-500" />
                            </span>
                            <Sparkles className="size-3 text-violet-500" />
                            Ruang Kerja Personal
                        </span>

                        {currentUser && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 py-0.5 pr-2.5 pl-1 shadow-2xs dark:border-white/10 dark:bg-slate-950/60">
                                <Avatar className="size-5 border border-violet-500/30">
                                    <AvatarImage
                                        src={resolveAvatarUrl(
                                            currentUser.avatar,
                                        )}
                                        alt={currentUser.name}
                                    />
                                    <AvatarFallback className="bg-violet-600 text-[8.5px] font-bold text-white">
                                        {getInitials(currentUser.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    {currentUser.name}
                                </span>
                                {currentUser.role_title && (
                                    <span className="hidden text-[11px] text-slate-400 sm:inline">
                                        • {currentUser.role_title}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 text-violet-600 shadow-2xs dark:text-violet-400">
                            <Layers className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate font-[family-name:var(--font-brand)] text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                                Kanban &amp; Jobdesk Saya
                            </h1>
                            <p className="truncate text-xs text-slate-500 sm:text-[13px] dark:text-slate-400">
                                Kelola tugas pribadi Anda. Seret &amp; lepas
                                kartu antar kolom untuk memperbarui status
                                secara langsung.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Telemetry + Action CTA */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center lg:shrink-0">
                    <div className="flex min-w-[215px] flex-col gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/60">
                        <div className="flex items-center justify-between gap-4 text-[11.5px]">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                                Progres Saya
                            </span>
                            <span className="font-mono font-extrabold text-emerald-600 tabular-nums dark:text-emerald-400">
                                {doneCount}/{totalCount} ({progressPercent}%)
                            </span>
                        </div>

                        <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800">
                            {KANBAN_COLUMNS.map((col) => {
                                const count = visibleTasks.filter(
                                    (t) => t.status === col.id,
                                ).length;
                                const widthPct =
                                    totalCount > 0
                                        ? (count / totalCount) * 100
                                        : 0;

                                if (widthPct <= 0) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={col.id}
                                        className={`h-full transition-all duration-500 ${col.barClass}`}
                                        style={{ width: `${widthPct}%` }}
                                        title={`${col.shortTitle}: ${count}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        onClick={onCreateTask}
                        className="h-10.5 cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4.5 text-xs font-bold whitespace-nowrap text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 sm:text-[13px]"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Tugas</span>
                    </Button>
                </div>
            </div>
        </section>
    );
}
