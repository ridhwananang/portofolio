import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    Coins,
    ExternalLink,
    Filter,
    FolderKanban,
    Layers,
    Plus,
    Receipt,
    RotateCcw,
    Sparkles,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    formatCurrencyIdr,
    PROJECT_STATUS_META,
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
import AppLayout from '@/layouts/app-layout';
import type { PmsFinance, PmsProject } from '@/types/pms';

interface ProjectFinancialRow {
    id: number;
    name: string;
    code: string;
    client?: string | null;
    budget: number;
    income: number;
    expense: number;
    remaining: number;
    burn_rate: number;
    status: string;
    transactions_count?: number;
    order_tracking_code?: string | null;
}

interface UnimportedOrderRow {
    id: number;
    tracking_code: string;
    client_name: string;
    project_type: string;
    total_amount: number | string;
    payment_stage?: string | null;
    status: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    finances: {
        data: PmsFinance[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    projects: PmsProject[];
    projectFinancials: ProjectFinancialRow[];
    unimportedOrders?: UnimportedOrderRow[];
    summary: {
        total_income: number;
        total_project_expenses: number;
        total_general_expenses: number;
        total_expenses: number;
        net_margin: number;
        total_budgets: number;
    };
    filters: {
        project_id?: number;
        type?: string;
    };
}

function getBurnBarTone(burnRate: number): string {
    if (burnRate >= 85) {
        return 'from-rose-500 to-pink-600';
    }

    if (burnRate >= 60) {
        return 'from-amber-400 to-orange-500';
    }

    return 'from-emerald-500 to-teal-400';
}

export default function FinancesIndex({
    finances,
    projects,
    projectFinancials,
    unimportedOrders = [],
    summary,
    filters,
}: Props) {
    const [selectedProject, setSelectedProject] = useState(
        filters.project_id ? String(filters.project_id) : 'all',
    );
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [projectStatusFilter, setProjectStatusFilter] = useState<
        'all' | 'active' | 'completed'
    >('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingFinance, setDeletingFinance] = useState<PmsFinance | null>(
        null,
    );
    const [importingOrderId, setImportingOrderId] = useState<number | null>(
        null,
    );

    const financeForm = useForm({
        project_id: '' as string | number,
        type: 'income',
        title: '',
        category: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
        receipt: null as File | null,
    });

    const filteredProjectFinancials = useMemo(() => {
        if (projectStatusFilter === 'active') {
            return projectFinancials.filter(
                (p) => p.status !== 'completed',
            );
        }

        if (projectStatusFilter === 'completed') {
            return projectFinancials.filter(
                (p) => p.status === 'completed',
            );
        }

        return projectFinancials;
    }, [projectFinancials, projectStatusFilter]);

    const handleFilterChange = (proj: string, typ: string) => {
        setSelectedProject(proj);
        setSelectedType(typ);
        router.get(
            '/studio/pms/finances',
            {
                project_id: proj !== 'all' ? proj : undefined,
                type: typ !== 'all' ? typ : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const openCreateModal = (presetProjectId?: number) => {
        financeForm.setData({
            project_id: presetProjectId
                ? String(presetProjectId)
                : selectedProject !== 'all'
                  ? selectedProject
                  : projects[0]?.id
                    ? String(projects[0].id)
                    : '',
            type: 'income',
            title: '',
            category: '',
            amount: '',
            transaction_date: new Date().toISOString().split('T')[0],
            notes: '',
            receipt: null,
        });
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        financeForm.post('/studio/pms/finances', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Transaksi keuangan berhasil dicatat');
                setIsCreateOpen(false);
                financeForm.reset();
            },
            onError: (err) =>
                toast.error(
                    (Object.values(err)[0] as string) ||
                        'Gagal menyimpan transaksi',
                ),
        });
    };

    const confirmDelete = () => {
        if (!deletingFinance) {
            return;
        }

        router.delete(`/studio/pms/finances/${deletingFinance.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Transaksi keuangan berhasil dihapus');
                setDeletingFinance(null);
            },
        });
    };

    const handleImportOrder = (orderId: number) => {
        setImportingOrderId(orderId);
        router.post(
            '/studio/pms/projects/import-order',
            { order_id: orderId },
            {
                preserveScroll: true,
                onFinish: () => setImportingOrderId(null),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Keuangan & Budget', href: '/studio/pms/finances' },
            ]}
        >
            <Head title="Keuangan & Anggaran Proyek - Studio PMS" />

            <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">
                {/* 1. LUXURY HERO HEADER */}
                <section className="relative overflow-hidden rounded-3xl border border-slate-200/85 bg-white/85 p-5 shadow-md shadow-slate-900/[0.03] backdrop-blur-2xl sm:p-6 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/35">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-emerald-500/12 blur-3xl dark:bg-emerald-500/20"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-12 -bottom-24 size-64 rounded-full bg-violet-600/10 blur-3xl dark:bg-violet-600/18"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent"
                    />

                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                                <Sparkles className="size-3" />
                                Studio Financial Ledger
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Coins className="size-5" />
                                </span>
                                <div>
                                    <h1 className="font-[family-name:var(--font-brand)] text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                                        Keuangan &amp; Realisasi Anggaran Proyek
                                    </h1>
                                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                                        Seluruh proyek aktif otomatis terhubung
                                        dengan nilai budget, arus kas termin
                                        klien, dan beban operasional.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => openCreateModal()}
                            className="h-10.5 shrink-0 cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 sm:text-sm"
                        >
                            <Plus className="size-4" />
                            Catat Transaksi Keuangan
                        </Button>
                    </div>
                </section>

                {/* 2. KPI SUMMARY CONSTELLATION (5 CARDS INCLUDING TOTAL BUDGET) */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="glass-panel rounded-2xl border border-slate-200/85 p-4.5 shadow-xs dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                            <span>Total Budget Proyek</span>
                            <Wallet className="size-3.5 text-violet-500" />
                        </div>
                        <div className="mt-2 font-[family-name:var(--font-brand)] text-xl font-extrabold text-slate-900 tabular-nums dark:text-white">
                            {formatCurrencyIdr(summary.total_budgets)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Dari {projectFinancials.length} proyek terdaftar
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl border border-slate-200/85 p-4.5 shadow-xs dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                            <span>Total Pemasukan</span>
                            <TrendingUp className="size-3.5 text-emerald-500" />
                        </div>
                        <div className="mt-2 font-[family-name:var(--font-brand)] text-xl font-extrabold text-emerald-600 tabular-nums dark:text-emerald-400">
                            {formatCurrencyIdr(summary.total_income)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Termin &amp; pembayaran klien
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl border border-slate-200/85 p-4.5 shadow-xs dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                            <span>Pengeluaran Proyek</span>
                            <TrendingDown className="size-3.5 text-rose-500" />
                        </div>
                        <div className="mt-2 font-[family-name:var(--font-brand)] text-xl font-extrabold text-rose-600 tabular-nums dark:text-rose-400">
                            {formatCurrencyIdr(summary.total_project_expenses)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Biaya server, aset, dan tools
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl border border-slate-200/85 p-4.5 shadow-xs dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                            <span>Operasional Studio</span>
                            <Layers className="size-3.5 text-amber-500" />
                        </div>
                        <div className="mt-2 font-[family-name:var(--font-brand)] text-xl font-extrabold text-amber-600 tabular-nums dark:text-amber-400">
                            {formatCurrencyIdr(summary.total_general_expenses)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Beban operasional umum
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl border border-slate-200/85 p-4.5 shadow-xs sm:col-span-2 lg:col-span-1 dark:border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                            <span>Margin Bersih (Net)</span>
                            <Coins className="size-3.5 text-indigo-500" />
                        </div>
                        <div
                            className={`mt-2 font-[family-name:var(--font-brand)] text-xl font-extrabold tabular-nums ${
                                summary.net_margin >= 0
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-rose-600'
                            }`}
                        >
                            {formatCurrencyIdr(summary.net_margin)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Pemasukan dikurangi beban
                        </div>
                    </div>
                </div>

                {/* 3. AUTOMATIC UNIMPORTED PAID ORDERS BRIDGE (IF ANY) */}
                {unimportedOrders.length > 0 && (
                    <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] p-4 backdrop-blur-xl dark:bg-violet-500/10">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 text-xs font-bold text-violet-800 dark:text-violet-200">
                                    <Sparkles className="size-3.5 text-violet-500" />
                                    <span>
                                        {unimportedOrders.length} Order Klien
                                        Terverifikasi Belum Diimpor ke PMS
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Impor order berikut agar proyek dan catatan
                                    pembayaran masuk otomatis ke daftar
                                    keuangan:
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {unimportedOrders.slice(0, 3).map((ord) => (
                                    <Button
                                        key={ord.id}
                                        type="button"
                                        size="sm"
                                        disabled={importingOrderId === ord.id}
                                        onClick={() =>
                                            handleImportOrder(ord.id)
                                        }
                                        className="h-8.5 cursor-pointer gap-1.5 rounded-xl bg-violet-600 px-3 text-[11px] font-bold text-white hover:bg-violet-700"
                                    >
                                        <Plus className="size-3" />
                                        <span>
                                            Impor #{ord.tracking_code} (
                                            {formatCurrencyIdr(ord.total_amount)}
                                            )
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. AUTOMATIC PROJECT BUDGET & FINANCIAL REALIZATION MATRIX */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                                Budget &amp; Realisasi per Proyek (
                                {filteredProjectFinancials.length})
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Proyek PMS yang aktif muncul otomatis di sini.
                                Klik proyek untuk memfilter mutasi atau catat
                                transaksi baru.
                            </p>
                        </div>

                        <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-slate-950/70">
                            {(
                                [
                                    { id: 'all', label: 'Semua' },
                                    { id: 'active', label: 'Berjalan' },
                                    { id: 'completed', label: 'Selesai' },
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setProjectStatusFilter(tab.id)
                                    }
                                    className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                                        projectStatusFilter === tab.id
                                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredProjectFinancials.length === 0 ? (
                        <div className="glass-panel rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-white/10">
                            <FolderKanban className="mx-auto size-8 text-slate-400" />
                            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Belum ada proyek PMS untuk ditampilkan
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                Inisialisasi proyek baru di Manajemen Proyek dan
                                budgetnya akan muncul di sini secara otomatis.
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-4 h-9 rounded-xl text-xs font-semibold"
                            >
                                <Link href="/studio/pms/projects/create">
                                    Buat Proyek Pertama
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjectFinancials.map((pf) => {
                                const statusMeta =
                                    PROJECT_STATUS_META[pf.status] ??
                                    PROJECT_STATUS_META.planning;
                                const isFilteredProject =
                                    selectedProject === String(pf.id);

                                return (
                                    <div
                                        key={pf.id}
                                        className={`glass-panel flex flex-col justify-between gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${
                                            isFilteredProject
                                                ? 'border-violet-500/60 ring-2 ring-violet-500/20'
                                                : 'border-slate-200/85 hover:border-violet-500/35 dark:border-white/10'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300">
                                                            {pf.code}
                                                        </span>
                                                        {pf.order_tracking_code && (
                                                            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                                #
                                                                {
                                                                    pf.order_tracking_code
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/studio/pms/projects/${pf.id}`}
                                                        className="line-clamp-1 font-[family-name:var(--font-brand)] text-sm font-bold text-slate-900 transition-colors hover:text-violet-600 dark:text-white dark:hover:text-violet-400"
                                                    >
                                                        {pf.name}
                                                    </Link>
                                                    {pf.client && (
                                                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                            Klien: {pf.client}
                                                        </p>
                                                    )}
                                                </div>

                                                <Badge
                                                    variant="outline"
                                                    className={`shrink-0 gap-1 text-[10px] font-semibold ${statusMeta.badgeClass}`}
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${statusMeta.dotClass}`}
                                                    />
                                                    {statusMeta.label}
                                                </Badge>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/70 bg-slate-50/75 p-2.5 text-xs dark:border-white/10 dark:bg-slate-950/50">
                                                <div>
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        Nilai Budget
                                                    </span>
                                                    <div className="font-bold text-slate-900 tabular-nums dark:text-white">
                                                        {formatCurrencyIdr(
                                                            pf.budget,
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        Sisa Budget
                                                    </span>
                                                    <div className="font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
                                                        {formatCurrencyIdr(
                                                            pf.remaining,
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        Pemasukan Masuk
                                                    </span>
                                                    <div className="font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                                                        {formatCurrencyIdr(
                                                            pf.income,
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        Pengeluaran
                                                    </span>
                                                    <div className="font-bold text-rose-600 tabular-nums dark:text-rose-400">
                                                        {formatCurrencyIdr(
                                                            pf.expense,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Burn Rate Bar */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-medium text-slate-500">
                                                        Serapan Biaya (Burn
                                                        Rate)
                                                    </span>
                                                    <span className="font-mono font-bold text-slate-700 tabular-nums dark:text-slate-300">
                                                        {pf.burn_rate}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                                                    <div
                                                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getBurnBarTone(pf.burn_rate)}`}
                                                        style={{
                                                            width: `${Math.min(100, pf.burn_rate)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3 dark:border-white/10">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        isFilteredProject
                                                            ? 'all'
                                                            : String(pf.id),
                                                        selectedType,
                                                    )
                                                }
                                                className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                    isFilteredProject
                                                        ? 'bg-violet-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <Filter className="size-3" />
                                                {isFilteredProject
                                                    ? 'Filter Aktif'
                                                    : 'Mutasi'}
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openCreateModal(pf.id)
                                                    }
                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-700 transition-colors hover:bg-violet-500/20 dark:text-violet-300"
                                                >
                                                    <Plus className="size-3" />
                                                    Catat
                                                </button>
                                                <Link
                                                    href={`/studio/pms/projects/${pf.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-violet-500/40 hover:text-violet-600 dark:border-white/10 dark:text-slate-300"
                                                >
                                                    <span>Detail</span>
                                                    <ArrowUpRight className="size-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 5. FILTER AND TRANSACTIONS LEDGER */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                            Daftar Transaksi Keuangan ({finances.total})
                        </h2>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Select
                                value={selectedProject}
                                onValueChange={(val) =>
                                    handleFilterChange(val, selectedType)
                                }
                            >
                                <SelectTrigger className="h-9.5 w-full rounded-xl bg-white text-xs sm:w-52 dark:bg-slate-900">
                                    <SelectValue placeholder="Pilih Proyek" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">
                                        Semua Proyek &amp; Umum
                                    </SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedType}
                                onValueChange={(val) =>
                                    handleFilterChange(selectedProject, val)
                                }
                            >
                                <SelectTrigger className="h-9.5 w-full rounded-xl bg-white text-xs sm:w-44 dark:bg-slate-900">
                                    <SelectValue placeholder="Tipe Transaksi" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">
                                        Semua Tipe
                                    </SelectItem>
                                    <SelectItem value="income">
                                        Pemasukan Saja
                                    </SelectItem>
                                    <SelectItem value="project_expense">
                                        Biaya Proyek Saja
                                    </SelectItem>
                                    <SelectItem value="general_expense">
                                        Biaya Umum Saja
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {(selectedProject !== 'all' ||
                                selectedType !== 'all') && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        handleFilterChange('all', 'all')
                                    }
                                    className="h-9.5 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-500"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Desktop Responsive Table */}
                    <div className="glass-panel hidden overflow-hidden rounded-2xl border border-slate-200/85 shadow-sm md:block dark:border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/75 font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950/50">
                                        <th className="px-4 py-3">Tanggal</th>
                                        <th className="px-4 py-3">Jenis</th>
                                        <th className="px-4 py-3">
                                            Keterangan
                                        </th>
                                        <th className="px-4 py-3">
                                            Proyek Terkait
                                        </th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3 text-right">
                                            Nominal
                                        </th>
                                        <th className="px-4 py-3 text-center">
                                            Bukti
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {finances.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="py-12 text-center text-slate-400"
                                            >
                                                Belum ada catatan mutasi
                                                transaksi yang sesuai filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        finances.data.map((fin) => (
                                            <tr
                                                key={fin.id}
                                                className="transition-colors hover:bg-violet-500/[0.03]"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                                    {String(
                                                        fin.transaction_date,
                                                    ).slice(0, 10)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge
                                                        className={
                                                            fin.type ===
                                                            'income'
                                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : fin.type ===
                                                                    'project_expense'
                                                                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                                  : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        }
                                                    >
                                                        {fin.type === 'income'
                                                            ? 'Pemasukan'
                                                            : fin.type ===
                                                                'project_expense'
                                                              ? 'Biaya Proyek'
                                                              : 'Biaya Umum'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                                    {fin.title}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                    {fin.project ? (
                                                        <Link
                                                            href={`/studio/pms/projects/${fin.project.id}`}
                                                            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
                                                        >
                                                            {fin.project.name}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-slate-400 italic">
                                                            Umum / Operasional
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {fin.category ?? '-'}
                                                </td>
                                                <td
                                                    className={`px-4 py-3 text-right font-bold whitespace-nowrap tabular-nums ${
                                                        fin.type === 'income'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-slate-900 dark:text-white'
                                                    }`}
                                                >
                                                    {fin.type === 'income'
                                                        ? '+'
                                                        : '-'}
                                                    {formatCurrencyIdr(
                                                        fin.amount,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {fin.receipt_file ||
                                                    fin.receipt_url ? (
                                                        <a
                                                            href={
                                                                fin.receipt_url ??
                                                                (fin.receipt_file?.startsWith(
                                                                    'http',
                                                                ) ||
                                                                fin.receipt_file?.startsWith(
                                                                    '/',
                                                                )
                                                                    ? fin.receipt_file
                                                                    : `/storage/${fin.receipt_file}`)
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 font-medium text-violet-600 hover:underline dark:text-violet-400"
                                                        >
                                                            <Receipt className="size-3" />
                                                            <span>Bukti</span>
                                                            <ExternalLink className="size-2.5" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setDeletingFinance(
                                                                fin,
                                                            )
                                                        }
                                                        className="size-7 cursor-pointer rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Transaction Cards */}
                    <div className="space-y-3 md:hidden">
                        {finances.data.length === 0 ? (
                            <div className="glass-panel rounded-2xl border border-slate-200/85 p-8 text-center text-xs text-slate-400 dark:border-white/10">
                                Belum ada catatan mutasi transaksi yang sesuai
                                filter.
                            </div>
                        ) : (
                            finances.data.map((fin) => (
                                <div
                                    key={fin.id}
                                    className="glass-panel space-y-2.5 rounded-2xl border border-slate-200/85 p-4 dark:border-white/10"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 space-y-1">
                                            <Badge
                                                className={
                                                    fin.type === 'income'
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : fin.type ===
                                                            'project_expense'
                                                          ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                          : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                }
                                            >
                                                {fin.type === 'income'
                                                    ? 'Pemasukan'
                                                    : fin.type ===
                                                        'project_expense'
                                                      ? 'Biaya Proyek'
                                                      : 'Biaya Umum'}
                                            </Badge>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {fin.title}
                                            </div>
                                        </div>
                                        <div
                                            className={`shrink-0 text-sm font-extrabold tabular-nums ${
                                                fin.type === 'income'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-slate-900 dark:text-white'
                                            }`}
                                        >
                                            {fin.type === 'income' ? '+' : '-'}
                                            {formatCurrencyIdr(fin.amount)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>
                                            {fin.project
                                                ? fin.project.name
                                                : 'Umum / Operasional'}
                                        </span>
                                        <span>
                                            {String(fin.transaction_date).slice(
                                                0,
                                                10,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-white/10">
                                        <span className="text-[11px] text-slate-400">
                                            {fin.category ?? 'Tanpa kategori'}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setDeletingFinance(fin)
                                            }
                                            className="h-7 cursor-pointer gap-1 rounded-lg px-2 text-[11px] text-rose-500 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="size-3" />
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Create Finance Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-md dark:border-white/10 dark:bg-[#0c152a]/95">
                        <div className="shrink-0 border-b border-slate-200/75 px-5 pt-5 pb-4 pr-12 sm:px-6 dark:border-white/10">
                            <DialogHeader className="text-left">
                                <DialogTitle className="font-[family-name:var(--font-brand)] text-lg font-extrabold text-slate-900 dark:text-white">
                                    Catat Transaksi Keuangan
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Masukkan termin masuk atau pengeluaran proyek
                                    dan operasional studio.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <form
                            onSubmit={handleCreateSubmit}
                            className="flex min-h-0 flex-1 flex-col overflow-hidden"
                        >
                            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-4 sm:px-6">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Tipe Transaksi *
                                    </Label>
                                    <Select
                                        value={financeForm.data.type}
                                        onValueChange={(val: string) =>
                                            financeForm.setData('type', val)
                                        }
                                    >
                                        <SelectTrigger className="h-9.5 w-full rounded-xl text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">
                                                Pemasukan (Termin Klien)
                                            </SelectItem>
                                            <SelectItem value="project_expense">
                                                Pengeluaran Proyek (Langsung)
                                            </SelectItem>
                                            <SelectItem value="general_expense">
                                                Pengeluaran Operasional Umum
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {financeForm.data.type !==
                                    'general_expense' && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">
                                            Tautkan ke Proyek
                                        </Label>
                                        <Select
                                            value={String(
                                                financeForm.data.project_id,
                                            )}
                                            onValueChange={(val) =>
                                                financeForm.setData(
                                                    'project_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-9.5 w-full rounded-xl text-xs [&>span]:truncate">
                                                <SelectValue placeholder="Pilih Proyek" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Keterangan / Judul Transaksi *
                                    </Label>
                                    <Input
                                        required
                                        value={financeForm.data.title}
                                        onChange={(e) =>
                                            financeForm.setData(
                                                'title',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Pembayaran Termin 1 / Sewa Cloud Server"
                                        className="h-9.5 rounded-xl text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">
                                            Nominal (Rp) *
                                        </Label>
                                        <Input
                                            required
                                            type="number"
                                            value={financeForm.data.amount}
                                            onChange={(e) =>
                                                financeForm.setData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            className="h-9.5 rounded-xl text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">
                                            Tanggal Transaksi
                                        </Label>
                                        <Input
                                            type="date"
                                            value={
                                                financeForm.data
                                                    .transaction_date
                                            }
                                            onChange={(e) =>
                                                financeForm.setData(
                                                    'transaction_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9.5 rounded-xl text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Kategori
                                    </Label>
                                    <Input
                                        value={financeForm.data.category}
                                        onChange={(e) =>
                                            financeForm.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Milestone Payment, Hosting, Lisensi"
                                        className="h-9.5 rounded-xl text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Catatan (Opsional)
                                    </Label>
                                    <Textarea
                                        rows={2}
                                        value={financeForm.data.notes}
                                        onChange={(e) =>
                                            financeForm.setData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Catatan tambahan transaksi..."
                                        className="rounded-xl text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Unggah Struk / Bukti Bayar
                                    </Label>
                                    <Input
                                        type="file"
                                        onChange={(e) =>
                                            financeForm.setData(
                                                'receipt',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="h-9.5 rounded-xl text-xs"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="shrink-0 gap-2 border-t border-slate-200/75 bg-slate-50/60 px-5 py-3.5 sm:px-6 dark:border-white/10 dark:bg-slate-950/50">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="cursor-pointer rounded-xl text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={financeForm.processing}
                                    className="cursor-pointer rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-700"
                                >
                                    Simpan Transaksi
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Konfirmasi Hapus Transaksi */}
                <Dialog
                    open={Boolean(deletingFinance)}
                    onOpenChange={(open) => !open && setDeletingFinance(null)}
                >
                    <DialogContent className="max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c152a]/95">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-brand)] text-base font-extrabold text-slate-900 dark:text-white">
                                <Trash2 className="size-4 text-rose-500" />
                                Hapus Catatan Transaksi?
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-xs text-slate-500">
                                Apakah Anda yakin ingin menghapus catatan
                                transaksi{' '}
                                <strong className="text-slate-700 dark:text-slate-300">
                                    {deletingFinance?.title ||
                                        deletingFinance?.category ||
                                        'ini'}{' '}
                                    (
                                    {formatCurrencyIdr(
                                        deletingFinance?.amount || 0,
                                    )}
                                    )
                                </strong>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeletingFinance(null)}
                                className="h-9 cursor-pointer rounded-xl text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDelete}
                                className="h-9 cursor-pointer rounded-xl text-xs font-bold"
                            >
                                Hapus Transaksi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
