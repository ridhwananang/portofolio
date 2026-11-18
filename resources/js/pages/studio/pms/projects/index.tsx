import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ArrowUpRight,
    Briefcase,
    CalendarDays,
    CheckCircle2,
    Download,
    ExternalLink,
    Filter,
    FolderKanban,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    Sparkles,
    Trash2,
    X,
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

    const hasActiveFilters = Boolean(search || selectedStatus !== 'all' || selectedPriority !== 'all');

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val) || 0);
    };

    const getMemberAvatar = (user?: PmsUser | null) => {
        if (!user) return '/images/me.webp';
        if (user.avatar) {
            return user.avatar.startsWith('http') || user.avatar.startsWith('/')
                ? user.avatar
                : `/storage/${user.avatar}`;
        }
        if (user.is_admin || user.email === 'ridhwananang@gmail.com') {
            return '/images/me.webp';
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=ffffff&bold=true&size=80`;
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

    const handleResetFilters = () => {
        setSearch('');
        setSelectedStatus('all');
        setSelectedPriority('all');
        router.get('/studio/pms/projects', {}, { preserveState: true });
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

    const getProjectStatusConfig = (status: string) => {
        switch (status) {
            case 'in_progress':
                return {
                    label: 'In Progress',
                    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                    dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse',
                    barGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
                };
            case 'planning':
                return {
                    label: 'Planning',
                    badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
                    dotClass: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.7)]',
                    barGradient: 'from-cyan-500 via-sky-500 to-blue-500',
                };
            case 'review':
                return {
                    label: 'Review / QA',
                    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
                    dotClass: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]',
                    barGradient: 'from-purple-500 via-violet-500 to-indigo-500',
                };
            case 'completed':
                return {
                    label: 'Completed',
                    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
                    dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]',
                    barGradient: 'from-blue-500 via-indigo-500 to-violet-500',
                };
            case 'on_hold':
                return {
                    label: 'On Hold',
                    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
                    dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
                    barGradient: 'from-amber-500 via-orange-500 to-yellow-500',
                };
            default:
                return {
                    label: status ? status.replace('_', ' ') : 'Draft',
                    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
                    dotClass: 'bg-slate-400',
                    barGradient: 'from-slate-400 to-slate-600',
                };
        }
    };

    const getProgressDetails = (pct: number) => {
        if (pct >= 80) {
            return {
                gradient: 'from-emerald-500 to-teal-400',
                glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
                textClass: 'text-emerald-600 dark:text-emerald-400',
            };
        }
        if (pct >= 40) {
            return {
                gradient: 'from-violet-600 via-indigo-600 to-cyan-500',
                glow: 'shadow-[0_0_12px_rgba(99,102,241,0.35)]',
                textClass: 'text-indigo-600 dark:text-indigo-400',
            };
        }
        return {
            gradient: 'from-amber-500 to-orange-400',
            glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
            textClass: 'text-amber-600 dark:text-amber-400',
        };
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <Zap className="size-2.5 fill-current" /> Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                        High
                    </span>
                );
            case 'medium':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        Medium
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-medium uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        {priority || 'Normal'}
                    </span>
                );
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Daftar Proyek', href: '/studio/pms/projects' },
            ]}
        >
            <Head title="Manajemen Proyek & Workspace - Studio PMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
                {/* ========================================================
                    EXECUTIVE HERO PAGE HEADER
                    ======================================================== */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-1 border-b border-slate-200/60 dark:border-white/[0.06]">
                    <div className="flex items-start gap-3.5">
                        <div className="size-11 sm:size-12 rounded-2xl bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-cyan-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-md shadow-violet-500/10 shrink-0 mt-0.5">
                            <FolderKanban className="size-5 sm:size-6" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Manajemen Proyek & Workspace
                                </h1>
                                <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                    {projects.total} Proyek
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                                Kelola siklus hidup pengerjaan aplikasi, status progres sprint, dan roadmap pengembangan secara terpusat.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        {can_create_project && eligibleOrders.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setIsImportOpen(true)}
                                className="rounded-xl border-violet-500/30 bg-white/70 dark:bg-slate-900/70 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-violet-600 dark:text-violet-400 gap-2 h-10 px-4 cursor-pointer font-semibold shadow-2xs hover:shadow-xs transition-all"
                            >
                                <Download className="size-4" />
                                <span>Impor Order Klien</span>
                                <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-violet-500/15 text-[11px] font-bold">
                                    {eligibleOrders.length}
                                </span>
                            </Button>
                        )}
                        {can_create_project && (
                            <Button
                                asChild
                                className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 border border-white/15 gap-2 h-10 px-4.5 cursor-pointer font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Link href="/studio/pms/projects/create">
                                    <Plus className="size-4" />
                                    <span>Inisialisasi Proyek Lengkap</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* ========================================================
                    LUXURY SEARCH & FILTER CONTROL BAR
                    ======================================================== */}
                <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-sm p-3.5 space-y-3">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
                        {/* Search Input Field */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama proyek, kode PRJ, atau klien..."
                                className="pl-9.5 pr-8 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-white/[0.08] focus-visible:ring-violet-500/30 text-xs sm:text-sm text-slate-900 dark:text-white"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    aria-label="Hapus kata kunci"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
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
                            <SelectTrigger className="w-full md:w-44 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-white/[0.08] text-xs font-medium cursor-pointer">
                                <SelectValue placeholder="Status Proyek" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl">
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="planning">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-cyan-500" />
                                        <span>Planning</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="in_progress">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>In Progress</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="review">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-purple-500" />
                                        <span>Review / QA</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-blue-500" />
                                        <span>Completed</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="on_hold">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1.5 rounded-full bg-amber-500" />
                                        <span>On Hold</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Priority Filter */}
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
                            <SelectTrigger className="w-full md:w-40 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-white/[0.08] text-xs font-medium cursor-pointer">
                                <SelectValue placeholder="Prioritas" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl">
                                <SelectItem value="all">Semua Prioritas</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Search Submit Button */}
                        <Button
                            type="submit"
                            variant="secondary"
                            className="h-10 rounded-xl px-5 gap-2 font-semibold text-xs border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
                        >
                            <Search className="size-3.5" />
                            <span>Filter</span>
                        </Button>

                        {/* 1-Click Reset Filter */}
                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleResetFilters}
                                className="h-10 rounded-xl px-3 gap-1.5 font-semibold text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                                title="Reset semua filter"
                            >
                                <RotateCcw className="size-3.5" />
                                <span className="hidden sm:inline">Reset</span>
                            </Button>
                        )}
                    </form>

                    {/* Active Filter Summary Strip */}
                    {hasActiveFilters && (
                        <div className="flex items-center justify-between pt-1 px-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/[0.06]">
                            <div className="flex items-center gap-2">
                                <Filter className="size-3 text-violet-500" />
                                <span>Menampilkan filter aktif untuk {projects.total} proyek</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-violet-600 dark:text-violet-400 hover:underline font-semibold cursor-pointer"
                            >
                                Bersihkan filter
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================
                    PROJECTS GRID
                    ======================================================== */}
                {projects.data.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-16 text-center space-y-4 backdrop-blur-xl">
                        <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                            <FolderKanban className="size-8" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1.5">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {is_admin ? 'Tidak Ada Proyek Ditemukan' : 'Belum Ada Proyek yang Ditugaskan'}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {is_admin
                                    ? 'Coba sesuaikan kata kunci pencarian, filter status, atau buat inisialisasi proyek baru untuk membuka workspace.'
                                    : 'Administrator belum menugaskan Anda ke proyek aktif apapun. Hubungi Lead Architect untuk pendelegasian jobdesk & peran.'}
                            </p>
                        </div>
                        {can_create_project && (
                            <Button asChild className="rounded-xl gap-2 cursor-pointer font-bold shadow-md shadow-violet-500/20 bg-violet-600 hover:bg-violet-700 text-white">
                                <Link href="/studio/pms/projects/create">
                                    <Plus className="size-4" />
                                    <span>Inisialisasi Proyek Baru</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.data.map((project) => {
                            const statusConfig = getProjectStatusConfig(project.status);
                            const progressDetails = getProgressDetails(project.progress_percentage || 0);

                            return (
                                <div
                                    key={project.id}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement).closest('button, a, [role="menuitem"], input')) {
                                            return;
                                        }
                                        router.visit(`/studio/pms/projects/${project.id}`);
                                    }}
                                    className="group relative cursor-pointer rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-gradient-to-b from-white/95 via-white/85 to-slate-50/90 dark:from-[#0E1528]/95 dark:via-[#0B1020]/85 dark:to-[#070A14]/90 p-6 backdrop-blur-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.55)] hover:shadow-2xl hover:border-violet-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Top Status Accent Ambient Bar */}
                                    <div
                                        className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${statusConfig.barGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                                    />

                                    <div>
                                        {/* Top Bar: Code, Status & Priority */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="font-mono text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 px-2.5 py-0.5 rounded-lg border border-violet-500/20">
                                                    {project.code}
                                                </span>

                                                {/* Status Proyek Jewel Badge */}
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeClass}`}>
                                                    <span className={`size-1.5 rounded-full ${statusConfig.dotClass}`} />
                                                    {statusConfig.label}
                                                </span>

                                                {/* Priority Badge */}
                                                {getPriorityBadge(project.priority)}
                                            </div>

                                            {/* Action Dropdown Menu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl p-1">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/studio/pms/projects/${project.id}`}
                                                            className="cursor-pointer gap-2 text-xs font-semibold py-2"
                                                        >
                                                            <ExternalLink className="size-3.5 text-violet-500" />
                                                            Buka Workspace
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {is_admin && (
                                                        <>
                                                            <DropdownMenuSeparator className="my-1 border-slate-200/80 dark:border-white/10" />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeletingProject(project)}
                                                                className="cursor-pointer gap-2 text-xs font-semibold py-2 text-rose-600 focus:text-rose-600 hover:bg-rose-500/10"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                Hapus Proyek
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Project Name & Client */}
                                        <div className="mt-3.5 space-y-1">
                                            <Link
                                                href={`/studio/pms/projects/${project.id}`}
                                                className="font-black text-xl text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1 tracking-tight"
                                            >
                                                {project.name}
                                            </Link>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                <Briefcase className="size-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">
                                                    Klien: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{project.client}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {project.description && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Progress Bar with Luxury Styling */}
                                        <div className="mt-5 space-y-2">
                                            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <span>Progres Penyelesaian</span>
                                                    <Link
                                                        href={`/studio/pms/projects/${project.id}?tab=reports`}
                                                        className="text-[10.5px] text-violet-600 dark:text-violet-400 hover:underline font-bold"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        (Rincian ↗)
                                                    </Link>
                                                </div>
                                                <span className={`font-black text-xs ${progressDetails.textClass}`}>
                                                    {project.progress_percentage}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-white/5">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${progressDetails.gradient} ${progressDetails.glow} rounded-full transition-all duration-700`}
                                                    style={{ width: `${Math.min(100, Math.max(0, project.progress_percentage))}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Separated Schedule & Workload Badges */}
                                        <div className="mt-4 space-y-2">
                                            {/* 1. Target Jadwal Strip */}
                                            <div className="px-3.5 py-2 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                                    <CalendarDays className="size-3.5 text-violet-500 shrink-0" />
                                                    <span>Target Selesai</span>
                                                </span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    {project.end_date
                                                        ? new Date(project.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : 'Jadwal Fleksibel'}
                                                </span>
                                            </div>

                                            {/* 2. Sprints & Tasks Mini Cards (2 Columns) */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="px-3 py-2 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 flex items-center gap-2">
                                                    <div className="size-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                                        <Zap className="size-3" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block leading-tight">Sprint</span>
                                                        <span className="font-bold text-amber-700 dark:text-amber-300 text-xs truncate block">
                                                            {project.sprints?.length ?? 0} Sprint
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="px-3 py-2 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 flex items-center gap-2">
                                                    <div className="size-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="size-3" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block leading-tight">Tugas</span>
                                                        <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs truncate block">
                                                            {project.tasks?.length ?? 0} Task
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Details: Avatars & Workspace Button */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                                        {/* Team Members Avatars */}
                                        <div className="flex -space-x-2 overflow-hidden items-center">
                                            {project.members && project.members.length > 0 ? (
                                                project.members.slice(0, 4).map((m, idx) => {
                                                    const avatarUrl = getMemberAvatar(m.user);
                                                    return (
                                                        <Tooltip key={m.id || idx}>
                                                            <TooltipTrigger asChild>
                                                                <div className="relative size-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xs shrink-0 cursor-pointer">
                                                                    <img
                                                                        src={avatarUrl}
                                                                        alt={m.user?.name || 'Avatar'}
                                                                        className="size-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || 'User')}&background=6366f1&color=ffffff&bold=true`;
                                                                        }}
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom" className="text-xs">
                                                                <span>{m.user?.name || 'Anggota Tim'} ({m.role_in_project})</span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                })
                                            ) : project.creator ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative size-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xs shrink-0 cursor-pointer">
                                                            <img
                                                                src={getMemberAvatar(project.creator)}
                                                                alt={project.creator.name}
                                                                className="size-full object-cover"
                                                                onError={(e) => {
                                                                    (e.currentTarget as HTMLImageElement).src = '/images/me.webp';
                                                                }}
                                                            />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" className="text-xs">
                                                        <span>{project.creator.name} (Project Lead / Inisiator)</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <div
                                                    title="Lead Architect (Default)"
                                                    className="relative size-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xs shrink-0"
                                                >
                                                    <img
                                                        src="/images/me.webp"
                                                        alt="Lead Architect"
                                                        className="size-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            {project.members && project.members.length > 4 && (
                                                <div className="relative size-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                    +{project.members.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        {/* Luxury Workspace Action Button */}
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/20 font-bold text-xs group-hover:bg-violet-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-md group-hover:shadow-violet-500/30 transition-all duration-200 cursor-pointer">
                                            <span>Workspace</span>
                                            <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ========================================================
                    MODALS: IMPORT & DELETE
                    ======================================================== */}
                {/* Import from Client Order Modal */}
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <DialogContent className="max-w-lg rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                <Download className="size-5 text-violet-500" />
                                <span>Impor Order Klien ke PMS</span>
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
                    <DialogContent className="max-w-sm rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl">
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
