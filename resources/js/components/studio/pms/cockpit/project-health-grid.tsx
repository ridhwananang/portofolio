import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    CalendarDays,
    CheckSquare,
    FolderKanban,
    Layers,
    Users,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PmsProjectHealth } from '@/types/pms';
import { ClientPortalLinkButton, getPortalHref } from './client-portal-link-button';
import {
    formatCurrencyIdr,
    formatDateRangeId,
    formatDaysRemainingBadge,
    getInitials,
    PRIORITY_META,
    PROJECT_STATUS_META,
    resolveAvatarUrl,
} from './cockpit-utils';

interface ProjectHealthGridProps {
    projectHealth: PmsProjectHealth[];
    isAdmin: boolean;
}

const FILTER_TABS = [
    { id: 'all', label: 'Semua' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'planning', label: 'Planning' },
    { id: 'review', label: 'Review' },
    { id: 'completed', label: 'Completed' },
] as const;

type FilterTabId = (typeof FILTER_TABS)[number]['id'];

function getProgressBarGradient(progress: number): string {
    if (progress >= 85) {
return 'from-emerald-500 to-teal-400';
}

    if (progress >= 40) {
return 'from-violet-500 via-indigo-500 to-cyan-400';
}

    return 'from-amber-500 to-orange-400';
}

