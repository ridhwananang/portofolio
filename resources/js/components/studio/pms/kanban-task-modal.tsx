import { router, useForm } from '@inertiajs/react';
import {
    Calendar,
    Check,
    Clock,
    Layers,
    Lock,
    Plus,
    Save,
    Sparkles,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    PRIORITY_META,
    TASK_STATUS_META,
} from '@/components/studio/pms/cockpit/cockpit-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PmsProject, PmsSprint, PmsTask, PmsUser } from '@/types/pms';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectWithSprints extends PmsProject {
    sprints?: PmsSprint[];
}

interface KanbanTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    initialStatus?: TaskStatus;
    task?: PmsTask | null;
    projects: ProjectWithSprints[];
    users: PmsUser[];
    isAdmin: boolean;
    currentUserId?: number;
}

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Selesai' },
];

const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export function KanbanTaskModal(props: KanbanTaskModalProps) {
    const {
        open,
        onOpenChange,
        mode,
        initialStatus = 'todo',
        task = null,
    } = props;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open && (
                <KanbanTaskModalBody
                    key={`${mode}-${task?.id ?? 'new'}-${initialStatus}`}
                    {...props}
                />
            )}
        </Dialog>
    );
}

function KanbanTaskModalBody({
    onOpenChange,
    mode,
    initialStatus = 'todo',
    task = null,
    projects,
    users,
    isAdmin,
    currentUserId,
}: KanbanTaskModalProps) {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [subtaskPending, setSubtaskPending] = useState(false);

    const form = useForm({
        project_id: (mode === 'edit' && task
            ? String(task.project_id)
            : projects[0]?.id
              ? String(projects[0].id)
              : '') as string | number,
        sprint_id: (mode === 'edit' && task?.sprint_id
            ? String(task.sprint_id)
            : '') as string | number,
        title: mode === 'edit' && task ? task.title : '',
        description: mode === 'edit' && task ? task.description || '' : '',
        status: (mode === 'edit' && task
            ? task.status
            : initialStatus) as TaskStatus,
        priority: (mode === 'edit' && task
            ? task.priority
            : 'medium') as TaskPriority,
        assigned_to:
            mode === 'edit' && task
                ? task.assigned_to
                    ? String(task.assigned_to)
                    : currentUserId
                      ? String(currentUserId)
                      : ''
                : currentUserId
                  ? String(currentUserId)
                  : '',
        due_date:
            mode === 'edit' && task?.due_date
                ? String(task.due_date).slice(0, 10)
                : '',
        estimated_hours: (mode === 'edit' && task
            ? (task.estimated_hours ?? 0)
            : 0) as string | number,
    });

    const activeProject = projects.find(
        (p) => String(p.id) === String(form.data.project_id),
    );
    const availableSprints = activeProject?.sprints ?? [];
    const currentUser = users.find((u) => u.id === currentUserId);
    const canModify =
        isAdmin || (task ? task.assigned_to === currentUserId : true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'edit' && task) {
            form.transform((data) => ({
                ...data,
                sprint_id: data.sprint_id ? Number(data.sprint_id) : null,
                assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
                due_date: data.due_date || null,
                estimated_hours:
                    data.estimated_hours === ''
                        ? 0
                        : Number(data.estimated_hours),
            }));

            form.put(`/studio/pms/tasks/${task.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Rincian tugas berhasil diperbarui');
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(
                        (Object.values(err)[0] as string) ||
                            'Gagal memperbarui tugas',
                    );
                },
            });

            return;
        }

        form.transform((data) => ({
            ...data,
            project_id: Number(data.project_id),
            sprint_id: data.sprint_id ? Number(data.sprint_id) : null,
            assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
            due_date: data.due_date || null,
            estimated_hours:
                data.estimated_hours === '' ? 0 : Number(data.estimated_hours),
        }));

        form.post('/studio/pms/tasks', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tugas baru berhasil dibuat');
                onOpenChange(false);
                form.reset();
            },
            onError: (err) => {
                toast.error(
                    (Object.values(err)[0] as string) || 'Gagal membuat tugas',
                );
            },
        });
    };

    const handleAddSubtask = () => {
        if (!task || !newSubtaskTitle.trim() || subtaskPending) {
            return;
        }

        setSubtaskPending(true);
        router.post(
            `/studio/pms/tasks/${task.id}/subtasks`,
            { title: newSubtaskTitle.trim() },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setNewSubtaskTitle('');
                    toast.success('Subtask ditambahkan');
                },
                onFinish: () => setSubtaskPending(false),
            },
        );
    };

    const handleToggleSubtask = (subtaskId: number) => {
        if (!canModify) {
            return;
        }

        router.patch(
            `/studio/pms/subtasks/${subtaskId}/toggle`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleDeleteSubtask = (subtaskId: number) => {
        if (!canModify) {
            return;
        }

        router.delete(`/studio/pms/subtasks/${subtaskId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success('Subtask dihapus'),
        });
    };

    const subtasks = task?.subtasks ?? [];
    const doneSubtasks = subtasks.filter((s) => s.is_done).length;
    const subtaskRatio =
        subtasks.length > 0
            ? Math.round((doneSubtasks / subtasks.length) * 100)
            : 0;

    return (
        <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-xl dark:border-white/10 dark:bg-[#0c152a]/95">
            {/* Pinned Non-Shrinking Modal Header */}
            <div className="relative shrink-0 overflow-hidden border-b border-slate-200/75 px-5 pt-5 pb-4 pr-12 sm:px-6 sm:pt-5 sm:pb-4 sm:pr-14 dark:border-white/10">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-12 -left-10 size-40 rounded-full bg-violet-500/15 blur-2xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
                />

                <DialogHeader className="relative z-10 text-left">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 text-violet-600 shadow-xs dark:text-violet-400">
                            <Layers className="size-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <DialogTitle className="font-[family-name:var(--font-brand)] text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                                    {mode === 'edit'
                                        ? 'Detail & Edit Tugas'
                                        : 'Buat Tiket Tugas Baru'}
                                </DialogTitle>
                                {mode === 'edit' && task?.project?.code && (
                                    <Badge
                                        variant="outline"
                                        className="border-violet-500/30 bg-violet-500/10 font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300"
                                    >
                                        {task.project.code}
                                    </Badge>
                                )}
                            </div>
                            <DialogDescription className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {mode === 'edit'
                                    ? 'Kelola detail pekerjaan, progres tahapan, dan checklist subtask Anda.'
                                    : 'Tambahkan tiket baru ke papan kerja Kanban pribadi Anda.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
            </div>

            {/* Scrollable Body + Pinned Footer */}
            <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        <div className="min-w-0 space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Proyek Target *
                            </Label>
                            {mode === 'edit' && task ? (
                                <div className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
                                    <Badge
                                        variant="outline"
                                        className="shrink-0 font-mono text-[10px]"
                                    >
                                        {task.project?.code ?? 'PRJ'}
                                    </Badge>
                                    <span className="truncate">
                                        {task.project?.name}
                                    </span>
                                </div>
                            ) : (
                                <Select
                                    value={String(form.data.project_id)}
                                    onValueChange={(val) => {
                                        form.setData((prev) => ({
                                            ...prev,
                                            project_id: val,
                                            sprint_id: '',
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-slate-200/90 bg-white text-xs dark:border-white/10 dark:bg-slate-950/70">
                                        <SelectValue placeholder="Pilih Proyek" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {projects.map((p) => (
                                            <SelectItem
                                                key={p.id}
                                                value={String(p.id)}
                                            >
                                                {p.name} ({p.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="min-w-0 space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Siklus Sprint (Opsional)
                            </Label>
                            <Select
                                value={
                                    form.data.sprint_id
                                        ? String(form.data.sprint_id)
                                        : 'none'
                                }
                                onValueChange={(val) =>
                                    form.setData(
                                        'sprint_id',
                                        val === 'none' ? '' : val,
                                    )
                                }
                            >
                                <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-slate-200/90 bg-white text-xs [&>span]:truncate dark:border-white/10 dark:bg-slate-950/70">
                                    <SelectValue placeholder="Tanpa Sprint" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="none">
                                        Di Luar Sprint (Backlog)
                                    </SelectItem>
                                    {availableSprints.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Judul Tugas *
                        </Label>
                        <Input
                            required
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="Contoh: Implementasi Otentikasi & Refresh Token"
                            className="h-10 rounded-xl border-slate-200/90 bg-white text-sm font-medium dark:border-white/10 dark:bg-slate-950/70"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Deskripsi / Catatan Teknis
                        </Label>
                        <Textarea
                            rows={3}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Rincian deliverable atau acceptance criteria..."
                            className="rounded-xl border-slate-200/90 bg-white text-xs leading-relaxed dark:border-white/10 dark:bg-slate-950/70"
                        />
                    </div>

                    {/* Visual Status & Priority Selectors */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Status Pengerjaan
                            </Label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {STATUS_OPTIONS.map((opt) => {
                                    const meta = TASK_STATUS_META[opt.id];
                                    const active = form.data.status === opt.id;

                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() =>
                                                form.setData('status', opt.id)
                                            }
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${
                                                active
                                                    ? 'border-violet-500/60 bg-violet-500/12 text-violet-700 shadow-2xs ring-1 ring-violet-500/30 dark:text-violet-200'
                                                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300'
                                            }`}
                                        >
                                            <span
                                                className={`size-2 shrink-0 rounded-full ${meta.dotClass}`}
                                            />
                                            <span className="truncate">
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Tingkat Prioritas
                            </Label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {PRIORITY_OPTIONS.map((prio) => {
                                    const meta = PRIORITY_META[prio];
                                    const active = form.data.priority === prio;

                                    return (
                                        <button
                                            key={prio}
                                            type="button"
                                            onClick={() =>
                                                form.setData('priority', prio)
                                            }
                                            className={`flex cursor-pointer items-center justify-center rounded-xl border px-2.5 py-2 text-xs font-bold capitalize transition-all ${
                                                active
                                                    ? `${meta.badgeClass} shadow-2xs ring-1 ring-current/30`
                                                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300'
                                            }`}
                                        >
                                            {meta.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Spacious Date + Estimate + Personal Assignee */}
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        <div className="min-w-0 space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <Calendar className="size-3.5 text-slate-400" />
                                Tenggat Waktu
                            </Label>
                            <Input
                                type="date"
                                value={form.data.due_date}
                                onChange={(e) =>
                                    form.setData('due_date', e.target.value)
                                }
                                className="h-9.5 w-full rounded-xl border-slate-200/90 bg-white text-xs dark:border-white/10 dark:bg-slate-950/70"
                            />
                        </div>

                        <div className="min-w-0 space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <Clock className="size-3.5 text-slate-400" />
                                Estimasi Waktu (Jam)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.5"
                                value={form.data.estimated_hours}
                                onChange={(e) =>
                                    form.setData(
                                        'estimated_hours',
                                        e.target.value,
                                    )
                                }
                                className="h-9.5 w-full rounded-xl border-slate-200/90 bg-white text-xs dark:border-white/10 dark:bg-slate-950/70"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl border border-violet-500/20 bg-violet-500/8 px-3.5 py-2.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Penanggung Jawab Personal
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-800 dark:text-violet-200">
                            <Lock className="size-3 text-violet-500" />
                            {currentUser?.name || 'Anda Sendiri'}
                        </span>
                    </div>

                    {mode === 'edit' && task && (
                        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/60">
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                    <Sparkles className="size-3.5 text-violet-500" />
                                    Checklist Subtask
                                </span>
                                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 tabular-nums dark:text-violet-300">
                                    {doneSubtasks}/{subtasks.length} (
                                    {subtaskRatio}%)
                                </span>
                            </div>

                            {subtasks.length > 0 && (
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-300"
                                        style={{ width: `${subtaskRatio}%` }}
                                    />
                                </div>
                            )}

                            {subtasks.length > 0 && (
                                <div className="space-y-1.5">
                                    {subtasks.map((st) => (
                                        <div
                                            key={st.id}
                                            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/75 bg-white px-3 py-2 text-xs shadow-2xs transition-colors hover:border-violet-500/30 dark:border-white/10 dark:bg-slate-900"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleSubtask(st.id)
                                                }
                                                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                                            >
                                                <span
                                                    className={`flex size-4 shrink-0 items-center justify-center rounded-md border transition-all ${
                                                        st.is_done
                                                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                                            : 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                                                    }`}
                                                >
                                                    {st.is_done && (
                                                        <Check className="size-3 stroke-[3]" />
                                                    )}
                                                </span>
                                                <span
                                                    className={`truncate ${
                                                        st.is_done
                                                            ? 'text-slate-400 line-through'
                                                            : 'font-medium text-slate-700 dark:text-slate-200'
                                                    }`}
                                                >
                                                    {st.title}
                                                </span>
                                            </button>
                                            {canModify && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteSubtask(
                                                            st.id,
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                                                    title="Hapus subtask"
                                                >
                                                    <Trash2 className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {canModify && (
                                <div className="flex items-center gap-2 pt-0.5">
                                    <Input
                                        value={newSubtaskTitle}
                                        onChange={(e) =>
                                            setNewSubtaskTitle(e.target.value)
                                        }
                                        placeholder="Tambah langkah subtask lalu tekan Enter..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubtask();
                                            }
                                        }}
                                        className="h-9 rounded-xl border-slate-200/90 bg-white text-xs dark:border-white/10 dark:bg-slate-900"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        disabled={
                                            subtaskPending ||
                                            !newSubtaskTitle.trim()
                                        }
                                        onClick={handleAddSubtask}
                                        className="h-9 shrink-0 cursor-pointer gap-1 rounded-xl px-3 text-xs font-semibold"
                                    >
                                        <Plus className="size-3.5" />
                                        Tambah
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pinned Non-Shrinking Footer */}
                <DialogFooter className="shrink-0 gap-2 border-t border-slate-200/75 bg-slate-50/60 px-5 py-3.5 sm:px-6 dark:border-white/10 dark:bg-slate-950/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-9.5 cursor-pointer rounded-xl px-4 text-xs font-semibold"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="h-9.5 cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500"
                    >
                        <Save className="size-3.5" />
                        {form.processing
                            ? 'Menyimpan...'
                            : mode === 'edit'
                              ? 'Simpan Perubahan'
                              : 'Buat Tugas Baru'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
