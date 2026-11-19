import { Clock, Layers, Plus } from 'lucide-react';
import React from 'react';
import type { TaskStatus } from '@/components/studio/pms/kanban-task-modal';
import { Button } from '@/components/ui/button';
import type { PmsTask } from '@/types/pms';
import { KanbanCard } from './kanban-card';
import type { KanbanColumnConfig } from './kanban-types';

interface KanbanColumnProps {
    column: KanbanColumnConfig;
    tasks: PmsTask[];
    density: 'standard' | 'compact';
    isSnapMobile: boolean;
    draggedTaskId: number | null;
    dragOverCol: TaskStatus | null;
    dropBeforeTaskId: number | null;
    onOpenCreate: (status: TaskStatus) => void;
    onOpenEdit: (task: PmsTask) => void;
    onRequestDelete: (task: PmsTask) => void;
    onMoveTask: (
        taskId: number,
        targetStatus: TaskStatus,
        beforeTaskId?: number | null,
    ) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, task: PmsTask) => void;
    onDragEnd: () => void;
    onColumnDragOver: (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => void;
    onColumnDragLeave: (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => void;
    onColumnDrop: (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => void;
    onCardDragOver: (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
        taskId: number,
    ) => void;
    onCardDragLeave: (taskId: number) => void;
    onCardDrop: (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => void;
    onTouchDragStart: (
        e: React.TouchEvent<HTMLButtonElement>,
        task: PmsTask,
    ) => void;
    onTouchDragMove: (e: React.TouchEvent<HTMLButtonElement>) => void;
    onTouchDragEnd: () => void;
}

export function KanbanColumn({
    column,
    tasks,
    density,
    isSnapMobile,
    draggedTaskId,
    dragOverCol,
    dropBeforeTaskId,
    onOpenCreate,
    onOpenEdit,
    onRequestDelete,
    onMoveTask,
    onDragStart,
    onDragEnd,
    onColumnDragOver,
    onColumnDragLeave,
    onColumnDrop,
    onCardDragOver,
    onCardDragLeave,
    onCardDrop,
    onTouchDragStart,
    onTouchDragMove,
    onTouchDragEnd,
}: KanbanColumnProps) {
    const totalHours = tasks.reduce(
        (sum, t) => sum + (Number(t.estimated_hours) || 0),
        0,
    );
    const isDropHovered = dragOverCol === column.id && draggedTaskId !== null;

    return (
        <div
            data-kanban-col={column.id}
            onDragOver={(e) => onColumnDragOver(e, column.id)}
            onDragLeave={(e) => onColumnDragLeave(e, column.id)}
            onDrop={(e) => onColumnDrop(e, column.id)}
            className={`relative flex min-h-[460px] flex-col overflow-hidden rounded-3xl border p-3.5 backdrop-blur-2xl transition-all duration-200 sm:p-4 ${
                isSnapMobile
                    ? 'w-[86vw] shrink-0 snap-center sm:w-[320px] md:w-auto md:min-w-[275px] md:flex-1'
                    : 'w-full'
            } ${
                isDropHovered
                    ? column.dropHighlightClass
                    : `${column.borderClass} bg-slate-50/85 shadow-sm dark:bg-[#0c152a]/70`
            }`}
        >
            {/* Column Top Hairline Accent */}
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${column.topHairline}`}
            />

            {/* Column Header */}
            <div className="mb-3.5 flex items-center justify-between gap-2 px-1 pt-0.5">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="relative flex size-2.5 shrink-0">
                        {column.dotPulse && (
                            <span
                                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${column.dotClass}`}
                            />
                        )}
                        <span
                            className={`relative inline-flex size-2.5 rounded-full ${column.dotClass}`}
                        />
                    </span>
                    <h3 className="truncate font-[family-name:var(--font-brand)] text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                        {column.title}
                    </h3>
                    <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${column.badgeClass}`}
                    >
                        {tasks.length}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {totalHours > 0 && (
                        <span
                            title="Total estimasi jam di kolom ini"
                            className="hidden items-center gap-1 rounded-lg border border-slate-200/80 bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 tabular-nums sm:inline-flex dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-400"
                        >
                            <Clock className="size-2.5" />
                            {totalHours}j
                        </span>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onOpenCreate(column.id)}
                        className="size-7 shrink-0 cursor-pointer rounded-xl text-slate-500 transition-colors hover:bg-white hover:text-violet-600 hover:shadow-2xs dark:hover:bg-slate-800 dark:hover:text-violet-400"
                        title={`Tambah tugas di ${column.shortTitle}`}
                    >
                        <Plus className="size-3.5" />
                    </Button>
                </div>
            </div>

            {/* Cards Stack */}
            <div className="flex flex-1 flex-col gap-3">
                {tasks.length === 0 ? (
                    <div
                        className={`flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                            isDropHovered
                                ? 'border-violet-500/60 bg-violet-500/5 text-violet-700 dark:text-violet-300'
                                : 'border-slate-200/75 bg-white/40 text-slate-400 dark:border-white/10 dark:bg-slate-950/30'
                        }`}
                    >
                        <div className="mb-2 flex size-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/85 text-slate-400 shadow-2xs dark:border-white/10 dark:bg-slate-900">
                            <Layers className="size-4" />
                        </div>
                        <p className="text-xs font-semibold">
                            {isDropHovered
                                ? `Lepaskan di ${column.shortTitle}`
                                : 'Kolom masih kosong'}
                        </p>
                        {!isDropHovered && (
                            <button
                                type="button"
                                onClick={() => onOpenCreate(column.id)}
                                className="mt-2.5 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-400"
                            >
                                <Plus className="size-3" />
                                Tambah Tugas
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {tasks.map((task) => (
                            <KanbanCard
                                key={task.id}
                                task={task}
                                density={density}
                                isBeingDragged={draggedTaskId === task.id}
                                showDropLineBefore={
                                    dropBeforeTaskId === task.id &&
                                    draggedTaskId !== null &&
                                    draggedTaskId !== task.id
                                }
                                onOpenEdit={onOpenEdit}
                                onRequestDelete={onRequestDelete}
                                onMoveStatus={(taskId, targetStatus) =>
                                    onMoveTask(taskId, targetStatus)
                                }
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onCardDragOver={(e, taskId) =>
                                    onCardDragOver(e, column.id, taskId)
                                }
                                onCardDragLeave={onCardDragLeave}
                                onCardDrop={(e) => onCardDrop(e, column.id)}
                                onTouchDragStart={onTouchDragStart}
                                onTouchDragMove={onTouchDragMove}
                                onTouchDragEnd={onTouchDragEnd}
                            />
                        ))}

                        {isDropHovered && (
                            <div className="rounded-2xl border-2 border-dashed border-violet-500/50 bg-violet-500/8 py-3 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300">
                                Lepaskan untuk pindah ke {column.shortTitle}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
