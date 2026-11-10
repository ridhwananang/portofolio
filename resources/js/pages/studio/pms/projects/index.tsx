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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowUpRight,
    Briefcase,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Coins,
    DollarSign,
    Download,
    ExternalLink,
    FolderKanban,
    Layers,
    MoreHorizontal,
    Plus,
    Search,
    ShoppingBag,
    Sparkles,
    Trash2,
    User,
    Users,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { PmsProject, PmsUser } from '@/types/pms';

interface Props {
    projects: {
        data: PmsProject[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    availableUsers: PmsUser[];
    eligibleOrders: any[];
    filters: {
        search?: string;
        status?: string;
        priority?: string;
    };
    can_create_project?: boolean;
    is_admin?: boolean;
}

export default function ProjectsIndex({
    projects,
    availableUsers,
    eligibleOrders,
    filters,
    can_create_project = true,
    is_admin = true,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');

    // Modals
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [deletingProject, setDeletingProject] = useState<PmsProject | null>(null);

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val) || 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/studio/pms/projects',
            {
                search: search || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
            },
            { preserveState: true }
        );
    };

    const handleImportOrder = (orderId: number) => {
        router.post(
            '/studio/pms/projects/import-order',
            { order_id: orderId },
            {
                onSuccess: () => {
                    toast.success('Order klien berhasil diimpor menjadi Workspace PMS!');
                    setIsImportOpen(false);
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Gagal mengimpor order');
                },
            }
        );
    };

