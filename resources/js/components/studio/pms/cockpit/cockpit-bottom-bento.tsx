import { Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    Layers,
    ListChecks,
    Loader2,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PmsCockpitSprint, PmsCockpitTask, PmsStats } from '@/types/pms';
import {
    formatDateRangeId,
    formatDaysRemainingBadge,
    formatShortDateId,
    getInitials,
    PRIORITY_META,
    resolveAvatarUrl,
    SPRINT_STATUS_META,
    TASK_STATUS_META,
} from './cockpit-utils';

interface CockpitBottomBentoProps {
    stats: PmsStats;
    upcomingDeadlines: PmsCockpitTask[];
    actionableTasks: PmsCockpitTask[];
    activeSprints: PmsCockpitSprint[];
}

type TaskRadarTab = 'deadlines' | 'in_progress' | 'review' | 'todo';

const STATUS_OPTIONS: Array<'todo' | 'in_progress' | 'review' | 'done'> = [
    'todo',
    'in_progress',
    'review',
    'done',
];

export function CockpitBottomBento({
    stats,
    upcomingDeadlines,
    actionableTasks,
    activeSprints,
}: CockpitBottomBentoProps) {
    const [activeTab, setActiveTab] = useState<TaskRadarTab>(
        upcomingDeadlines.length > 0 ? 'deadlines' : 'in_progress'
    );
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

    const radarCounts = useMemo(
        () => ({
            deadlines: upcomingDeadlines.length,
            in_progress: actionableTasks.filter((t) => t.status === 'in_progress').length,
            review: actionableTasks.filter((t) => t.status === 'review').length,
            todo: actionableTasks.filter((t) => t.status === 'todo').length,
        }),
        [upcomingDeadlines, actionableTasks]
    );

    const displayedTasks = useMemo(() => {
        if (activeTab === 'deadlines') {
return upcomingDeadlines;
}

        return actionableTasks.filter((t) => t.status === activeTab);
    }, [activeTab, upcomingDeadlines, actionableTasks]);

    const handleQuickStatusChange = (task: PmsCockpitTask, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
        if (task.status === newStatus || updatingTaskId === task.id) {
return;
}

        setUpdatingTaskId(task.id);
        router.patch(
            `/studio/pms/tasks/${task.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status "${task.title}" diubah ke ${TASK_STATUS_META[newStatus].label}`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui status tugas');
                },
                onFinish: () => {
                    setUpdatingTaskId(null);
                },
            }
        );
    };

    const radarTabs: { id: TaskRadarTab; label: string; count: number }[] = [
        { id: 'deadlines', label: 'Tenggat 14 Hari', count: radarCounts.deadlines },
        { id: 'in_progress', label: 'Dikerjakan', count: radarCounts.in_progress },
        { id: 'review', label: 'Review QA', count: radarCounts.review },
        { id: 'todo', label: 'Antrean', count: radarCounts.todo },
    ];

    // Workload Balance calculations
    const todoCount = stats.todo_tasks ?? 0;
    const inProgressCount = stats.in_progress_tasks ?? 0;
    const reviewCount = stats.review_tasks ?? 0;
    const doneCount = stats.completed_tasks ?? 0;
    const totalTasks = Math.max(stats.total_tasks, todoCount + inProgressCount + reviewCount + doneCount);
    const completionRate =
        stats.completion_rate ?? (totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0);

    const pct = (count: number) => (totalTasks > 0 ? (count / totalTasks) * 100 : 0);

    const pipelineSegments = [
        {
            key: 'done',
            label: 'Selesai',
            count: doneCount,
            widthPct: pct(doneCount),
            barClass: 'bg-emerald-500',
            dotClass: 'bg-emerald-500',
            textClass: 'text-emerald-600 dark:text-emerald-300',
        },
        {
            key: 'review',
            label: 'Review QA',
            count: reviewCount,
            widthPct: pct(reviewCount),
            barClass: 'bg-amber-500',
            dotClass: 'bg-amber-500',
            textClass: 'text-amber-600 dark:text-amber-300',
        },
        {
            key: 'in_progress',
            label: 'Dikerjakan',
            count: inProgressCount,
            widthPct: pct(inProgressCount),
            barClass: 'bg-indigo-500',
            dotClass: 'bg-indigo-500',
            textClass: 'text-indigo-600 dark:text-indigo-300',
        },
        {
            key: 'todo',
            label: 'Antrean To Do',
            count: todoCount,
            widthPct: pct(todoCount),
            barClass: 'bg-slate-400 dark:bg-slate-600',
            dotClass: 'bg-slate-400',
            textClass: 'text-slate-600 dark:text-slate-300',
        },
    ];

    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 Columns: Interactive Task & Deadline Radar */}
            <div className="lg:col-span-7 flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/65 p-5 sm:p-6 backdrop-blur-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="size-4.5 text-amber-500" />
                            <span>Radar Tugas & Tenggat Waktu</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Kelola prioritas dan ubah status tugas langsung dari cockpit.
                        </p>
                    </div>
                    <Link
                        href="/studio/pms/tasks"
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                    >
                        <span>Buka Kanban Board</span>
                        <ArrowUpRight className="size-3.5" />
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 py-3">
                    {radarTabs.map((tab) => {
                        const active = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                                    active
                                        ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/20'
                                        : 'bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                                        active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Task Rows */}
                <div className="flex-1 space-y-2.5 pt-1">
                    {displayedTasks.length === 0 ? (
                        <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                            <CheckCircle2 className="size-8 text-emerald-500/80 mb-2" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {activeTab === 'deadlines'
                                    ? 'Tidak ada tenggat mendesak dalam 14 hari ke depan'
                                    : 'Tidak ada tugas pada kategori ini'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Semua progres pekerjaan terkendali dengan baik.
                            </p>
                        </div>
                    ) : (
                        displayedTasks.slice(0, 6).map((task) => {
                            const statusMeta = TASK_STATUS_META[task.status] ?? TASK_STATUS_META.todo;
                            const priorityMeta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
                            const dueBadge = task.due_date
                                ? formatDaysRemainingBadge(task.days_until_due, 'Telat')
                                : null;
                            const isUpdating = updatingTaskId === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/45 hover:border-violet-500/35 hover:bg-white dark:hover:bg-slate-900/80 transition-all"
                                >
                                    <div className="min-w-0 space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`size-2 rounded-full shrink-0 ${statusMeta.dotClass}`} />
                                            <Link
                                                href={`/studio/pms/projects/${task.project_id}?tab=tasks`}
                                                className="font-semibold text-sm text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-300 transition-colors truncate"
                                            >
                                                {task.title}
                                            </Link>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pl-4">
                                            <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">
                                                {task.project_code || task.project_name}
                                            </span>
                                            {task.sprint_name && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[140px]">{task.sprint_name}</span>
                                                </>
                                            )}
                                            {task.due_date && dueBadge && (
                                                <>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <CalendarDays className="size-3" />
                                                        {formatShortDateId(task.due_date)}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] py-0 px-1.5 font-semibold ${dueBadge.toneClass}`}
                                                    >
                                                        {dueBadge.label}
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Controls: Priority, Assignee & Quick Status Switcher */}
                                    <div className="flex items-center justify-end gap-2 shrink-0 pl-4 sm:pl-0">
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-semibold ${priorityMeta.badgeClass}`}
                                        >
                                            {priorityMeta.label}
                                        </Badge>

                                        {task.assignee && (
                                            <div
                                                title={task.assignee.name}
                                                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300"
                                            >
                                                <Avatar className="size-4">
                                                    <AvatarImage
                                                        src={resolveAvatarUrl(task.assignee.avatar)}
                                                        alt={task.assignee.name}
                                                    />
                                                    <AvatarFallback className="text-[8px] font-bold bg-indigo-500 text-white">
                                                        {getInitials(task.assignee.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="max-w-[78px] truncate">
                                                    {task.assignee.name.split(' ')[0]}
                                                </span>
                                            </div>
                                        )}

                                        {/* Interactive Quick Status Switcher */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    disabled={isUpdating}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-60 ${statusMeta.badgeClass}`}
                                                    aria-label={`Ubah status ${task.title}`}
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="size-3 animate-spin" />
                                                    ) : (
                                                        <span className={`size-1.5 rounded-full ${statusMeta.dotClass}`} />
                                                    )}
                                                    <span>{statusMeta.label}</span>
                                                    <ChevronDown className="size-3 opacity-70" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-40 rounded-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
                                            >
                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400">
                                                    Pindah Status
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {STATUS_OPTIONS.map((opt) => {
                                                    const optMeta = TASK_STATUS_META[opt];
                                                    const isCurrent = task.status === opt;

                                                    return (
                                                        <DropdownMenuItem
                                                            key={opt}
                                                            onClick={() => handleQuickStatusChange(task, opt)}
                                                            className="cursor-pointer flex items-center justify-between text-xs font-medium rounded-lg"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span className={`size-2 rounded-full ${optMeta.dotClass}`} />
                                                                {optMeta.label}
                                                            </span>
                                                            {isCurrent && <Check className="size-3.5 text-violet-500" />}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right 5 Columns: Workload Balance & Active Sprint Cycles */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                {/* 1. Workload Balance / Task Pipeline Distribution */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/65 p-5 sm:p-6 backdrop-blur-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ListChecks className="size-4 text-indigo-500" />
                                <span>Distribusi Pipeline Tugas</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Proporsi beban kerja pada {totalTasks} total tugas
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/25 tabular-nums"
                        >
                            {completionRate}% Selesai
                        </Badge>
                    </div>

                    {/* Multi-segment progress bar */}
                    <div className="h-3 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden flex gap-0.5 p-0.5">
                        {totalTasks === 0 ? (
                            <div className="h-full w-full rounded-full bg-slate-300/60 dark:bg-slate-700/60" />
                        ) : (
                            pipelineSegments.map(
                                (seg) =>
                                    seg.count > 0 && (
                                        <div
                                            key={seg.key}
                                            title={`${seg.label}: ${seg.count} tugas`}
                                            className={`h-full rounded-full ${seg.barClass} transition-all duration-700`}
                                            style={{ width: `${Math.max(seg.widthPct, 4)}%` }}
                                        />
                                    )
                            )
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        {pipelineSegments.map((seg) => (
                            <Link
                                key={seg.key}
                                href="/studio/pms/tasks"
                                className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 hover:border-violet-500/30 transition-all"
                            >
                                <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <span className={`size-2 rounded-full ${seg.dotClass}`} />
                                    {seg.label}
                                </span>
                                <span className={`text-xs font-extrabold tabular-nums ${seg.textClass}`}>
                                    {seg.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 2. Active & Planned Sprints Spotlight */}
                <div className="flex-1 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/65 p-5 sm:p-6 backdrop-blur-xl shadow-sm flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Zap className="size-4 text-amber-500" />
                                <span>Siklus Sprint & Milestone</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Ritme iterasi aktif & target pengiriman sprint
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <Link
                                href="/studio/pms/sprints"
                                className="text-violet-600 dark:text-violet-400 hover:underline"
                            >
                                Sprint
                            </Link>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <Link
                                href="/studio/pms/timeline"
                                className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                            >
                                Timeline <Layers className="size-3" />
                            </Link>
                        </div>
                    </div>

                    {activeSprints.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            Belum ada siklus sprint yang tercatat.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeSprints.slice(0, 3).map((sprint) => {
                                const sMeta = SPRINT_STATUS_META[sprint.status] ?? SPRINT_STATUS_META.planned;
                                const daysInfo =
                                    sprint.days_left !== null && sprint.days_left !== undefined
                                        ? formatDaysRemainingBadge(sprint.days_left)
                                        : null;

                                return (
                                    <Link
                                        key={sprint.id}
                                        href={`/studio/pms/sprints?project_id=${sprint.project_id}`}
                                        className="block p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/45 hover:border-violet-500/35 transition-all space-y-2.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold text-violet-600 dark:text-violet-400">
                                                        {sprint.project_code || sprint.project_name}
                                                    </span>
                                                    <span className="text-slate-400 text-[10px]">•</span>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        {formatDateRangeId(sprint.start_date, sprint.end_date)}
                                                    </span>
                                                </div>
                                                <div className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                                                    {sprint.name}
                                                </div>
                                                {sprint.goal && (
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                        {sprint.goal}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className={`shrink-0 text-[10px] font-semibold ${sMeta.badgeClass}`}>
                                                {sMeta.label}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                                <span>
                                                    {sprint.completed_tasks_count}/{sprint.tasks_count} tugas selesai
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {daysInfo && sprint.status !== 'completed' && (
                                                        <span className="font-medium">{daysInfo.label}</span>
                                                    )}
                                                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                                        {sprint.progress_percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-violet-500 to-cyan-400 transition-all duration-700"
                                                    style={{ width: `${sprint.progress_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
