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
    ArrowDownRight,
    ArrowUpRight,
    Coins,
    DollarSign,
    ExternalLink,
    FolderKanban,
    Plus,
    Receipt,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { PmsFinance, PmsProject } from '@/types/pms';

interface Props {
    finances: {
        data: PmsFinance[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    projects: PmsProject[];
    projectFinancials: any[];
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

export default function FinancesIndex({
    finances,
    projects,
    projectFinancials,
    summary,
    filters,
}: Props) {
    const [selectedProject, setSelectedProject] = useState(filters.project_id ? String(filters.project_id) : 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingFinance, setDeletingFinance] = useState<PmsFinance | null>(null);

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

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val) || 0);
    };

    const handleFilterChange = (proj: string, typ: string) => {
        router.get(
            '/studio/pms/finances',
            {
                project_id: proj !== 'all' ? proj : undefined,
                type: typ !== 'all' ? typ : undefined,
            },
            { preserveState: true }
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        financeForm.post('/studio/pms/finances', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Transaksi keuangan berhasil dicatat');
                setIsCreateOpen(false);
                financeForm.reset();
            },
            onError: (err) => toast.error(Object.values(err)[0] as string || 'Gagal menyimpan transaksi'),
        });
    };

    const confirmDelete = () => {
        if (!deletingFinance) return;
        router.delete(`/studio/pms/finances/${deletingFinance.id}`, {
            onSuccess: () => {
                toast.success('Transaksi keuangan berhasil dihapus');
                setDeletingFinance(null);
            },
        });
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Coins className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Keuangan & Realisasi Anggaran Proyek
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Pantau arus kas termin klien, biaya langsung proyek, serta beban operasional studio.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 gap-2 h-10 px-4"
                    >
                        <Plus className="size-4" />
                        Catat Transaksi Keuangan
                    </Button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm">
                        <div className="text-xs font-semibold text-slate-500 uppercase">Total Pemasukan</div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {formatCurrency(summary.total_income)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <TrendingUp className="size-3 text-emerald-500" /> Dari termin & pembayaran klien
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm">
                        <div className="text-xs font-semibold text-slate-500 uppercase">Pengeluaran Proyek</div>
                        <div className="text-2xl font-extrabold text-rose-500 mt-2">
                            {formatCurrency(summary.total_project_expenses)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <TrendingDown className="size-3 text-rose-500" /> Biaya server, asset, dan tools
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm">
                        <div className="text-xs font-semibold text-slate-500 uppercase">Operasional Studio</div>
                        <div className="text-2xl font-extrabold text-amber-500 mt-2">
                            {formatCurrency(summary.total_general_expenses)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Beban operasional umum</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm">
                        <div className="text-xs font-semibold text-slate-500 uppercase">Margin Bersih (Net)</div>
                        <div className={`text-2xl font-extrabold mt-2 ${summary.net_margin >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                            {formatCurrency(summary.net_margin)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Total Pemasukan - Semua Beban</div>
                    </div>
                </div>

                {/* Filter and Transactions Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Daftar Transaksi Keuangan
                        </h2>

                        <div className="flex items-center gap-3">
                            <Select
                                value={selectedProject}
                                onValueChange={(val) => {
                                    setSelectedProject(val);
                                    handleFilterChange(val, selectedType);
                                }}
                            >
                                <SelectTrigger className="w-52 h-9 rounded-xl text-xs bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="Pilih Proyek" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Proyek & Umum</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedType}
                                onValueChange={(val) => {
                                    setSelectedType(val);
                                    handleFilterChange(selectedProject, val);
                                }}
                            >
                                <SelectTrigger className="w-44 h-9 rounded-xl text-xs bg-white dark:bg-slate-900">
                                    <SelectValue placeholder="Tipe Transaksi" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="income">Pemasukan Saja</SelectItem>
                                    <SelectItem value="project_expense">Biaya Proyek Saja</SelectItem>
                                    <SelectItem value="general_expense">Biaya Umum Saja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 overflow-hidden shadow-sm backdrop-blur-xl">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 font-semibold text-slate-500">
                                    <th className="py-3 px-4">Tanggal</th>
                                    <th className="py-3 px-4">Jenis</th>
                                    <th className="py-3 px-4">Keterangan</th>
                                    <th className="py-3 px-4">Proyek Terkait</th>
                                    <th className="py-3 px-4">Kategori</th>
                                    <th className="py-3 px-4 text-right">Nominal</th>
                                    <th className="py-3 px-4 text-center">Struk / Bukti</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {finances.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400">
                                            Tidak ada catatan transaksi yang sesuai kriteria.
                                        </td>
                                    </tr>
                                ) : (
                                    finances.data.map((fin) => (
                                        <tr key={fin.id} className="hover:bg-violet-500/[0.02]">
                                            <td className="py-3 px-4 text-slate-500">{fin.transaction_date}</td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    className={
                                                        fin.type === 'income'
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : fin.type === 'project_expense'
                                                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                    }
                                                >
                                                    {fin.type === 'income'
                                                        ? 'Pemasukan'
                                                        : fin.type === 'project_expense'
                                                        ? 'Biaya Proyek'
                                                        : 'Biaya Umum'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                                {fin.title}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                {fin.project ? (
                                                    <Link
                                                        href={`/studio/pms/projects/${fin.project.id}`}
                                                        className="text-violet-600 hover:underline font-medium"
                                                    >
                                                        {fin.project.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400 italic">Umum / Operasional</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">{fin.category ?? '-'}</td>
                                            <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(fin.amount)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {fin.receipt_file || fin.receipt_url ? (
                                                    <a
                                                        href={fin.receipt_url ?? (fin.receipt_file?.startsWith('http') || fin.receipt_file?.startsWith('/') ? fin.receipt_file : `/storage/${fin.receipt_file}`)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                                                    >
                                                        <Receipt className="size-3" /> Bukti
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setDeletingFinance(fin)}
                                                    className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer"
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

                {/* Create Finance Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Catat Transaksi Keuangan</DialogTitle>
                            <DialogDescription className="text-xs">
                                Masukkan termin masuk atau pengeluaran proyek dan operasional.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Tipe Transaksi *</Label>
                                <Select
                                    value={financeForm.data.type}
                                    onValueChange={(val: any) => financeForm.setData('type', val)}
                                >
                                    <SelectTrigger className="rounded-xl h-9 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Pemasukan (Termin Klien)</SelectItem>
                                        <SelectItem value="project_expense">Pengeluaran Proyek (Langsung)</SelectItem>
                                        <SelectItem value="general_expense">Pengeluaran Operasional Umum</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {financeForm.data.type !== 'general_expense' && (
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Tautkan ke Proyek</Label>
                                    <Select
                                        value={String(financeForm.data.project_id)}
                                        onValueChange={(val) => financeForm.setData('project_id', val)}
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
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Keterangan / Judul Transaksi *</Label>
                                <Input
                                    required
                                    value={financeForm.data.title}
                                    onChange={(e) => financeForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Pembayaran Pelunasan Proyek / Sewa Cloud Server"
                                    className="rounded-xl h-9"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Nominal (Rp) *</Label>
                                    <Input
                                        required
                                        type="number"
                                        value={financeForm.data.amount}
                                        onChange={(e) => financeForm.setData('amount', e.target.value)}
                                        placeholder="0"
                                        className="rounded-xl h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Tanggal Transaksi</Label>
                                    <Input
                                        type="date"
                                        value={financeForm.data.transaction_date}
                                        onChange={(e) => financeForm.setData('transaction_date', e.target.value)}
                                        className="rounded-xl h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Kategori</Label>
                                <Input
                                    value={financeForm.data.category}
                                    onChange={(e) => financeForm.setData('category', e.target.value)}
                                    placeholder="Contoh: Milestone Payment, Hosting, Lisensi"
                                    className="rounded-xl h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-semibold">Unggah Struk / Bukti Bayar</Label>
                                <Input
                                    type="file"
                                    onChange={(e) => financeForm.setData('receipt', e.target.files?.[0] || null)}
                                    className="rounded-xl text-xs h-9"
                                />
                            </div>

                            <DialogFooter className="gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Batal</Button>
                                <Button type="submit" disabled={financeForm.processing} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white">Simpan Transaksi</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Konfirmasi Hapus Transaksi */}
                <Dialog open={Boolean(deletingFinance)} onOpenChange={(open) => !open && setDeletingFinance(null)}>
                    <DialogContent className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Trash2 className="size-4 text-rose-500" />
                                Hapus Catatan Transaksi?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                Apakah Anda yakin ingin menghapus catatan transaksi{' '}
                                <strong className="text-slate-700 dark:text-slate-300">
                                    {deletingFinance?.category || 'ini'} ({formatCurrency(deletingFinance?.amount || 0)})
                                </strong>? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setDeletingFinance(null)} className="rounded-xl h-9 text-xs">
                                Batal
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmDelete} className="rounded-xl h-9 text-xs font-bold">
                                Hapus Transaksi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
