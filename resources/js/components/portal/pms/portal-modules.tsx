import {
    ArrowRight,
    BarChart3,
    Calendar,
    Check,
    CheckCircle2,
    CheckSquare,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Eye,
    FileText,
    FolderKanban,
    Globe,
    Layers,
    ListTodo,
    Paperclip,
    PieChart,
    Printer,
    RotateCcw,
    Search,
    Sparkles,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AttachmentPreviewModal } from '@/components/studio/pms/attachments/attachment-preview-modal';
import {
    getAttachmentExtension,
    getAttachmentStyleMeta,
    resolveAttachmentDownloadUrl,
} from '@/components/studio/pms/attachments/attachment-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WordDocumentViewer } from '@/components/ui/word-rich-editor';
import type {
    ClientAttachment,
    ClientMetrics,
    ClientProject,
    ClientTask,
} from './portal-types';
import {
    formatDate,
    formatFileSize,
    getDayDuration,
    getPriorityMeta,
    getSprintStatusMeta,
    getStatusMeta,
    resolveAttachmentUrl,
    resolveAvatarUrl,
} from './portal-utils';

/* -------------------------------------------------------------------------- */
/* MODULE 0: CETAK BIRU TEKNIS (BLUEPRINT)                                    */
/* -------------------------------------------------------------------------- */
export function PortalBlueprintModule({
    project,
    onOpenAttachments,
}: {
    project: ClientProject;
    onOpenAttachments?: () => void;
}) {
    const detail = project.detail;
    const hasTechStack =
        Array.isArray(detail?.tech_stack) && detail.tech_stack.length > 0;
    const attachmentCount = project.attachments?.length ?? 0;

    return (
        <div className="min-w-0 max-w-full space-y-6">
            <div className="luxury-card relative space-y-4 rounded-3xl p-5 sm:p-6">
                <div className="specular-top" />
                <div className="flex items-start gap-3 sm:items-center">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <FileText className="size-4.5" />
                    </span>
                    <div>
                        <h2 className="font-[family-name:var(--font-brand)] text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                            Dokumen Cetak Biru &amp; Spesifikasi Teknis
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Lembar dokumen resmi sasaran, ruang lingkup
                            kerja, latar belakang, dan luaran proyek.
                        </p>
                    </div>
                </div>

                {/* Compact Quick Links & Tech Stack Strip */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/75 pt-3.5 text-xs dark:border-slate-800/80">
                    <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        <Sparkles className="size-3.5 shrink-0 text-amber-500" />
                        Tautan Cepat:
                    </span>

                    {detail?.live_demo_url ? (
                        <a
                            href={detail.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50/90 px-3 py-1 font-semibold text-sky-800 transition-colors hover:border-sky-500 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-200"
                        >
                            <Globe className="size-3.5 shrink-0 text-sky-500" />
                            <span>Preview Staging</span>
                            <ExternalLink className="size-3 shrink-0 opacity-75" />
                        </a>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-200 bg-slate-50 px-3 py-1 text-slate-400 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-500">
                            <Globe className="size-3.5 shrink-0 opacity-70" />
                            <span>Staging belum diatur</span>
                        </span>
                    )}

                    {onOpenAttachments && (
                        <button
                            type="button"
                            onClick={onOpenAttachments}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 font-semibold text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-300"
                        >
                            <Paperclip className="size-3.5 shrink-0" />
                            <span>Lampiran ({attachmentCount})</span>
                            <ArrowRight className="size-3 shrink-0" />
                        </button>
                    )}

                    {hasTechStack && (
                        <div className="flex w-full flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/70">
                            <span className="mr-1 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                Teknologi ({detail.tech_stack?.length}):
                            </span>
                            {detail.tech_stack?.map((tech, idx) => (
                                <span
                                    key={idx}
                                    className="rounded-lg border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-300"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <WordDocumentViewer
                content={detail?.objective || ''}
                label="1. Sasaran Utama & Key Results (Objectives)"
            />

            <WordDocumentViewer
                content={detail?.scope || ''}
                label="2. Ruang Lingkup Teknis (Scope of Work)"
            />

            <WordDocumentViewer
                content={detail?.background || ''}
                label="3. Latar Belakang Proyek & Masalah Bisnis"
            />

            <WordDocumentViewer
                content={detail?.deliverables || ''}
                label="4. Hasil Akhir & Deliverables"
            />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* MODULE 1: SPRINT CYCLES (SESUAI STUDIO PMS/PROJECTS/SHOW)                  */
/* -------------------------------------------------------------------------- */
interface SprintsModuleProps {
    project: ClientProject;
    onOpenSprintTasks: (sprintId: number) => void;
}

export function PortalSprintsModule({
    project,
    onOpenSprintTasks,
}: SprintsModuleProps) {
    const activeCount = project.sprints.filter(
        (s) => s.status === 'active',
    ).length;
    const completedCount = project.sprints.filter(
        (s) => s.status === 'completed',
    ).length;
    const plannedCount = project.sprints.filter(
        (s) => s.status === 'planned',
    ).length;

    return (
        <div className="space-y-6">
            <div className="luxury-card relative rounded-3xl p-5 sm:p-6">
                <div className="specular-top" />
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <h2 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                            <span className="flex size-8 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
                                <Zap className="size-4" />
                            </span>
                            Siklus Sprint Proyek
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pengembangan fitur dibagi ke dalam iterasi terukur
                            dan fokus pada target deliverable tiap fase.
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 text-[11px] font-bold">
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
                            {activeCount} Aktif
                        </span>
                        <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-blue-700 dark:text-blue-300">
                            {completedCount} Selesai
                        </span>
                        {plannedCount > 0 && (
                            <span className="rounded-full border border-slate-400/25 bg-slate-500/10 px-2.5 py-1 text-slate-600 dark:text-slate-300">
                                {plannedCount} Direncanakan
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {project.sprints.length === 0 ? (
                <div className="luxury-card rounded-3xl border-dashed p-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    Belum ada siklus sprint untuk proyek ini.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {project.sprints.map((sprint, idx) => {
                        const sprintTasks = project.tasks.filter(
                            (t) => t.sprint_id === sprint.id,
                        );
                        const doneCount = sprintTasks.filter(
                            (t) => t.status === 'done',
                        ).length;
                        const totalCount = sprintTasks.length;
                        const percent =
                            totalCount > 0
                                ? Math.round((doneCount / totalCount) * 100)
                                : sprint.progress_percentage;
                        const sprintMeta = getSprintStatusMeta(sprint.status);
                        const duration = getDayDuration(
                            sprint.start_date,
                            sprint.end_date,
                        );

                        return (
                            <div
                                key={sprint.id}
                                className="luxury-card luxury-card-interactive relative flex flex-col justify-between space-y-4 overflow-hidden rounded-3xl p-5"
                            >
                                <div className="specular-top" />

                                <div className="space-y-3">
                                    {/* Top Status Row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge
                                            className={`gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${sprintMeta.className}`}
                                        >
                                            <span
                                                className={`size-2 rounded-full ${sprintMeta.dotColor} ${
                                                    sprint.status === 'active'
                                                        ? 'animate-pulse'
                                                        : ''
                                                }`}
                                            />
                                            {sprintMeta.label}
                                        </Badge>

                                        <span className="font-mono text-[10.5px] font-bold text-slate-400">
                                            Tahap #{idx + 1} • {duration}h
                                        </span>
                                    </div>

                                    {/* Sprint Title */}
                                    <h3 className="font-[family-name:var(--font-brand)] text-base leading-snug font-extrabold text-slate-900 dark:text-white">
                                        {sprint.name}
                                    </h3>

                                    {/* Goal Box */}
                                    {sprint.goal ? (
                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3.5 text-xs text-slate-700 dark:border-slate-800/80 dark:bg-[#080f20]/90 dark:text-slate-300">
                                            <span className="mb-1 block text-[10px] font-bold tracking-wider text-violet-700 uppercase dark:text-violet-400">
                                                Sasaran / Goal:
                                            </span>
                                            <p className="leading-relaxed">
                                                {sprint.goal}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">
                                            Belum ada target sasaran yang
                                            ditulis.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {/* Progress Bar */}
                                    <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            <span>Progres Tugas</span>
                                            <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                                                {percent}% ({doneCount}/
                                                {totalCount} Selesai)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    percent === 100
                                                        ? 'bg-emerald-500'
                                                        : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer: Dates & Jump to Sprint Tasks */}
                                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800/80">
                                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                            <Calendar className="size-3.5 shrink-0 text-violet-500" />
                                            <span>
                                                {formatDate(sprint.start_date)}{' '}
                                                – {formatDate(sprint.end_date)}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onOpenSprintTasks(sprint.id)
                                            }
                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
                                        >
                                            <span>{totalCount} Tugas</span>
                                            <ArrowRight className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* MODULE 2: DAFTAR TUGAS & SUBTASK (SESUAI STUDIO PMS/PROJECTS/SHOW)         */
/* -------------------------------------------------------------------------- */
interface TasksModuleProps {
    project: ClientProject;
    selectedSprintFilter: number | 'all';
    onChangeSprintFilter: (sprintId: number | 'all') => void;
}

export function PortalTasksModule({
    project,
    selectedSprintFilter,
    onChangeSprintFilter,
}: TasksModuleProps) {
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'todo' | 'in_progress' | 'review' | 'done'
    >('all');
    const [searchQuery, setSearchQuery] = useState('');

    const statusCounts = useMemo(
        () => ({
            all: project.tasks.length,
            in_progress: project.tasks.filter((t) => t.status === 'in_progress')
                .length,
            review: project.tasks.filter((t) => t.status === 'review').length,
            done: project.tasks.filter((t) => t.status === 'done').length,
            todo: project.tasks.filter((t) => t.status === 'todo').length,
        }),
        [project.tasks],
    );

    const filteredTasks = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return project.tasks.filter((t) => {
            const matchesSprint =
                selectedSprintFilter === 'all' ||
                t.sprint_id === selectedSprintFilter;
            const matchesStatus =
                statusFilter === 'all' || t.status === statusFilter;
            const matchesSearch =
                !q ||
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                t.assignee_role.toLowerCase().includes(q) ||
                t.assignee_name.toLowerCase().includes(q);

            return matchesSprint && matchesStatus && matchesSearch;
        });
    }, [project.tasks, selectedSprintFilter, statusFilter, searchQuery]);

    const filterChips = [
        { key: 'all', label: 'Semua', count: statusCounts.all },
        {
            key: 'in_progress',
            label: 'In Progress',
            count: statusCounts.in_progress,
        },
        { key: 'review', label: 'Review / QA', count: statusCounts.review },
        { key: 'done', label: 'Selesai', count: statusCounts.done },
        { key: 'todo', label: 'To Do', count: statusCounts.todo },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="luxury-card relative overflow-hidden rounded-3xl">
                <div className="specular-top" />

                {/* Tier 1: Title + Search & Sprint Dropdown */}
                <div className="flex flex-col justify-between gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                            <span className="flex size-8 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                <ListTodo className="size-4" />
                            </span>
                            Daftar Tugas &amp; Subtask
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Rincian tiket pekerjaan, penanggung jawab teknis, dan
                            checklist subtask di tiap tiket.
                        </p>
                    </div>

                    <div className="no-print flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-60">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari tugas atau PIC..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 rounded-xl border-slate-200/90 bg-white pr-8 pl-8.5 text-xs shadow-2xs dark:border-slate-800 dark:bg-[#0c152a]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Bersihkan pencarian"
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {project.sprints.length > 0 && (
                            <select
                                aria-label="Filter berdasarkan sprint"
                                value={selectedSprintFilter}
                                onChange={(e) =>
                                    onChangeSprintFilter(
                                        e.target.value === 'all'
                                            ? 'all'
                                            : Number(e.target.value),
                                    )
                                }
                                className="h-9 cursor-pointer rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-[#0c152a] dark:text-slate-200"
                            >
                                <option value="all">Semua Sprint</option>
                                {project.sprints.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Tier 2: Status Filter Chips Strip */}
                <div className="no-print flex scrollbar-none items-center gap-1.5 overflow-x-auto border-t border-slate-200/75 bg-slate-50/70 px-5 py-2.5 sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/45">
                    {filterChips.map((chip) => {
                        const active = statusFilter === chip.key;

                        return (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => setStatusFilter(chip.key)}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                                    active
                                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/25'
                                        : 'border border-slate-200/90 bg-white text-slate-600 hover:border-violet-500/30 dark:border-slate-800 dark:bg-[#0c152a] dark:text-slate-300'
                                }`}
                            >
                                <span>{chip.label}</span>
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tabular-nums ${
                                        active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {chip.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {filteredTasks.length === 0 ? (
                <div className="luxury-card space-y-3 rounded-3xl border-dashed p-12 text-center">
                    <Search className="mx-auto size-8 text-slate-300 dark:text-slate-700" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Tidak ada tugas yang cocok
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Ubah filter sprint, status, atau kata kunci
                            pencarian untuk melihat daftar tugas.
                        </p>
                    </div>
                    {(statusFilter !== 'all' ||
                        selectedSprintFilter !== 'all' ||
                        searchQuery) && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setStatusFilter('all');
                                onChangeSprintFilter('all');
                                setSearchQuery('');
                            }}
                            className="cursor-pointer rounded-xl text-xs font-semibold"
                        >
                            <RotateCcw className="mr-1.5 size-3.5" />
                            Reset Filter
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task: ClientTask) => {
                        const tMeta = getStatusMeta(task.status);
                        const pMeta = getPriorityMeta(task.priority);
                        const subtasks = task.subtasks || [];
                        const doneSub = subtasks.filter(
                            (s) => s.is_done,
                        ).length;
                        const subPercent =
                            subtasks.length > 0
                                ? Math.round((doneSub / subtasks.length) * 100)
                                : 0;

                        return (
                            <div
                                key={task.id}
                                className="luxury-card relative space-y-4 overflow-hidden rounded-3xl p-5 transition-colors hover:border-violet-500/35"
                            >
                                <div className="specular-top" />

                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`size-2 rounded-full ${tMeta.dotColor} shrink-0`}
                                            />
                                            <h3 className="font-[family-name:var(--font-brand)] text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                                                {task.title}
                                            </h3>
                                            {task.sprint && (
                                                <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300">
                                                    {task.sprint.name}
                                                </span>
                                            )}
                                            <Badge
                                                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tMeta.className}`}
                                            >
                                                {tMeta.label}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${pMeta.className}`}
                                            >
                                                {pMeta.label}
                                            </Badge>
                                        </div>
                                        {task.description && (
                                            <p className="pl-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* PIC & Deadline */}
                                    <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap">
                                        <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-100/90 px-3 py-1.5 dark:border-slate-700/70 dark:bg-slate-800/80">
                                            <img
                                                src={resolveAvatarUrl(
                                                    task.assignee_avatar,
                                                    task.assignee_name,
                                                )}
                                                alt={task.assignee_name}
                                                className="size-6 shrink-0 rounded-full object-cover"
                                                onError={(e) => {
                                                    (
                                                        e.currentTarget as HTMLImageElement
                                                    ).src = resolveAvatarUrl(
                                                        null,
                                                        task.assignee_name,
                                                    );
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                                                    {task.assignee_name}
                                                </span>
                                                <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
                                                    {task.assignee_role}
                                                </span>
                                            </div>
                                        </div>

                                        {task.due_date && (
                                            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-300">
                                                <Clock className="size-3.5 text-slate-400" />
                                                {formatDate(task.due_date)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Subtasks Checklist */}
                                <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        <span>
                                            Subtask Checklist ({doneSub}/
                                            {subtasks.length})
                                        </span>
                                        {subtasks.length > 0 && (
                                            <span className="font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                                                {subPercent}% Terverifikasi
                                            </span>
                                        )}
                                    </div>

                                    {subtasks.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 italic">
                                            Tidak ada rincian subtask terpisah
                                            pada tiket ini.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {subtasks.map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className={`flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-xs ${
                                                        sub.is_done
                                                            ? 'border-emerald-200/80 bg-emerald-50/70 text-slate-800 dark:border-emerald-800/50 dark:bg-emerald-950/20 dark:text-slate-100'
                                                            : 'border-slate-200/70 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-[#080f20]/70 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <div
                                                            className={`flex size-4.5 shrink-0 items-center justify-center rounded-md ${
                                                                sub.is_done
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'border border-slate-300 dark:border-slate-600'
                                                            }`}
                                                        >
                                                            {sub.is_done && (
                                                                <Check className="size-3" />
                                                            )}
                                                        </div>
                                                        <span className="truncate font-medium">
                                                            {sub.title}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            sub.is_done
                                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                                : 'bg-slate-200/70 text-slate-500 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        {sub.is_done
                                                            ? 'Selesai'
                                                            : 'Pending'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* MODULE 3: LAPORAN PROGRES (100% SESUAI STUDIO PMS/PROJECTS/SHOW)           */
/* -------------------------------------------------------------------------- */
interface ReportsModuleProps {
    project: ClientProject;
    metrics: ClientMetrics;
    onCopySummary: () => void;
    copiedSummary: boolean;
}

export function PortalReportsModule({
    project,
    metrics,
    onCopySummary,
    copiedSummary,
}: ReportsModuleProps) {
    const totalTasks = metrics.total_tasks;
    const doneRatio =
        totalTasks > 0
            ? Math.round((metrics.done_tasks / totalTasks) * 100)
            : 0;
    const reviewRatio =
        totalTasks > 0
            ? Math.round((metrics.review_tasks / totalTasks) * 100)
            : 0;
    const inProgressRatio =
        totalTasks > 0
            ? Math.round((metrics.in_progress_tasks / totalTasks) * 100)
            : 0;
    const todoRatio =
        totalTasks > 0
            ? Math.max(0, 100 - doneRatio - reviewRatio - inProgressRatio)
            : 0;

    const totalSprints = project.sprints.length;
    const completedSprints = project.sprints.filter(
        (s) => s.status === 'completed',
    ).length;
    const activeSprints = project.sprints.filter(
        (s) => s.status === 'active',
    ).length;
    const sprintHealthPct =
        totalSprints > 0
            ? Math.round((completedSprints / totalSprints) * 100)
            : 0;

    const unassignedTasks = project.tasks.filter((t) => !t.sprint_id);
    const members = project.members || [];

    const renderSubtaskList = (task: ClientTask) => {
        const subtasks = task.subtasks || [];

        if (subtasks.length === 0) {
            return null;
        }

        return (
            <div className="ml-1 space-y-1.5 border-l-2 border-slate-200 pt-1 pl-2 sm:pl-3 dark:border-slate-800">
                {subtasks.map((st) => (
                    <div
                        key={st.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5 text-xs dark:border-slate-800/60 dark:bg-[#080f20]/60"
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            {st.is_done ? (
                                <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <Check className="size-3 stroke-[3]" />
                                </div>
                            ) : (
                                <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-[10px] text-slate-400 dark:border-slate-600 dark:bg-slate-800">
                                    ○
                                </div>
                            )}
                            <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {st.title}
                            </span>
                        </div>
                        <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                st.is_done
                                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800'
                            }`}
                        >
                            {st.is_done ? 'Selesai' : 'Pending'}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const renderTaskBreakdownCard = (task: ClientTask) => {
        const subtasks = task.subtasks || [];
        const tDone = subtasks.filter((s) => s.is_done).length;
        const tTotal = subtasks.length;
        const tRatio =
            tTotal > 0
                ? Math.round((tDone / tTotal) * 100)
                : task.status === 'done'
                  ? 100
                  : 0;
        const tMeta = getStatusMeta(task.status);

        return (
            <div
                key={task.id}
                className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800/80 dark:bg-[#0c152a]"
            >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className={`size-2 rounded-full ${tMeta.dotColor} shrink-0`}
                        />
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {task.title}
                        </span>
                        <Badge
                            variant="outline"
                            className={`shrink-0 px-1.5 py-0.5 text-[9.5px] font-semibold ${tMeta.className}`}
                        >
                            {tMeta.label}
                        </Badge>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {tTotal > 0 ? (
                            <span className="text-[10.5px] font-bold text-slate-600 tabular-nums dark:text-slate-300">
                                {tDone}/{tTotal} Subtask ({tRatio}%)
                            </span>
                        ) : (
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    task.status === 'done'
                                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                            >
                                {task.status === 'done'
                                    ? 'Tuntas'
                                    : 'Dalam Proses'}
                            </span>
                        )}
                    </div>
                </div>
                {renderSubtaskList(task)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Export Actions */}
            <div className="luxury-card relative rounded-3xl p-5 sm:p-6">
                <div className="specular-top" />
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <span className="shrink-0 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
                            <BarChart3 className="size-5" />
                        </span>
                        <div>
                            <h2 className="font-[family-name:var(--font-brand)] text-base font-black tracking-tight text-slate-900 sm:text-lg dark:text-white">
                                Laporan Rinci Persentase &amp; Status
                                Pengembangan
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Rincian progres bagian per bagian: siklus
                                sprint, tahapan workflow, deliverables
                                checklist, dan kontribusi tim.
                            </p>
                        </div>
                    </div>

                    <div className="no-print flex shrink-0 items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCopySummary}
                            className="h-9 cursor-pointer gap-1.5 rounded-xl border-slate-200 text-xs font-bold dark:border-slate-800"
                        >
                            {copiedSummary ? (
                                <Check className="size-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="size-3.5 text-violet-600 dark:text-violet-400" />
                            )}
                            <span>
                                {copiedSummary
                                    ? 'Tersalin'
                                    : 'Salin Format WA/Klien'}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="h-9 cursor-pointer gap-1.5 rounded-xl border-slate-200 text-xs font-bold dark:border-slate-800"
                        >
                            <Printer className="size-3.5 text-slate-600 dark:text-slate-300" />
                            <span className="hidden sm:inline">
                                Cetak / PDF
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* 1. Executive Metric Summary Cards (Exact Match to Studio PMS) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="luxury-card relative rounded-3xl p-5">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
                            Total Progres
                        </span>
                        <TrendingUp className="size-4 text-violet-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tight text-slate-900 tabular-nums sm:text-4xl dark:text-white">
                            {project.progress_percentage}%
                        </span>
                        <Badge
                            variant="outline"
                            className="border-violet-500/30 text-[10px] font-bold text-violet-600 dark:text-violet-400"
                        >
                            {project.status === 'completed'
                                ? 'Selesai Penuh'
                                : project.progress_percentage >= 50
                                  ? 'On Track'
                                  : 'In Progress'}
                        </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {metrics.done_tasks} dari {metrics.total_tasks} tugas
                        tereksekusi tuntas
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700"
                            style={{ width: `${project.progress_percentage}%` }}
                        />
                    </div>
                </div>

                <div className="luxury-card relative rounded-3xl p-5">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Siklus Sprint
                        </span>
                        <Zap className="size-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tight text-slate-900 tabular-nums sm:text-4xl dark:text-white">
                            {totalSprints}
                        </span>
                        <span className="text-xs text-slate-500">Siklus</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {completedSprints} Selesai • {activeSprints} Aktif
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${sprintHealthPct}%` }}
                        />
                    </div>
                </div>

                <div className="luxury-card relative rounded-3xl p-5">
                    <div className="specular-top" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Checklist Subtask
                        </span>
                        <CheckSquare className="size-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tight text-slate-900 tabular-nums sm:text-4xl dark:text-white">
                            {metrics.subtask_percentage}%
                        </span>
                        <span className="text-xs text-slate-500">
                            Ketercapaian
                        </span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        {metrics.done_subtasks} dari {metrics.total_subtasks}{' '}
                        item micro-deliverables dicentang
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${metrics.subtask_percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Distribusi Status & Tahapan Pekerjaan */}
            <div className="luxury-card relative space-y-4 rounded-3xl p-6">
                <div className="specular-top" />
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                            <PieChart className="size-4 text-violet-500" />
                            Rincian Distribusi Status &amp; Tahapan Pekerjaan
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Proporsi tiket tugas di setiap stage kanban
                            workflow.
                        </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                        Total {metrics.total_tasks} Tiket Tugas
                    </span>
                </div>

                <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800">
                    {doneRatio > 0 && (
                        <div
                            title={`Selesai (Done): ${metrics.done_tasks} tiket (${doneRatio}%)`}
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${doneRatio}%` }}
                        />
                    )}
                    {reviewRatio > 0 && (
                        <div
                            title={`Review / QA: ${metrics.review_tasks} tiket (${reviewRatio}%)`}
                            className="h-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${reviewRatio}%` }}
                        />
                    )}
                    {inProgressRatio > 0 && (
                        <div
                            title={`Dalam Pengerjaan (In Progress): ${metrics.in_progress_tasks} tiket (${inProgressRatio}%)`}
                            className="h-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${inProgressRatio}%` }}
                        />
                    )}
                    {todoRatio > 0 && (
                        <div
                            title={`Antrean (To Do): ${metrics.todo_tasks} tiket (${todoRatio}%)`}
                            className="h-full bg-slate-300 transition-all duration-500 dark:bg-slate-600"
                            style={{ width: `${todoRatio}%` }}
                        />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-emerald-500" />{' '}
                                Selesai
                            </span>
                            <span>{doneRatio}%</span>
                        </div>
                        <div className="mt-1 text-lg font-black text-emerald-800 tabular-nums dark:text-emerald-300">
                            {metrics.done_tasks}{' '}
                            <span className="text-xs font-normal text-slate-500">
                                Tugas
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-amber-400" />{' '}
                                Review / QA
                            </span>
                            <span>{reviewRatio}%</span>
                        </div>
                        <div className="mt-1 text-lg font-black text-amber-800 tabular-nums dark:text-amber-300">
                            {metrics.review_tasks}{' '}
                            <span className="text-xs font-normal text-slate-500">
                                Tugas
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5">
                        <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 animate-pulse rounded-full bg-sky-500" />{' '}
                                In Progress
                            </span>
                            <span>{inProgressRatio}%</span>
                        </div>
                        <div className="mt-1 text-lg font-black text-sky-800 tabular-nums dark:text-sky-300">
                            {metrics.in_progress_tasks}{' '}
                            <span className="text-xs font-normal text-slate-500">
                                Tugas
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3.5 dark:border-slate-700 dark:bg-slate-800/60">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-slate-400" />{' '}
                                To Do
                            </span>
                            <span>{todoRatio}%</span>
                        </div>
                        <div className="mt-1 text-lg font-black text-slate-800 tabular-nums dark:text-slate-200">
                            {metrics.todo_tasks}{' '}
                            <span className="text-xs font-normal text-slate-500">
                                Tugas
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Rincian Persentase per Bagian / Siklus Sprint + Nested Deliverables & Subtask */}
            <div className="luxury-card relative space-y-4 rounded-3xl p-6">
                <div className="specular-top" />
                <div className="border-b border-slate-100 pb-3 dark:border-slate-800/80">
                    <h3 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                        <Zap className="size-4 text-amber-500" />
                        Rincian Persentase per Bagian / Siklus Sprint
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Tingkat penyelesaian dan output deliverable tiap sprint
                        iterasi proyek beserta rincian checklist.
                    </p>
                </div>

                {project.sprints.length === 0 &&
                unassignedTasks.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                        Belum ada siklus sprint maupun tugas pada proyek ini.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {project.sprints.map((sprint, idx) => {
                            const spTasks = project.tasks.filter(
                                (t) => t.sprint_id === sprint.id,
                            );
                            const spTotal = spTasks.length;
                            const spDone = spTasks.filter(
                                (t) => t.status === 'done',
                            ).length;
                            const spProgress =
                                spTotal > 0
                                    ? Math.round((spDone / spTotal) * 100)
                                    : sprint.status === 'completed'
                                      ? 100
                                      : 0;
                            const isDone =
                                spProgress === 100 ||
                                sprint.status === 'completed';
                            const sprintMeta = getSprintStatusMeta(
                                sprint.status,
                            );

                            return (
                                <div
                                    key={sprint.id}
                                    className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800/80 dark:bg-[#080f20]/70"
                                >
                                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <div
                                                className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                                    isDone
                                                        ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                        : 'border border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                                }`}
                                            >
                                                #{idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                    {sprint.name}
                                                </div>
                                                {sprint.goal && (
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                                        Sasaran: {sprint.goal}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3 text-xs">
                                            <div className="text-right">
                                                <span className="text-base font-black text-slate-900 tabular-nums dark:text-white">
                                                    {spProgress}%
                                                </span>
                                                <span className="block text-[11px] text-slate-500">
                                                    {spDone} dari {spTotal}{' '}
                                                    Tugas
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-bold ${sprintMeta.className}`}
                                            >
                                                {sprintMeta.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                isDone
                                                    ? 'bg-emerald-500'
                                                    : spProgress >= 50
                                                      ? 'bg-violet-600'
                                                      : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${spProgress}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-3 text-slate-400" />
                                            {formatDate(sprint.start_date)} –{' '}
                                            {formatDate(sprint.end_date)}
                                        </span>
                                        <span>
                                            {
                                                spTasks.filter(
                                                    (t) =>
                                                        t.status ===
                                                        'in_progress',
                                                ).length
                                            }{' '}
                                            In Progress •{' '}
                                            {
                                                spTasks.filter(
                                                    (t) => t.status === 'todo',
                                                ).length
                                            }{' '}
                                            To Do
                                        </span>
                                    </div>

                                    {spTasks.length > 0 && (
                                        <div className="mt-3 space-y-2.5 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
                                            <div className="flex items-center justify-between px-1 text-[10.5px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                                <span>
                                                    Deliverables &amp; Fitur (
                                                    {spTasks.length} Tiket)
                                                </span>
                                                <span>
                                                    {spDone}/{spTotal} Selesai
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {spTasks.map((task) =>
                                                    renderTaskBreakdownCard(
                                                        task,
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Standalone / Unassigned Tasks */}
                        {unassignedTasks.length > 0 &&
                            (() => {
                                const unTotal = unassignedTasks.length;
                                const unDone = unassignedTasks.filter(
                                    (t) => t.status === 'done',
                                ).length;
                                const unProgress =
                                    unTotal > 0
                                        ? Math.round((unDone / unTotal) * 100)
                                        : 0;

                                return (
                                    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800/80 dark:bg-[#080f20]/70">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-500/30 bg-slate-500/15 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    <FolderKanban className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                        Tugas &amp; Deliverables
                                                        Tambahan (Di Luar
                                                        Sprint)
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Tiket dan checklist di
                                                        luar siklus sprint
                                                        terjadwal
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-base font-black text-slate-900 tabular-nums dark:text-white">
                                                    {unProgress}%
                                                </span>
                                                <span className="block text-[11px] text-slate-500">
                                                    {unDone} dari {unTotal}{' '}
                                                    Tugas
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-slate-500"
                                                style={{
                                                    width: `${unProgress}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-3 space-y-2 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
                                            {unassignedTasks.map((task) =>
                                                renderTaskBreakdownCard(task),
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                    </div>
                )}
            </div>

            {/* 4. Persentase Penyelesaian per Anggota Tim */}
            <div className="luxury-card relative space-y-4 rounded-3xl p-6">
                <div className="specular-top" />
                <div className="border-b border-slate-100 pb-3 dark:border-slate-800/80">
                    <h3 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                        <Users className="size-4 text-indigo-500" />
                        Persentase Penyelesaian per Anggota Tim
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Tingkat kontribusi dan penyelesaian jobdesk
                        masing-masing person-in-charge (PIC).
                    </p>
                </div>

                {members.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                        Belum ada anggota tim yang ditugaskan secara spesifik ke
                        proyek ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {members.map((m) => {
                            const mTasks = project.tasks.filter(
                                (t) => t.assigned_to === m.user_id,
                            );
                            const mTotal = mTasks.length;
                            const mDone = mTasks.filter(
                                (t) => t.status === 'done',
                            ).length;
                            const mProgress =
                                mTotal > 0
                                    ? Math.round((mDone / mTotal) * 100)
                                    : 0;

                            return (
                                <div
                                    key={m.id}
                                    className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-[#080f20]/70"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-violet-500/30 dark:bg-slate-800">
                                            <img
                                                src={resolveAvatarUrl(
                                                    m.avatar,
                                                    m.name,
                                                )}
                                                alt={m.name}
                                                className="size-full object-cover"
                                                onError={(e) => {
                                                    (
                                                        e.currentTarget as HTMLImageElement
                                                    ).src = resolveAvatarUrl(
                                                        null,
                                                        m.name,
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                {m.name}
                                            </div>
                                            <div className="truncate text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                                                {m.role_in_project}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="text-sm font-black text-slate-900 tabular-nums dark:text-white">
                                                {mProgress}%
                                            </span>
                                            <span className="block text-[10px] text-slate-400 tabular-nums">
                                                {mDone}/{mTotal} Tiket
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                            style={{ width: `${mProgress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* MODULE 4: TIM & ANGGOTA (CLIENT-SAFE, TANPA EMAIL/GAJI)                    */
/* -------------------------------------------------------------------------- */
export function PortalTeamModule({ project }: { project: ClientProject }) {
    const members = project.members || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                    <span className="flex size-8 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <Users className="size-4" />
                    </span>
                    Tim &amp; Penugasan Peran Dinamis
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Daftar anggota tim pelaksana beserta peran proyek yang
                    bertanggung jawab pada pengembangan ini.
                </p>
            </div>

            {members.length === 0 ? (
                <div className="luxury-card rounded-3xl border-dashed p-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    Belum ada anggota yang ditugaskan secara spesifik ke proyek
                    ini.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => {
                        const assignedCount = project.tasks.filter(
                            (t) => t.assigned_to === member.user_id,
                        ).length;
                        const completedCount = project.tasks.filter(
                            (t) =>
                                t.assigned_to === member.user_id &&
                                t.status === 'done',
                        ).length;

                        return (
                            <div
                                key={member.id}
                                className="luxury-card luxury-card-interactive relative flex items-center justify-between gap-3 rounded-3xl p-5"
                            >
                                <div className="specular-top" />
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <div className="relative shrink-0 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[2px] shadow-sm">
                                        <div className="rounded-full bg-white p-[1.5px] dark:bg-[#0c152a]">
                                            <div className="size-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <img
                                                    src={resolveAvatarUrl(
                                                        member.avatar,
                                                        member.name,
                                                    )}
                                                    alt={member.name}
                                                    className="size-full object-cover"
                                                    onError={(e) => {
                                                        (
                                                            e.currentTarget as HTMLImageElement
                                                        ).src =
                                                            resolveAvatarUrl(
                                                                null,
                                                                member.name,
                                                            );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                            {member.name}
                                        </div>
                                        <div className="truncate text-xs font-semibold text-violet-600 dark:text-violet-400">
                                            {member.role_in_project}
                                        </div>
                                        <div className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                                            {completedCount}/{assignedCount}{' '}
                                            Tiket Selesai
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* MODULE 5: LAMPIRAN / DIGITAL ASSET VAULT                                   */
/* -------------------------------------------------------------------------- */
export function PortalAttachmentsModule({
    project,
}: {
    project: ClientProject;
}) {
    const [attachmentFilter, setAttachmentFilter] = useState<
        'all' | 'tasks' | 'general'
    >('all');
    const [previewAttachment, setPreviewAttachment] =
        useState<ClientAttachment | null>(null);

    const allAttachments = useMemo(() => {
        const map = new Map<number, ClientAttachment>();
        (project.attachments || []).forEach((att) => map.set(att.id, att));
        project.tasks.forEach((task) => {
            (task.attachments || []).forEach((att) =>
                map.set(att.id, {
                    ...att,
                    task_id: att.task_id ?? task.id,
                    task_title: att.task_title ?? task.title,
                }),
            );
        });

        return Array.from(map.values());
    }, [project.attachments, project.tasks]);

    const taskAttachments = allAttachments.filter((a) => Boolean(a.task_id));
    const generalAttachments = allAttachments.filter((a) => !a.task_id);

    const filteredAttachments =
        attachmentFilter === 'tasks'
            ? taskAttachments
            : attachmentFilter === 'general'
              ? generalAttachments
              : allAttachments;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                        <span className="flex size-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
                            <Paperclip className="size-4" />
                        </span>
                        Digital Asset &amp; Deliverables Vault
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Pusat penyimpanan berkas bukti pengerjaan tugas,
                        deliverable sprint, dan dokumen arsitektur proyek.
                    </p>
                </div>

                <div className="no-print inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
                    <button
                        type="button"
                        onClick={() => setAttachmentFilter('all')}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            attachmentFilter === 'all'
                                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Semua ({allAttachments.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setAttachmentFilter('tasks')}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            attachmentFilter === 'tasks'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400'
                        }`}
                    >
                        <CheckCircle2 className="size-3" />
                        Bukti Tugas ({taskAttachments.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setAttachmentFilter('general')}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            attachmentFilter === 'general'
                                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                    >
                        Dokumen Umum ({generalAttachments.length})
                    </button>
                </div>
            </div>

            {filteredAttachments.length === 0 ? (
                <div className="luxury-card rounded-3xl border-dashed p-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    {attachmentFilter === 'tasks'
                        ? 'Belum ada berkas bukti pengerjaan tugas yang diunggah oleh tim.'
                        : attachmentFilter === 'general'
                          ? 'Belum ada dokumen umum proyek yang diunggah.'
                          : 'Belum ada berkas lampiran yang diunggah di proyek ini.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                    {filteredAttachments.map((att) => {
                        const styleMeta = getAttachmentStyleMeta(
                            att.file_name,
                            att.file_type,
                        );
                        const ext = getAttachmentExtension(
                            att.file_name,
                            att.file_type,
                        ).toUpperCase();
                        const matchingTaskTitle =
                            att.task_title ||
                            project.tasks.find((t) => t.id === att.task_id)
                                ?.title;
                        const previewUrl = resolveAttachmentUrl(att);
                        const downloadUrl = resolveAttachmentDownloadUrl(att);

                        return (
                            <div
                                key={att.id}
                                className="luxury-card luxury-card-interactive group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-3xl"
                            >
                                <div className="specular-top" />

                                {/* Visual Thumbnail / Format Preview Header */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewAttachment(att)}
                                    className={`relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden border-b border-slate-200/70 bg-gradient-to-br text-left sm:h-40 dark:border-slate-800/80 ${styleMeta.bannerClass}`}
                                    title="Klik untuk membuka pratinjau berkas"
                                >
                                    {styleMeta.category === 'image' ? (
                                        <img
                                            src={previewUrl}
                                            alt={att.file_name}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 p-4">
                                            <div
                                                className={`flex size-14 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-110 ${styleMeta.iconBgClass}`}
                                            >
                                                <styleMeta.Icon className="size-7" />
                                            </div>
                                            <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
                                                {styleMeta.label}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold tracking-wider shadow-xs backdrop-blur-md ${styleMeta.badgeClass}`}
                                        >
                                            {ext || 'FILE'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[10px] font-semibold text-white opacity-90 backdrop-blur-md transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                                            <Eye className="size-3 text-cyan-300" />
                                            Pratinjau
                                        </span>
                                    </div>

                                    {styleMeta.category === 'image' && (
                                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/55 to-transparent" />
                                    )}
                                </button>

                                <div className="flex flex-1 flex-col justify-between space-y-3 p-4.5">
                                    <div className="min-w-0 space-y-2">
                                        {att.task_id && matchingTaskTitle ? (
                                            <div className="flex w-fit max-w-full items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                                <CheckSquare className="size-2.5 shrink-0 text-indigo-500" />
                                                <span className="truncate">
                                                    Tiket #{att.task_id}:{' '}
                                                    {matchingTaskTitle}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                <Layers className="size-2.5 text-slate-400" />
                                                <span>Dokumen Umum Proyek</span>
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewAttachment(att)
                                                }
                                                className="block w-full cursor-pointer truncate text-left text-xs font-bold text-slate-900 transition-colors group-hover:text-cyan-600 sm:text-sm dark:text-white dark:group-hover:text-cyan-400"
                                                title={att.file_name}
                                            >
                                                {att.file_name}
                                            </button>
                                            <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                <span className="font-medium">
                                                    {formatFileSize(
                                                        att.file_size,
                                                    )}
                                                </span>
                                                <span>•</span>
                                                <span className="truncate">
                                                    Oleh{' '}
                                                    {att.uploader_name ??
                                                        'Tim Studio'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
                                        <span className="truncate text-[11px] text-slate-400">
                                            {formatDate(att.created_at)}
                                        </span>

                                        <div className="no-print flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewAttachment(att)
                                                }
                                                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-2.5 text-[11px] font-semibold text-cyan-700 transition-colors hover:bg-cyan-500/20 dark:text-cyan-300"
                                                title="Pratinjau Berkas"
                                            >
                                                <Eye className="size-3.5" />
                                                <span>Lihat</span>
                                            </button>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-8 shrink-0 rounded-xl border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:border-cyan-500/40 hover:bg-cyan-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-cyan-950/30"
                                            >
                                                <a
                                                    href={downloadUrl}
                                                    download={att.file_name}
                                                >
                                                    <Download className="mr-1 size-3.5 text-cyan-500" />
                                                    Unduh
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AttachmentPreviewModal
                attachment={previewAttachment}
                attachments={filteredAttachments}
                tasks={project.tasks}
                onClose={() => setPreviewAttachment(null)}
                onSelectAttachment={setPreviewAttachment}
            />
        </div>
    );
}
