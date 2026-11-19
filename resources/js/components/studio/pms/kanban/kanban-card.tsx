import {
    Calendar,
    CheckCircle2,
    Clock,
    GripVertical,
    MoreHorizontal,
    Pencil,
    Trash2,
    Zap,
} from 'lucide-react';
import React from 'react';
import {
    PRIORITY_META,
    TASK_STATUS_META,
} from '@/components/studio/pms/cockpit/cockpit-utils';
import type { TaskStatus } from '@/components/studio/pms/kanban-task-modal';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PmsTask } from '@/types/pms';
import { formatDueBadge, getPriorityAccentStrip } from './kanban-types';

interface KanbanCardProps {
    task: PmsTask;
    density: 'standard' | 'compact';
    isBeingDragged: boolean;
    showDropLineBefore: boolean;
    onOpenEdit: (task: PmsTask) => void;
    onRequestDelete: (task: PmsTask) => void;
    onMoveStatus: (taskId: number, status: TaskStatus) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: PmsTask) => void;
    onDragEnd: () => void;
    onCardDragOver: (
        e: React.DragEvent<HTMLDivElement>,
        taskId: number,
    ) => void;
    onCardDragLeave: (taskId: number) => void;
    onCardDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onTouchDragStart: (
        e: React.TouchEvent<HTMLButtonElement>,
        task: PmsTask,
    ) => void;
    onTouchDragMove: (e: React.TouchEvent<HTMLButtonElement>) => void;
    onTouchDragEnd: () => void;
}

