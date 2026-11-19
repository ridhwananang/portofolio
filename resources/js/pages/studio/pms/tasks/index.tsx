import { Head, router } from '@inertiajs/react';
import { GripVertical, Trash2 } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { KanbanColumn } from '@/components/studio/pms/kanban/kanban-column';
import { KanbanHeader } from '@/components/studio/pms/kanban/kanban-header';
import { KanbanToolbar } from '@/components/studio/pms/kanban/kanban-toolbar';
import {
    getXsrfToken,
    KANBAN_COLUMNS,
} from '@/components/studio/pms/kanban/kanban-types';
import {
    KanbanTaskModal
    
    
} from '@/components/studio/pms/kanban-task-modal';
import type {ProjectWithSprints, TaskStatus} from '@/components/studio/pms/kanban-task-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { PmsTask, PmsUser } from '@/types/pms';

interface Props {
    tasks: PmsTask[];
    projects: ProjectWithSprints[];
    users: PmsUser[];
    filters: {
        project_id?: number;
        sprint_id?: number;
        assigned_to?: number;
        status?: string;
        priority?: string;
        search?: string;
    };
    is_admin?: boolean;
    current_user_id?: number;
}

export default function TasksIndex({
    tasks,
    projects,
    users,
    filters,
    is_admin = false,
    current_user_id,
}: Props) {
    const [prevTasksProp, setPrevTasksProp] = useState<PmsTask[]>(tasks);
    const [boardTasks, setBoardTasks] = useState<PmsTask[]>(tasks);

    if (tasks !== prevTasksProp) {
        setPrevTasksProp(tasks);
        setBoardTasks(tasks);
    }

    const [search, setSearch] = useState(filters.search || '');
    const [selectedProject, setSelectedProject] = useState(
        filters.project_id ? String(filters.project_id) : 'all',
    );
    const [selectedPriority, setSelectedPriority] = useState(
        filters.priority || 'all',
    );
    const [mobileColumnView, setMobileColumnView] = useState<'all' | TaskStatus>(
        'all',
    );
    const [cardDensity, setCardDensity] = useState<'standard' | 'compact'>(
        'standard',
    );

    // Modals
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>(
        'create',
    );
    const [taskModalInitialStatus, setTaskModalInitialStatus] =
        useState<TaskStatus>('todo');
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [deletingTask, setDeletingTask] = useState<PmsTask | null>(null);

    // Drag & Drop State (Desktop HTML5 + Touch)
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
    const [dropBeforeTaskId, setDropBeforeTaskId] = useState<number | null>(
        null,
    );
    const [touchDragState, setTouchDragState] = useState<{
        taskId: number;
        title: string;
        projectCode?: string;
        x: number;
        y: number;
    } | null>(null);

    const boardScrollRef = useRef<HTMLDivElement | null>(null);

    const editingTask = useMemo(
        () => boardTasks.find((t) => t.id === editingTaskId) ?? null,
        [boardTasks, editingTaskId],
    );

    const currentUser = useMemo(
        () => users.find((u) => u.id === current_user_id) ?? users[0] ?? null,
        [users, current_user_id],
    );

    // Strictly scoped to this individual user's own tasks
    const visibleTasks = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return boardTasks.filter((task) => {
            if (current_user_id && task.assigned_to !== current_user_id) {
                return false;
            }

            if (
                selectedProject !== 'all' &&
                String(task.project_id) !== selectedProject
            ) {
                return false;
            }

            if (
                selectedPriority !== 'all' &&
                task.priority !== selectedPriority
            ) {
                return false;
            }

            if (needle) {
                const hay =
                    `${task.title} ${task.description ?? ''} ${task.project?.code ?? ''} ${task.project?.name ?? ''}`.toLowerCase();

                if (!hay.includes(needle)) {
                    return false;
                }
            }

            return true;
        });
    }, [
        boardTasks,
        search,
        selectedProject,
        selectedPriority,
        current_user_id,
    ]);

    const totalVisible = visibleTasks.length;
    const hasActiveFilters =
        Boolean(search.trim()) ||
        selectedProject !== 'all' ||
        selectedPriority !== 'all';

    const syncServerFilters = (overrides: {
        search?: string;
        project?: string;
        priority?: string;
    }) => {
        const nextSearch = overrides.search ?? search;
        const nextProject = overrides.project ?? selectedProject;
        const nextPriority = overrides.priority ?? selectedPriority;

        router.get(
            '/studio/pms/tasks',
            {
                search: nextSearch || undefined,
                project_id: nextProject !== 'all' ? nextProject : undefined,
                priority: nextPriority !== 'all' ? nextPriority : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        syncServerFilters({});
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedProject('all');
        setSelectedPriority('all');

        router.get(
            '/studio/pms/tasks',
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openCreateModal = (statusCol: TaskStatus = 'todo') => {
        setTaskModalMode('create');
        setTaskModalInitialStatus(statusCol);
        setEditingTaskId(null);
        setTaskModalOpen(true);
    };

    const openEditModal = (task: PmsTask) => {
        setTaskModalMode('edit');
        setEditingTaskId(task.id);
        setTaskModalInitialStatus(task.status);
        setTaskModalOpen(true);
    };

    const moveTaskOptimistically = async (
        taskId: number,
        targetStatus: TaskStatus,
        beforeTaskId: number | null = null,
        showUndo = true,
    ) => {
        const dragged = boardTasks.find((t) => t.id === taskId);

        if (!dragged || (dragged.status === targetStatus && beforeTaskId === null)) {
            return;
        }

        if (beforeTaskId === taskId) {
            return;
        }

        const previousSnapshot = boardTasks;
        const previousStatus = dragged.status;

        const targetColTasks = boardTasks
            .filter((t) => t.status === targetStatus && t.id !== taskId)
            .sort((a, b) => a.order_index - b.order_index);

        let insertIndex = targetColTasks.length;

        if (beforeTaskId !== null) {
            const idx = targetColTasks.findIndex((t) => t.id === beforeTaskId);

            if (idx !== -1) {
                insertIndex = idx;
            }
        }

        const reorderedTarget = [...targetColTasks];
        reorderedTarget.splice(insertIndex, 0, {
            ...dragged,
            status: targetStatus,
        });

        const updatedOrderMap = new Map<
            number,
            { status: TaskStatus; order_index: number }
        >();
        reorderedTarget.forEach((item, idx) => {
            updatedOrderMap.set(item.id, {
                status: targetStatus,
                order_index: idx + 1,
            });
        });

        const nextTasks = boardTasks.map((t) => {
            const updated = updatedOrderMap.get(t.id);

            if (updated) {
                return {
                    ...t,
                    status: updated.status,
                    order_index: updated.order_index,
                };
            }

            return t;
        });

        nextTasks.sort((a, b) => a.order_index - b.order_index || b.id - a.id);
        setBoardTasks(nextTasks);

        try {
            const response = await fetch(`/studio/pms/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({
                    status: targetStatus,
                    order_index: insertIndex + 1,
                }),
            });

            if (!response.ok) {
                const errPayload = await response.json().catch(() => null);

                throw new Error(
                    errPayload?.message || 'Gagal memindahkan tugas',
                );
            }

            const targetColMeta = KANBAN_COLUMNS.find(
                (c) => c.id === targetStatus,
            );

            if (previousStatus !== targetStatus && targetColMeta) {
                toast.success(
                    `"${dragged.title}" dipindahkan ke ${targetColMeta.shortTitle}`,
                    showUndo
                        ? {
                              action: {
                                  label: 'Urungkan',
                                  onClick: () =>
                                      void moveTaskOptimistically(
                                          taskId,
                                          previousStatus,
                                          null,
                                          false,
                                      ),
                              },
                          }
                        : undefined,
                );
            }
        } catch (err) {
            setBoardTasks(previousSnapshot);
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Gagal memperbarui status tugas',
            );
        }
    };

    const confirmDeleteTask = () => {
        if (!deletingTask) {
            return;
        }

        router.delete(`/studio/pms/tasks/${deletingTask.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tugas berhasil dihapus');
                setDeletingTask(null);
            },
        });
    };

    // Desktop HTML5 Drag Handlers
    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        task: PmsTask,
    ) => {
        setDraggedTaskId(task.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(task.id));
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverCol(null);
        setDropBeforeTaskId(null);
    };

    const handleColumnDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (dragOverCol !== colId) {
            setDragOverCol(colId);
        }
    };

    const handleColumnDragLeave = (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => {
        if (
            !e.currentTarget.contains(e.relatedTarget as Node) &&
            dragOverCol === colId
        ) {
            setDragOverCol(null);
        }
    };

    const handleColumnDrop = (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => {
        e.preventDefault();
        const fallbackId = Number(e.dataTransfer.getData('text/plain'));
        const activeId =
            draggedTaskId ?? (Number.isFinite(fallbackId) ? fallbackId : null);

        if (activeId) {
            void moveTaskOptimistically(activeId, colId, dropBeforeTaskId);
        }

        handleDragEnd();
    };

    const handleCardDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
        taskId: number,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragOverCol !== colId) {
            setDragOverCol(colId);
        }

        if (draggedTaskId !== null && draggedTaskId !== taskId) {
            setDropBeforeTaskId(taskId);
        }
    };

    const handleCardDragLeave = (taskId: number) => {
        if (dropBeforeTaskId === taskId) {
            setDropBeforeTaskId(null);
        }
    };

    const handleCardDrop = (
        e: React.DragEvent<HTMLDivElement>,
        colId: TaskStatus,
    ) => {
        e.stopPropagation();
        handleColumnDrop(e, colId);
    };

    // Touch Drag & Drop Handlers (Mobile & Tablet)
    const handleTouchDragStart = (
        e: React.TouchEvent<HTMLButtonElement>,
        task: PmsTask,
    ) => {
        if (e.touches.length === 0) {
            return;
        }

        const touch = e.touches[0];
        setDraggedTaskId(task.id);
        setTouchDragState({
            taskId: task.id,
            title: task.title,
            projectCode: task.project?.code,
            x: touch.clientX,
            y: touch.clientY,
        });
    };

    const handleTouchDragMove = (e: React.TouchEvent<HTMLButtonElement>) => {
        if (!touchDragState || e.touches.length === 0) {
            return;
        }

        const touch = e.touches[0];
        setTouchDragState((prev) =>
            prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null,
        );

        const container = boardScrollRef.current;

        if (container && container.scrollWidth > container.clientWidth) {
            const rect = container.getBoundingClientRect();

            if (touch.clientX > rect.right - 48) {
                container.scrollLeft += 14;
            } else if (touch.clientX < rect.left + 48) {
                container.scrollLeft -= 14;
            }
        }

        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const colEl = element?.closest('[data-kanban-col]') as HTMLElement | null;
        const cardEl = element?.closest(
            '[data-kanban-card]',
        ) as HTMLElement | null;

        if (colEl) {
            const colAttr = colEl.getAttribute(
                'data-kanban-col',
            ) as TaskStatus | null;

            if (colAttr) {
                setDragOverCol(colAttr);
            }
        } else {
            setDragOverCol(null);
        }

        if (cardEl) {
            const cardIdAttr = Number(cardEl.getAttribute('data-kanban-card'));
            setDropBeforeTaskId(
                Number.isFinite(cardIdAttr) &&
                    cardIdAttr !== touchDragState.taskId
                    ? cardIdAttr
                    : null,
            );
        } else {
            setDropBeforeTaskId(null);
        }
    };

    const handleTouchDragEnd = () => {
        if (touchDragState && dragOverCol) {
            void moveTaskOptimistically(
                touchDragState.taskId,
                dragOverCol,
                dropBeforeTaskId,
            );
        }

        setTouchDragState(null);
        setDraggedTaskId(null);
        setDragOverCol(null);
        setDropBeforeTaskId(null);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Jobdesk & Kanban', href: '/studio/pms/tasks' },
            ]}
        >
            <Head title="Kanban & Jobdesk Saya - Studio PMS" />

            <div className="mx-auto w-full max-w-[1600px] space-y-4 px-3 py-4 sm:space-y-5 sm:px-6 sm:py-5 lg:px-8">
                {/* 1. Compact Personal Luxury Header */}
                <KanbanHeader
                    currentUser={currentUser}
                    visibleTasks={visibleTasks}
                    onCreateTask={() => openCreateModal('todo')}
                />

                {/* 2. Floating Filter & Density Dock */}
                <KanbanToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    selectedProject={selectedProject}
                    onProjectChange={(val) => {
                        setSelectedProject(val);
                        syncServerFilters({ project: val });
                    }}
                    selectedPriority={selectedPriority}
                    onPriorityChange={(val) => {
                        setSelectedPriority(val);
                        syncServerFilters({ priority: val });
                    }}
                    projects={projects}
                    cardDensity={cardDensity}
                    onDensityChange={setCardDensity}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                />

                {/* 3. Mobile Stage Switcher Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileColumnView('all')}
                        className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                            mobileColumnView === 'all'
                                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                                : 'border border-slate-200/90 bg-white/90 text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300'
                        }`}
                    >
                        Semua ({totalVisible})
                    </button>
                    {KANBAN_COLUMNS.map((col) => {
                        const count = visibleTasks.filter(
                            (t) => t.status === col.id,
                        ).length;

                        return (
                            <button
                                key={col.id}
                                type="button"
                                onClick={() => setMobileColumnView(col.id)}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                                    mobileColumnView === col.id
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                                        : 'border border-slate-200/90 bg-white/90 text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300'
                                }`}
                            >
                                <span
                                    className={`size-2 rounded-full ${
                                        mobileColumnView === col.id
                                            ? 'bg-white'
                                            : col.dotClass
                                    }`}
                                />
                                <span>{col.shortTitle}</span>
                                <span className="opacity-75 tabular-nums">
                                    ({count})
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 4. Responsive Kanban Board Grid */}
                <div
                    ref={boardScrollRef}
                    className={
                        mobileColumnView === 'all'
                            ? '-mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-4 md:mx-0 md:px-0 md:snap-none'
                            : 'grid grid-cols-1 gap-4'
                    }
                >
                    {KANBAN_COLUMNS.filter(
                        (col) =>
                            mobileColumnView === 'all' ||
                            mobileColumnView === col.id,
                    ).map((col) => (
                        <KanbanColumn
                            key={col.id}
                            column={col}
                            tasks={visibleTasks.filter(
                                (t) => t.status === col.id,
                            )}
                            density={cardDensity}
                            isSnapMobile={mobileColumnView === 'all'}
                            draggedTaskId={draggedTaskId}
                            dragOverCol={dragOverCol}
                            dropBeforeTaskId={dropBeforeTaskId}
                            onOpenCreate={openCreateModal}
                            onOpenEdit={openEditModal}
                            onRequestDelete={setDeletingTask}
                            onMoveTask={(
                                taskId,
                                targetStatus,
                                beforeTaskId = null,
                            ) =>
                                void moveTaskOptimistically(
                                    taskId,
                                    targetStatus,
                                    beforeTaskId,
                                )
                            }
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onColumnDragOver={handleColumnDragOver}
                            onColumnDragLeave={handleColumnDragLeave}
                            onColumnDrop={handleColumnDrop}
                            onCardDragOver={handleCardDragOver}
                            onCardDragLeave={handleCardDragLeave}
                            onCardDrop={handleCardDrop}
                            onTouchDragStart={handleTouchDragStart}
                            onTouchDragMove={handleTouchDragMove}
                            onTouchDragEnd={handleTouchDragEnd}
                        />
                    ))}
                </div>

                {/* Floating Touch Drag Ghost Pill */}
                {touchDragState && (
                    <div
                        className="pointer-events-none fixed z-50 max-w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-violet-500/50 bg-white/95 px-3.5 py-2.5 shadow-2xl shadow-violet-500/20 backdrop-blur-xl dark:bg-[#0f172a]/95"
                        style={{
                            left: touchDragState.x,
                            top: touchDragState.y,
                        }}
                    >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                            <GripVertical className="size-3.5 shrink-0 text-violet-500" />
                            {touchDragState.projectCode && (
                                <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[9.5px] text-violet-600 dark:text-violet-300">
                                    {touchDragState.projectCode}
                                </span>
                            )}
                            <span className="truncate">
                                {touchDragState.title}
                            </span>
                        </div>
                    </div>
                )}

                {/* Task Detail / Create / Edit & Subtask Modal */}
                <KanbanTaskModal
                    open={taskModalOpen}
                    onOpenChange={setTaskModalOpen}
                    mode={taskModalMode}
                    initialStatus={taskModalInitialStatus}
                    task={editingTask}
                    projects={projects}
                    users={users}
                    isAdmin={is_admin}
                    currentUserId={current_user_id}
                />

                {/* Delete Task Confirmation Modal */}
                <Dialog
                    open={Boolean(deletingTask)}
                    onOpenChange={(open) => !open && setDeletingTask(null)}
                >
                    <DialogContent className="max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c152a]/95">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-base font-extrabold text-slate-900 dark:text-white">
                                <span className="flex size-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                                    <Trash2 className="size-4" />
                                </span>
                                Hapus Tugas?
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Apakah Anda yakin ingin menghapus tugas{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                    &ldquo;{deletingTask?.title}&rdquo;
                                </strong>
                                ? Seluruh subtask di dalamnya akan ikut terhapus.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeletingTask(null)}
                                className="h-9.5 cursor-pointer rounded-xl text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDeleteTask}
                                className="h-9.5 cursor-pointer rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
                            >
                                Hapus Tugas
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