export function ProjectHealthGrid({ projectHealth, isAdmin }: ProjectHealthGridProps) {
    const [statusFilter, setStatusFilter] = useState<FilterTabId>('all');

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: projectHealth.length };

        for (const proj of projectHealth) {
            counts[proj.status] = (counts[proj.status] || 0) + 1;
        }

        return counts;
    }, [projectHealth]);

    const filteredProjects = useMemo(() => {
        if (statusFilter === 'all') {
return projectHealth;
}

        return projectHealth.filter((p) => p.status === statusFilter);
    }, [projectHealth, statusFilter]);

    const visibleProjects = filteredProjects.slice(0, 6);

    const gridLayoutClass =
        visibleProjects.length === 2
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-5'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5';

    return (
        <section className="space-y-4">
            {/* Section Header & Status Filter Pills */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="size-5 text-violet-500" />
                        <span>Kesehatan & Progres Proyek</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Pantau sisa tenggat waktu, distribusi tugas kanban, anggota tim, dan ritme sprint tiap proyek.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
                        {FILTER_TABS.map((tab) => {
                            const count = statusCounts[tab.id] || 0;
                            const active = statusFilter === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        active
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                                            active
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <Link
                        href="/studio/pms/projects"
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 inline-flex items-center gap-1 whitespace-nowrap"
                    >
                        <span>Lihat Semua</span>
                        <ArrowUpRight className="size-3.5" />
                    </Link>
                </div>
            </div>

            {/* Adaptive Grid / Spotlight Content */}
            {projectHealth.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-10 text-center space-y-3">
                    <FolderKanban className="size-8 mx-auto text-slate-400" />
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Belum ada proyek PMS yang aktif
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {isAdmin
                            ? 'Mulai dengan membuat proyek baru atau impor langsung dari Order Klien.'
                            : 'Proyek akan muncul di sini setelah Anda ditugaskan sebagai anggota proyek.'}
                    </p>
                </div>
            ) : visibleProjects.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/50 p-8 text-center space-y-3">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Tidak ada proyek pada kategori status ini.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusFilter('all')}
                        className="rounded-xl cursor-pointer"
                    >
                        Tampilkan Semua Proyek
                    </Button>
                </div>
            ) : visibleProjects.length === 1 ? (
                <SpotlightProjectCard project={visibleProjects[0]} isAdmin={isAdmin} />
            ) : (
                <div className={gridLayoutClass}>
                    {visibleProjects.map((proj) => (
                        <CompactProjectCard key={proj.id} project={proj} isAdmin={isAdmin} />
                    ))}
                </div>
            )}
        </section>
    );
}

function SpotlightProjectCard({ project, isAdmin }: { project: PmsProjectHealth; isAdmin: boolean }) {
    const statusMeta = PROJECT_STATUS_META[project.status] ?? PROJECT_STATUS_META.in_progress;
    const priorityMeta = PRIORITY_META[project.priority] ?? PRIORITY_META.medium;
    const daysBadge = formatDaysRemainingBadge(project.days_left);

    const taskStages = [
        { label: 'To Do', count: project.todo_tasks ?? 0, dot: 'bg-slate-400' },
        { label: 'In Progress', count: project.in_progress_tasks ?? 0, dot: 'bg-indigo-500' },
        { label: 'Review QA', count: project.review_tasks ?? 0, dot: 'bg-amber-500' },
        { label: 'Selesai', count: project.completed_tasks ?? 0, dot: 'bg-emerald-500' },
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 p-6 sm:p-7 backdrop-blur-xl shadow-md hover:border-violet-500/35 transition-all">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-indigo-500/10 blur-3xl"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                {/* Left 7 Cols: Identity, Team, Sprint & Quick Actions */}
                <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                            {project.code}
                        </span>
                        <Badge variant="outline" className={`text-[11px] font-semibold ${statusMeta.badgeClass}`}>
                            <span className={`size-1.5 rounded-full mr-1.5 ${statusMeta.dotClass}`} />
                            {statusMeta.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[11px] font-semibold ${priorityMeta.badgeClass}`}>
                            Prioritas {priorityMeta.label}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <Link
                            href={`/studio/pms/projects/${project.id}`}
                            className="group inline-flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                        >
                            <span>{project.name}</span>
                            <ArrowUpRight className="size-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Klien: <span className="font-medium text-slate-700 dark:text-slate-200">{project.client}</span>
                        </p>
                    </div>

                    {/* Meta Strip: Active Sprint, Schedule, Team Stack */}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                        {project.active_sprint_name && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                <Zap className="size-3.5 text-amber-500" />
                                <span>{project.active_sprint_name}</span>
                            </div>
                        )}

                        {(project.start_date || project.end_date) && (
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <CalendarDays className="size-3.5 text-cyan-500" />
                                <span>{formatDateRangeId(project.start_date, project.end_date)}</span>
                            </div>
                        )}

                        {project.members && project.members.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {project.members.map((member) => (
                                        <Avatar
                                            key={member.id}
                                            title={`${member.name} (${member.role_in_project})`}
                                            className="size-7 ring-2 ring-white dark:ring-slate-900"
                                        >
                                            <AvatarImage src={resolveAvatarUrl(member.avatar)} alt={member.name} />
                                            <AvatarFallback className="text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-200">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Users className="size-3" />
                                    {project.members.length} tim
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quick Workspace Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <Button
                            asChild
                            size="sm"
                            className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold"
                        >
                            <Link href={`/studio/pms/projects/${project.id}`}>
                                Buka Workspace
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 font-semibold"
                        >
                            <Link href={`/studio/pms/tasks?project_id=${project.id}`}>
                                <CheckSquare className="size-3.5 text-indigo-500" />
                                Kanban Proyek
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 font-semibold"
                        >
                            <Link href={`/studio/pms/timeline?project_id=${project.id}`}>
                                <Layers className="size-3.5 text-cyan-500" />
                                Timeline Gantt
                            </Link>
                        </Button>
                        <ClientPortalLinkButton project={project} isAdmin={isAdmin} />
                    </div>
                </div>

                {/* Right 5 Cols: Progress & 4-Stage Task Breakdown */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/50 p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Penyelesaian Proyek
                            </div>
                            <Link
                                href={`/studio/pms/projects/${project.id}?tab=reports`}
                                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-0.5"
                            >
                                Lihat rincian progres <ArrowUpRight className="size-3" />
                            </Link>
                        </div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                            {project.progress}%
                        </span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressBarGradient(project.progress)} transition-all duration-700`}
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>

                    {/* 4-Stage Task Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 pt-1">
                        {taskStages.map((stage) => (
                            <div
                                key={stage.label}
                                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/5"
                            >
                                <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span className={`size-2 rounded-full ${stage.dot}`} />
                                    {stage.label}
                                </span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                                    {stage.count}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <Badge variant="outline" className={`font-semibold ${daysBadge.toneClass}`}>
                            <CalendarDays className="size-3 mr-1" />
                            {daysBadge.label}
                        </Badge>
                        <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {project.active_sprints} Sprint Aktif • {project.open_tasks} Tugas Terbuka
                        </span>
                    </div>

                    {isAdmin && project.budget > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                            <span>Anggaran: {formatCurrencyIdr(project.budget)}</span>
                            <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                                Burn rate {project.burn_rate}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CompactProjectCard({ project, isAdmin }: { project: PmsProjectHealth; isAdmin: boolean }) {
    const statusMeta = PROJECT_STATUS_META[project.status] ?? PROJECT_STATUS_META.in_progress;
    const priorityMeta = PRIORITY_META[project.priority] ?? PRIORITY_META.medium;
    const daysBadge = formatDaysRemainingBadge(project.days_left);
    const hasPortalLink = !isAdmin && getPortalHref(project) !== null;

    return (
        <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/65 p-5 backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-violet-500/40 transition-all flex flex-col justify-between">
            <Link
                href={`/studio/pms/projects/${project.id}`}
                className="block flex-1 focus:outline-none"
            >
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300">
                                {project.code}
                            </span>
                            <Badge variant="outline" className={`text-[10px] font-semibold ${priorityMeta.badgeClass}`}>
                                {priorityMeta.label}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-1">
                            {project.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            Klien: {project.client}
                        </p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-[11px] font-semibold ${statusMeta.badgeClass}`}>
                        {statusMeta.label}
                    </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span>Penyelesaian ({project.completed_tasks ?? 0}/{project.total_tasks} tugas)</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                            {project.progress}%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressBarGradient(project.progress)} transition-all duration-700`}
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>
            </Link>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={`text-[11px] font-semibold whitespace-nowrap ${daysBadge.toneClass}`}>
                        <CalendarDays className="size-3 mr-1" />
                        {daysBadge.label}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {project.active_sprints} Sprint • {project.open_tasks} Open
                    </span>
                </div>

                {((project.members && project.members.length > 0) || (isAdmin && project.budget > 0) || hasPortalLink) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex -space-x-1.5">
                            {project.members?.slice(0, 4).map((member) => (
                                <Avatar
                                    key={member.id}
                                    title={`${member.name} (${member.role_in_project})`}
                                    className="size-6 ring-2 ring-white dark:ring-slate-900"
                                >
                                    <AvatarImage src={resolveAvatarUrl(member.avatar)} alt={member.name} />
                                    <AvatarFallback className="text-[9px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-200">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {isAdmin && project.budget > 0 && (
                            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                                Burn {project.burn_rate}%
                            </span>
                        )}
                        {hasPortalLink && (
                            <ClientPortalLinkButton
                                project={project}
                                isAdmin={isAdmin}
                                size="sm"
                                className="h-7 px-2.5 text-[11px]"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