    const handleDelete = () => {
        if (!deletingProject) return;
        router.delete(`/studio/pms/projects/${deletingProject.id}`, {
            onSuccess: () => {
                toast.success('Proyek berhasil dihapus');
                setDeletingProject(null);
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] as string || 'Gagal menghapus proyek');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Daftar Proyek', href: '/studio/pms/projects' },
            ]}
        >
            <Head title="Manajemen Proyek - Studio PMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                <FolderKanban className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Manajemen Proyek & Workspace
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Kelola siklus hidup pengerjaan aplikasi, alokasi anggaran, dan roadmap pengembangan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {can_create_project && eligibleOrders.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setIsImportOpen(true)}
                                className="rounded-xl border-violet-500/30 text-violet-600 dark:text-violet-400 gap-2 h-10 px-4 cursor-pointer"
                            >
                                <Download className="size-4" />
                                Impor Order Klien ({eligibleOrders.length})
                            </Button>
                        )}
                        {can_create_project && (
                            <Button
                                asChild
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 gap-2 h-10 px-4 cursor-pointer"
                            >
                                <Link href="/studio/pms/projects/create">
                                    <Plus className="size-4" />
                                    Inisialisasi Proyek Lengkap
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama proyek, kode PRJ, atau klien..."
                                    className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>

                            <Select
                                value={selectedStatus}
                                onValueChange={(val) => {
                                    setSelectedStatus(val);
                                    router.get(
                                        '/studio/pms/projects',
                                        {
                                            search: search || undefined,
                                            status: val !== 'all' ? val : undefined,
                                            priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full md:w-44 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Status Proyek" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="planning">Planning</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review / QA</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedPriority}
                                onValueChange={(val) => {
                                    setSelectedPriority(val);
                                    router.get(
                                        '/studio/pms/projects',
                                        {
                                            search: search || undefined,
                                            status: selectedStatus !== 'all' ? selectedStatus : undefined,
                                            priority: val !== 'all' ? val : undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <SelectTrigger className="w-full md:w-40 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Prioritas" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Prioritas</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button type="submit" variant="secondary" className="h-10 rounded-xl px-5 gap-2">
                                <Search className="size-4" /> Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Projects Grid */}
                {projects.data.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center space-y-4">
                        <FolderKanban className="size-12 mx-auto text-slate-400" />
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                {is_admin ? 'Tidak ada proyek ditemukan' : 'Belum ada proyek yang ditugaskan'}
                            </h3>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                                {is_admin
                                    ? 'Coba sesuaikan kata kunci pencarian atau buat proyek baru untuk memulai workspace.'
                                    : 'Admin belum menugaskan Anda ke proyek apapun. Hubungi Administrator untuk penugasan proyek & jobdesk.'}
                            </p>
                        </div>
                        {can_create_project && (
                            <Button asChild className="rounded-xl gap-2 cursor-pointer">
                                <Link href="/studio/pms/projects/create">
                                    <Plus className="size-4" />
                                    Inisialisasi Proyek Baru
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.data.map((project) => {
                            const isUrgent = project.priority === 'urgent' || project.priority === 'high';
                            const progressColor =
                                project.progress_percentage >= 80
                                    ? 'bg-emerald-500'
                                    : project.progress_percentage >= 40
                                    ? 'bg-indigo-500'
                                    : 'bg-amber-500';

                            return (
                                <div
                                    key={project.id}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement).closest('button, a, [role="menuitem"], input')) {
                                            return;
                                        }
                                        router.visit(`/studio/pms/projects/${project.id}`);
                                    }}
                                    className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 backdrop-blur-xl shadow-md hover:shadow-xl hover:border-violet-500/40 transition-all flex flex-col justify-between active:scale-[0.995]"
                                >
                                    <div>
                                        {/* Top Bar */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg">
                                                    {project.code}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize text-[10px] font-semibold ${
                                                        isUrgent ? 'border-rose-500/30 text-rose-500 bg-rose-500/5' : ''
                                                    }`}
                                                >
                                                    {project.priority}
                                                </Badge>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/studio/pms/projects/${project.id}`}
                                                            className="cursor-pointer gap-2 text-xs"
                                                        >
                                                            <ExternalLink className="size-3.5 text-blue-500" />
                                                            Buka Workspace
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {is_admin && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeletingProject(project)}
                                                                className="cursor-pointer gap-2 text-xs text-rose-600 focus:text-rose-600"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                Hapus Proyek
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Title & Client */}
                                        <div className="mt-3">
                                            <Link
                                                href={`/studio/pms/projects/${project.id}`}
                                                className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors line-clamp-1"
                                            >
                                                {project.name}
                                            </Link>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                                Klien: <span className="text-slate-700 dark:text-slate-300">{project.client}</span>
                                            </p>
                                        </div>

                                        {project.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Progress Bar */}
                                        <div className="mt-5 space-y-1.5">
                                            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                <span>Penyelesaian</span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {project.progress_percentage}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                                                    style={{ width: `${project.progress_percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Budget Pill */}
                                        <div className="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                            <span className="text-slate-500 font-medium">Anggaran:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(project.budget)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Details */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                        {/* Team Members Avatars */}
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {project.members && project.members.length > 0 ? (
                                                project.members.slice(0, 4).map((m, idx) => (
                                                    <div
                                                        key={idx}
                                                        title={`${m.user?.name} (${m.role_in_project})`}
                                                        className="inline-block size-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center"
                                                    >
                                                        {m.user?.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">Belum ada tim</span>
                                            )}
                                        </div>

                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 hover:bg-violet-500/10 transition-all cursor-pointer"
                                        >
                                            <Link href={`/studio/pms/projects/${project.id}`}>
                                                Workspace <ArrowUpRight className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Import from Client Order Modal */}
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogContent className="max-w-lg rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                <Download className="size-5 text-violet-500" />
                                Impor Order Klien ke PMS
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Pilih pesanan klien yang telah terverifikasi untuk langsung diubah menjadi Workspace PMS beserta breakdown milestone.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto pt-2">
                            {eligibleOrders.map((ord) => (
                                <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-violet-600">
                                                #{ord.tracking_code}
                                            </span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {ord.status}
                                            </Badge>
                                        </div>
                                        <div className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                                            {ord.client_name} - {ord.project_type}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Nilai: {formatCurrency(ord.total_amount)}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleImportOrder(ord.id)}
                                        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-3"
                                    >
                                        Buat Workspace
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={Boolean(deletingProject)} onOpenChange={(open) => !open && setDeletingProject(null)}>
                    <DialogContent className="max-w-sm rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600">
                                Hapus Proyek PMS?
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Seluruh sprint, tugas kanban, rincian teknis, dan catatan keuangan proyek <strong>{deletingProject?.name}</strong> akan dihapus secara permanen.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button variant="outline" onClick={() => setDeletingProject(null)} className="rounded-xl">
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                Ya, Hapus Proyek
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
