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
    Calendar,
    CalendarDays,
    CheckCircle2,
    FolderKanban,
    Plus,
    Trash2,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { PmsProject, PmsSprint } from '@/types/pms';

interface Props {
    sprints: {
        data: PmsSprint[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    projects: PmsProject[];
    selectedProjectId: number | null;
    is_admin?: boolean;
}

export default function SprintsIndex({
    sprints,
    projects,
    selectedProjectId,
    is_admin = true,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingSprint, setDeletingSprint] = useState<PmsSprint | null>(null);

    const sprintForm = useForm({
        project_id: (selectedProjectId || projects[0]?.id || '') as string | number,
        name: '',
        goal: '',
        status: 'planned',
        start_date: '',
        end_date: '',
    });

    const handleCreateSprint = (e: React.FormEvent) => {
        e.preventDefault();
        sprintForm.post('/studio/pms/sprints', {
            onSuccess: () => {
                toast.success('Sprint baru berhasil dibuat');
                setIsCreateOpen(false);
                sprintForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal membuat sprint'),
        });
    };

    const confirmDeleteSprint = () => {
        if (!deletingSprint) return;
        router.delete(`/studio/pms/sprints/${deletingSprint.id}`, {
            onSuccess: () => {
                toast.success(`Sprint ${deletingSprint.name} berhasil dihapus`);
                setDeletingSprint(null);
            },
        });
    };

    const handleProjectFilter = (val: string) => {
        router.get(
            '/studio/pms/sprints',
            { project_id: val !== 'all' ? val : undefined },
            { preserveState: true }
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Sprint Cycles', href: '/studio/pms/sprints' },
            ]}
        >
            <Head title="Sprint Cycles & Iterasi - Studio PMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Zap className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Siklus Sprint & Iterasi Fitur
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Atur target deliverable fitur berkala dalam siklus sprint 1-2 minggu.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select
                            value={selectedProjectId ? String(selectedProjectId) : 'all'}
                            onValueChange={handleProjectFilter}
                        >
                            <SelectTrigger className="w-56 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectValue placeholder="Pilih Proyek" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Proyek</SelectItem>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name} ({p.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {is_admin && (
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 gap-2 h-10 px-4 cursor-pointer shrink-0"
                            >
                                <Plus className="size-4" />
                                Buat Sprint Baru
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sprints Grid */}
                {sprints.data.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center space-y-3">
                        <Zap className="size-12 mx-auto text-amber-500/60" />
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                            Belum ada sprint yang terdaftar
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Buat siklus sprint pertama untuk memulai pembagian tiket tugas fitur aplikasi.
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl mt-2">
                            Buat Sprint Pertama
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sprints.data.map((sprint) => {
                            const totalTasks = sprint.tasks?.length ?? 0;
                            const doneTasks = sprint.tasks?.filter((t) => t.status === 'done').length ?? 0;
                            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                            return (
                                <div
                                    key={sprint.id}
                                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 backdrop-blur-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <Badge
                                                    className={`text-[10px] uppercase font-bold ${
                                                        sprint.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : sprint.status === 'completed'
                                                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                                    }`}
                                                >
                                                    {sprint.status}
                                                </Badge>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1.5">
                                                    {sprint.name}
                                                </h3>
                                            </div>

                                            {is_admin && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setDeletingSprint(sprint)}
                                                    className="size-7 rounded-lg text-rose-500 hover:text-rose-600 cursor-pointer"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="text-xs text-violet-600 font-semibold mt-1">
                                            {sprint.project?.name ?? 'Proyek'} ({sprint.project?.code})
                                        </div>

                                        {sprint.goal && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                                Goal: {sprint.goal}
                                            </p>
                                        )}

                                        {/* Progress Bar */}
                                        <div className="mt-4 space-y-1">
                                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                <span>Penyelesaian ({doneTasks}/{totalTasks} tugas)</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="size-3 text-slate-400" />
                                            {sprint.start_date ?? '-'} s/d {sprint.end_date ?? '-'}
                                        </span>

                                        <Link
                                            href={`/studio/pms/projects/${sprint.project_id}`}
                                            className="text-violet-600 font-semibold hover:underline"
                                        >
                                            Buka Workspace →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create Sprint Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Buat Siklus Sprint Baru</DialogTitle>
                            <DialogDescription className="text-xs">
                                Definisikan rentang waktu dan target pencapaian sprint.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSprint} className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Proyek Target *</Label>
                                <Select
                                    value={String(sprintForm.data.project_id)}
                                    onValueChange={(val) => sprintForm.setData('project_id', val)}
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
                                <Label className="text-xs font-semibold">Nama Sprint *</Label>
                                <Input
                                    required
                                    value={sprintForm.data.name}
                                    onChange={(e) => sprintForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Sprint 1 - Database & Core API"
                                    className="rounded-xl h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Tujuan / Goal Sprint</Label>
                                <Textarea
                                    rows={2}
                                    value={sprintForm.data.goal}
                                    onChange={(e) => sprintForm.setData('goal', e.target.value)}
                                    placeholder="Sasaran deliverable yang harus diselesaikan tim..."
                                    className="rounded-xl text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Tanggal Mulai</Label>
                                    <Input
                                        type="date"
                                        value={sprintForm.data.start_date}
                                        onChange={(e) => sprintForm.setData('start_date', e.target.value)}
                                        className="rounded-xl h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Tenggat Selesai</Label>
                                    <Input
                                        type="date"
                                        value={sprintForm.data.end_date}
                                        onChange={(e) => sprintForm.setData('end_date', e.target.value)}
                                        className="rounded-xl h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Status Awal</Label>
                                <Select
                                    value={sprintForm.data.status}
                                    onValueChange={(val: any) => sprintForm.setData('status', val)}
                                >
                                    <SelectTrigger className="rounded-xl h-9 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">Planned (Direncanakan)</SelectItem>
                                        <SelectItem value="active">Active (Sedang Berjalan)</SelectItem>
                                        <SelectItem value="completed">Completed (Selesai)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Batal</Button>
                                <Button type="submit" disabled={sprintForm.processing} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white">Buat Sprint</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Konfirmasi Hapus Sprint (Tanpa Browser Alert!) */}
                <Dialog open={Boolean(deletingSprint)} onOpenChange={(open) => !open && setDeletingSprint(null)}>
                    <DialogContent className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Trash2 className="size-4 text-rose-500" />
                                Hapus Sprint {deletingSprint?.name}?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                Apakah Anda yakin ingin menghapus sprint ini? Tugas-tugas di dalamnya tidak akan terhapus dan akan tetap tersimpan di proyek.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setDeletingSprint(null)} className="rounded-xl h-9 text-xs">
                                Batal
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmDeleteSprint} className="rounded-xl h-9 text-xs font-bold">
                                Hapus Sprint
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
