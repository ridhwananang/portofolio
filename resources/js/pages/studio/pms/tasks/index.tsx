import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle2,
    CheckSquare,
    Clock,
    FolderKanban,
    Layers,
    ListTodo,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    User,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { PmsProject, PmsTask, PmsUser } from '@/types/pms';

interface Props {
    tasks: PmsTask[];
    projects: PmsProject[];
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
    is_admin = true,
    current_user_id,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedProject, setSelectedProject] = useState(filters.project_id ? String(filters.project_id) : 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedAssignee, setSelectedAssignee] = useState(filters.assigned_to ? String(filters.assigned_to) : 'all');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingTask, setDeletingTask] = useState<PmsTask | null>(null);
    const [editingTask, setEditingTask] = useState<PmsTask | null>(null);

    // Create Form
    const createForm = useForm({
        project_id: (projects[0]?.id ? String(projects[0].id) : '') as string | number,
        sprint_id: '' as string | number,
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigned_to: '' as string | number,
        due_date: '',
        estimated_hours: 0,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/studio/pms/tasks',
            {
                search: search || undefined,
                project_id: selectedProject !== 'all' ? selectedProject : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                assigned_to: selectedAssignee !== 'all' ? selectedAssignee : undefined,
            },
            { preserveState: true }
        );
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/studio/pms/tasks', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tugas baru berhasil dibuat');
                setIsCreateOpen(false);
                createForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal membuat tugas'),
        });
    };

    const handleUpdateStatus = (taskId: number, newStatus: string) => {
        router.patch(
            `/studio/pms/tasks/${taskId}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Status tugas diubah ke ${newStatus.replace('_', ' ')}`),
            }
        );
    };

    const confirmDeleteTask = () => {
        if (!deletingTask) return;
        router.delete(`/studio/pms/tasks/${deletingTask.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tugas berhasil dihapus');
                setDeletingTask(null);
            },
        });
    };

    // Columns for Kanban
    const columns: { id: 'todo' | 'in_progress' | 'review' | 'done'; title: string; color: string; badge: string }[] = [
        { id: 'todo', title: 'To Do / Backlog', color: 'border-slate-300 dark:border-slate-800', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
        { id: 'in_progress', title: 'Sedang Dikerjakan (In Progress)', color: 'border-indigo-400 dark:border-indigo-800', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
        { id: 'review', title: 'Dalam Review / QA', color: 'border-amber-400 dark:border-amber-800', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        { id: 'done', title: 'Selesai (Completed)', color: 'border-emerald-400 dark:border-emerald-800', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Kanban & Tasks', href: '/studio/pms/tasks' },
            ]}
        >
            <Head title="Kanban Board & Manajemen Tugas - Studio PMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                <Layers className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Kanban Board & Semua Tugas
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Papan kerja agile untuk mengatur alur tiket tugas, prioritas pengerjaan, dan developer penanggung jawab.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 gap-2 h-10 px-4"
                    >
                        <Plus className="size-4" />
                        Tambah Tugas Baru
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari tugas berdasarkan judul atau deskripsi..."
                                    className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>

                            <Select
                                value={selectedProject}
                                onValueChange={(val) => {
                                    setSelectedProject(val);
                                    router.get(
                                        '/studio/pms/tasks',
                                        {
                                            search: search || undefined,
                                            project_id: val !== 'all' ? val : undefined,
                                            priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                                            assigned_to: selectedAssignee !== 'all' ? selectedAssignee : undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full md:w-52 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Pilih Proyek" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Proyek</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedAssignee}
                                onValueChange={(val) => {
                                    setSelectedAssignee(val);
                                    router.get(
                                        '/studio/pms/tasks',
                                        {
                                            search: search || undefined,
                                            project_id: selectedProject !== 'all' ? selectedProject : undefined,
                                            priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                                            assigned_to: val !== 'all' ? val : undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full md:w-44 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Penugasan" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Developer</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={selectedAssignee === String(current_user_id) ? "default" : "outline"}
                                    onClick={() => {
                                        const next = selectedAssignee === String(current_user_id) ? 'all' : String(current_user_id);
                                        setSelectedAssignee(next);
                                        router.get(
                                            '/studio/pms/tasks',
                                            {
                                                search: search || undefined,
                                                project_id: selectedProject !== 'all' ? selectedProject : undefined,
                                                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                                                assigned_to: next !== 'all' ? next : undefined,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                    className={`h-10 rounded-xl px-4 gap-2 font-semibold text-xs cursor-pointer ${
                                        selectedAssignee === String(current_user_id)
                                            ? 'bg-violet-600 text-white shadow-sm'
                                            : 'border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <CheckSquare className="size-4" />
                                    Jobdesk Saya
                                </Button>

                                <Button type="submit" variant="secondary" className="h-10 rounded-xl px-5 gap-2 cursor-pointer">
                                    <Search className="size-4" /> Filter
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* 4-Column Enterprise Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    {columns.map((col) => {
                        const colTasks = tasks.filter((t) => t.status === col.id);

                        return (
                            <div
                                key={col.id}
                                className={`rounded-3xl border ${col.color} bg-slate-50/70 dark:bg-slate-950/40 p-4 backdrop-blur-xl flex flex-col space-y-4 min-h-[500px] shadow-sm`}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                            {col.title}
                                        </h3>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            createForm.setData('status', col.id);
                                            setIsCreateOpen(true);
                                        }}
                                        className="size-7 rounded-lg"
                                    >
                                        <Plus className="size-3.5" />
                                    </Button>
                                </div>

                                {/* Task Cards */}
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {colTasks.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-slate-400 italic">
                                            Tidak ada tugas di kolom ini.
                                        </div>
                                    ) : (
                                        colTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-sm hover:shadow-md hover:border-violet-500/40 transition-all space-y-3"
                                            >
                                                {/* Card Header: Project & Priority */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="font-mono text-[10px] text-violet-600 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md line-clamp-1">
                                                        {task.project?.code ?? 'PRJ'}
                                                    </span>

                                                    <div className="flex items-center gap-1.5">
                                                        {task.assigned_to === current_user_id && (
                                                            <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-[8.5px] px-1.5 py-0.2 border-0 shadow-xs">
                                                                Jobdesk Anda
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            className={`text-[9px] capitalize ${
                                                                task.priority === 'urgent'
                                                                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                                    : task.priority === 'high'
                                                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                                            }`}
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                        {(is_admin || task.created_by === current_user_id) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingTask(task)}
                                                                className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer transition-colors"
                                                                title="Hapus tugas"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Title & Description */}
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                                                        {task.title}
                                                    </h4>
                                                    {task.description && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Sprint / Subtasks info */}
                                                {task.subtasks && task.subtasks.length > 0 && (
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                                        <CheckCircle2 className="size-3 text-emerald-500" />
                                                        <span>
                                                            {task.subtasks.filter((s) => s.is_done).length}/{task.subtasks.length} subtask selesai
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Card Footer: Assignee & Move Column */}
                                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                                    {task.assignee ? (
                                                        <div
                                                            title={task.assignee.name}
                                                            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                                        >
                                                            <div className="size-5 rounded-full bg-violet-600 text-white text-[9px] flex items-center justify-center font-bold">
                                                                {task.assignee.name.charAt(0)}
                                                            </div>
                                                            <span className="line-clamp-1 max-w-[80px]">
                                                                {task.assignee.name.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                                    )}

                                                    {/* Move column quick dropdown */}
                                                    <Select
                                                        value={task.status}
                                                        onValueChange={(val) => handleUpdateStatus(task.id, val)}
                                                    >
                                                        <SelectTrigger className="h-7 text-[10px] px-2 rounded-md font-semibold w-24">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="todo">To Do</SelectItem>
                                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                                            <SelectItem value="review">Review</SelectItem>
                                                            <SelectItem value="done">Done</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Create Task Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Buat Tiket Tugas Baru</DialogTitle>
                            <DialogDescription className="text-xs">
                                Masukkan rincian tugas dan tentukan proyek target.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateTask} className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Proyek Target *</Label>
                                <Select
                                    value={String(createForm.data.project_id)}
                                    onValueChange={(val) => createForm.setData('project_id', val)}
                                >
                                    <SelectTrigger className="rounded-xl h-9 text-xs">
                                        <SelectValue placeholder="Pilih Proyek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} ({p.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Judul Tugas *</Label>
                                <Input
                                    required
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Implementasi Otentikasi Dua Langkah"
                                    className="rounded-xl h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Deskripsi</Label>
                                <Textarea
                                    rows={2}
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="Catatan detail pekerjaan..."
                                    className="rounded-xl text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Kolom Status</Label>
                                    <Select
                                        value={createForm.data.status}
                                        onValueChange={(val: any) => createForm.setData('status', val)}
                                    >
                                        <SelectTrigger className="rounded-xl h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Prioritas</Label>
                                    <Select
                                        value={createForm.data.priority}
                                        onValueChange={(val: any) => createForm.setData('priority', val)}
                                    >
                                        <SelectTrigger className="rounded-xl h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Tugaskan Kepada</Label>
                                    <Select
                                        value={createForm.data.assigned_to ? String(createForm.data.assigned_to) : 'none'}
                                        onValueChange={(val) => createForm.setData('assigned_to', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger className="rounded-xl h-9 text-xs">
                                            <SelectValue placeholder="Pilih Developer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Belum Ditugaskan</SelectItem>
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Tenggat Waktu</Label>
                                    <Input
                                        type="date"
                                        value={createForm.data.due_date}
                                        onChange={(e) => createForm.setData('due_date', e.target.value)}
                                        className="rounded-xl h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Batal</Button>
                                <Button type="submit" disabled={createForm.processing} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white">Buat Tugas</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Konfirmasi Hapus Tugas (Tanpa Alert Browser!) */}
                <Dialog open={Boolean(deletingTask)} onOpenChange={(open) => !open && setDeletingTask(null)}>
                    <DialogContent className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Trash2 className="size-4 text-rose-500" />
                                Hapus Tugas?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                Apakah Anda yakin ingin menghapus tugas <strong className="text-slate-700 dark:text-slate-300">"{deletingTask?.title}"</strong>? Seluruh subtask di dalamnya akan ikut terhapus.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setDeletingTask(null)} className="rounded-xl h-9 text-xs">
                                Batal
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmDeleteTask} className="rounded-xl h-9 text-xs font-bold">
                                Hapus Tugas
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