export function KanbanCard({
    task,
    density,
    isBeingDragged,
    showDropLineBefore,
    onOpenEdit,
    onRequestDelete,
    onMoveStatus,
    onDragStart,
    onDragEnd,
    onCardDragOver,
    onCardDragLeave,
    onCardDrop,
    onTouchDragStart,
    onTouchDragMove,
    onTouchDragEnd,
}: KanbanCardProps) {
    const subtasks = task.subtasks ?? [];
    const doneSubtasks = subtasks.filter((s) => s.is_done).length;
    const subtaskPct =
        subtasks.length > 0
            ? Math.round((doneSubtasks / subtasks.length) * 100)
            : 0;
    const dueInfo = formatDueBadge(task.due_date);
    const estHours = Number(task.estimated_hours) || 0;
    const priorityMeta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
    const statusMeta = TASK_STATUS_META[task.status];

    return (
        <>
            {showDropLineBefore && (
                <div className="relative flex items-center py-0.5">
                    <span className="size-2 rounded-full bg-violet-500" />
                    <div className="h-0.5 flex-1 rounded-full bg-violet-500 shadow-xs" />
                    <span className="size-2 rounded-full bg-violet-500" />
                </div>
            )}

            <div
                data-kanban-card={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => onCardDragOver(e, task.id)}
                onDragLeave={() => onCardDragLeave(task.id)}
                onDrop={onCardDrop}
                className={`group relative cursor-grab overflow-hidden rounded-2xl border bg-white/95 pr-3.5 pl-4 transition-all duration-200 active:cursor-grabbing dark:bg-[#0f172a]/92 ${
                    density === 'compact' ? 'py-2.5' : 'py-3.5'
                } ${
                    isBeingDragged
                        ? 'scale-[0.97] rotate-[1deg] border-dashed border-violet-500 opacity-40 shadow-lg'
                        : 'border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:border-violet-500/45 hover:shadow-xl hover:shadow-violet-500/[0.08] dark:border-white/10'
                }`}
            >
                {/* Priority Accent Left Strip */}
                <div
                    aria-hidden="true"
                    className={`absolute top-2.5 bottom-2.5 left-1.5 w-[3px] rounded-full ${getPriorityAccentStrip(task.priority)}`}
                />

                {/* Zone 1: Stable Zero-Shift Meta Row */}
                <div className="mb-2.5 flex items-center justify-between gap-2 pl-1">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <button
                            type="button"
                            onTouchStart={(e) => onTouchDragStart(e, task)}
                            onTouchMove={onTouchDragMove}
                            onTouchEnd={onTouchDragEnd}
                            onTouchCancel={onTouchDragEnd}
                            onClick={(e) => e.stopPropagation()}
                            title="Seret untuk memindahkan kolom"
                            className="shrink-0 touch-none cursor-grab rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-violet-600 active:cursor-grabbing dark:hover:bg-slate-800"
                        >
                            <GripVertical className="size-3.5" />
                        </button>

                        <span className="min-w-0 truncate rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300">
                            {task.project?.code ?? 'PRJ'}
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <Badge
                            variant="outline"
                            className={`px-2 py-0 text-[9.5px] font-bold whitespace-nowrap ${priorityMeta.badgeClass}`}
                        >
                            {priorityMeta.label}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Menu tugas"
                                    className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                >
                                    <MoreHorizontal className="size-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-40 rounded-xl"
                            >
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenEdit(task);
                                    }}
                                    className="cursor-pointer gap-2 text-xs font-medium"
                                >
                                    <Pencil className="size-3.5 text-violet-500" />
                                    Edit &amp; Subtask
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRequestDelete(task);
                                    }}
                                    className="cursor-pointer gap-2 text-xs font-medium text-rose-600 focus:text-rose-600 dark:text-rose-400"
                                >
                                    <Trash2 className="size-3.5" />
                                    Hapus Tugas
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Zone 2: Clickable Title, Description & Sprint Chip */}
                <button
                    type="button"
                    onClick={() => onOpenEdit(task)}
                    className="w-full cursor-pointer pl-1 text-left"
                >
                    <h4 className="line-clamp-2 font-[family-name:var(--font-brand)] text-[14px] leading-snug font-bold text-slate-900 transition-colors group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-300">
                        {task.title}
                    </h4>
                    {density === 'standard' && task.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {task.description}
                        </p>
                    )}
                </button>

                {density === 'standard' && task.sprint && (
                    <div className="mt-2.5 pl-1">
                        <span
                            className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-100/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300"
                            title={task.sprint.name}
                        >
                            <Zap className="size-2.5 shrink-0 text-amber-500" />
                            <span className="truncate">{task.sprint.name}</span>
                        </span>
                    </div>
                )}

                {subtasks.length > 0 && (
                    <div className="mt-2.5 space-y-1 pl-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="size-3 text-emerald-500" />
                                {doneSubtasks}/{subtasks.length} subtask
                            </span>
                            <span className="font-mono text-[10px] tabular-nums">
                                {subtaskPct}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-300"
                                style={{ width: `${subtaskPct}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Zone 3: Crisp Non-Colliding Footer */}
                <div className="mt-3 flex items-center justify-between gap-2.5 border-t border-slate-100 pt-2.5 pl-1 dark:border-white/10">
                    <div className="flex min-w-0 items-center gap-1.5">
                        {dueInfo ? (
                            <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-semibold whitespace-nowrap ${
                                    dueInfo.overdue && task.status !== 'done'
                                        ? 'border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                        : dueInfo.soon && task.status !== 'done'
                                          ? 'border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                <Calendar className="size-3 shrink-0" />
                                <span>{dueInfo.label}</span>
                            </span>
                        ) : (
                            <span className="truncate text-[10.5px] font-medium text-slate-400">
                                {task.project?.name}
                            </span>
                        )}

                        {density === 'standard' && estHours > 0 && (
                            <span className="hidden shrink-0 items-center gap-0.5 rounded-lg bg-slate-100 px-1.5 py-1 text-[10px] font-medium whitespace-nowrap text-slate-500 tabular-nums sm:inline-flex dark:bg-slate-800 dark:text-slate-400">
                                <Clock className="size-2.5" />
                                {estHours}j
                            </span>
                        )}
                    </div>

                    <Select
                        value={task.status}
                        onValueChange={(val: TaskStatus) =>
                            onMoveStatus(task.id, val)
                        }
                    >
                        <SelectTrigger
                            onClick={(e) => e.stopPropagation()}
                            className={`h-7 w-auto min-w-[90px] shrink-0 gap-1.5 rounded-lg border px-2 text-[10.5px] font-bold whitespace-nowrap transition-colors ${statusMeta.badgeClass}`}
                        >
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <span
                                    className={`size-1.5 shrink-0 rounded-full ${statusMeta.dotClass}`}
                                />
                                <SelectValue />
                            </span>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">
                                In Progress
                            </SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="done">Selesai</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    );
}
