import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ShoppingBag,
    ExternalLink,
    CheckCircle2,
    Clock,
    User,
    Mail,
    Phone,
    Copy,
    Check,
    Search,
    X,
    ShieldCheck,
    Globe,
    MessageSquare,
    KeyRound,
    Lock,
    Unlock,
    Layers,
    FileCode,
    Sparkles,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    Send,
    Eye,
    EyeOff,
    Zap,
    Activity,
    FolderKanban,
    Coins,
    Laptop,
    Receipt,
} from 'lucide-react';
import { ProjectOrder, ProjectMilestone, HandoverData, PaginatedData } from '@/types/admin';
import { toast } from 'sonner';

interface OrdersIndexProps {
    orders: PaginatedData<ProjectOrder>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function OrdersIndex({ orders, filters }: OrdersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
    const [copiedCredential, setCopiedCredential] = useState<string | null>(null);
    const [showVaultPassword, setShowVaultPassword] = useState(false);

    // Active tab in the inline workbench: 'status' | 'milestones' | 'handover' | 'revisions'
    const [activeTab, setActiveTab] = useState<'status' | 'milestones' | 'handover' | 'revisions'>('status');

    const updateForm = useForm<{
        status: 'pending_payment' | 'in_progress' | 'in_review' | 'completed' | 'cancelled';
        payment_scheme?: 'down_payment' | 'full_payment' | string;
        payment_stage?: 'awaiting_dp' | 'dp_paid' | 'awaiting_final' | 'fully_paid' | string;
        dp_percentage?: number | string;
        dp_amount?: number | string;
        remaining_amount?: number | string;
        staging_url: string;
        notes: string;
        milestone_progress: ProjectMilestone[];
        handover_data: HandoverData;
    }>({
        status: 'pending_payment',
        payment_scheme: 'down_payment',
        payment_stage: 'awaiting_dp',
        dp_percentage: 50,
        dp_amount: 0,
        remaining_amount: 0,
        staging_url: '',
        notes: '',
        milestone_progress: [],
        handover_data: {},
    });

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    // Cockpit Metrics Overview
    const totalOrdersCount = orders.total ?? orders.data.length;
    const inProgressCount = orders.data.filter((o) => o.status === 'in_progress').length;
    const inReviewCount = orders.data.filter((o) => o.status === 'in_review').length;
    const completedCount = orders.data.filter((o) => o.status === 'completed').length;
    const totalEscrowVolume = orders.data.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedTracking(code);
        toast.success(`Tracking code #${code} disalin`);
        setTimeout(() => setCopiedTracking(null), 2000);
    };

    const handleCopyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCredential(label);
        toast.success(`${label} disalin`);
        setTimeout(() => setCopiedCredential(null), 2000);
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/admin/orders',
            { ...filters, search: val },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilter = (statusVal: string) => {
        router.get(
            '/admin/orders',
            { ...filters, status: statusVal },
            { preserveState: true }
        );
    };

    const toggleExpandOrder = (order: ProjectOrder) => {
        if (expandedOrderId === order.id) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(order.id);
        setActiveTab('status');

        const defaultMilestones: ProjectMilestone[] = [
            {
                id: 'deposit',
                title: 'Deposit Rekber Terverifikasi',
                description: 'Pembayaran klien diamankan di rekening bersama (escrow).',
                status: ['in_progress', 'in_review', 'completed'].includes(order.status) ? 'completed' : 'pending',
                updated_at: order.created_at,
            },
            {
                id: 'design',
                title: 'Perancangan UI/UX & Arsitektur',
                description: 'Penyusunan mockup visual, skema warna, dan arsitektur database.',
                status: ['in_review', 'completed'].includes(order.status)
                    ? 'completed'
                    : order.status === 'in_progress'
                    ? 'in_progress'
                    : 'pending',
                updated_at: null,
            },
            {
                id: 'development',
                title: 'Pengembangan Sistem & Fitur',
                description: 'Pengkodean frontend, modul backend, dan integrasi fitur interaktif.',
                status: ['in_review', 'completed'].includes(order.status)
                    ? 'completed'
                    : order.status === 'in_progress'
                    ? 'in_progress'
                    : 'pending',
                updated_at: null,
            },
            {
                id: 'staging',
                title: 'Preview Staging Live & Uji Coba Klien',
                description: 'Website aktif di server preview agar klien dapat menguji coba langsung.',
                status: order.status === 'completed'
                    ? 'completed'
                    : order.status === 'in_review'
                    ? 'completed'
                    : 'pending',
                updated_at: null,
            },
            {
                id: 'handover',
                title: 'Persetujuan Final & Serah Terima Aset',
                description: 'Pencairan dana rekber dan penyerahan repositori serta kredensial admin.',
                status: order.status === 'completed' ? 'completed' : 'pending',
                updated_at: null,
            },
        ];

        const currentDpPct = order.dp_percentage !== undefined && order.dp_percentage !== null
            ? Number(order.dp_percentage)
            : 50;
        const currentDpAmt = order.dp_amount !== undefined && order.dp_amount !== null
            ? Number(order.dp_amount)
            : Math.round((Number(order.total_amount) * currentDpPct) / 100);
        const currentRemAmt = order.remaining_amount !== undefined && order.remaining_amount !== null
            ? Number(order.remaining_amount)
            : (Number(order.total_amount) - currentDpAmt);

        updateForm.setData({
            status: order.status,
            payment_scheme: order.payment_scheme || 'down_payment',
            payment_stage: order.payment_stage || 'awaiting_dp',
            dp_percentage: currentDpPct,
            dp_amount: currentDpAmt,
            remaining_amount: currentRemAmt,
            staging_url: order.staging_url || '',
            notes: order.notes || '',
            milestone_progress: order.milestone_progress && order.milestone_progress.length > 0
                ? order.milestone_progress
                : defaultMilestones,
            handover_data: order.handover_data || {
                repository_url: '',
                live_domain_url: '',
                cms_admin_url: '/admin',
                cms_admin_username: order.client_email,
                cms_admin_password: '',
                documentation_url: '',
                notes: '',
            },
        });
    };

    const handleUpdateOrder = (e: React.FormEvent, orderId: number) => {
        e.preventDefault();

        updateForm.put(`/admin/orders/${orderId}`, {
            onSuccess: () => {
                toast.success('Data pesanan dan milestone berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui pesanan.');
            },
        });
    };

    const handleMilestoneStatusChange = (milestoneId: string, newStatus: 'completed' | 'in_progress' | 'pending') => {
        const updated = updateForm.data.milestone_progress.map((m) => {
            if (m.id === milestoneId) {
                return {
                    ...m,
                    status: newStatus,
                    updated_at: newStatus === 'completed' ? new Date().toISOString() : m.updated_at,
                };
            }
            return m;
        });
        updateForm.setData('milestone_progress', updated);
    };

    const getStatusPill = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Selesai (Completed)
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Dalam Pengerjaan
                    </span>
                );
            case 'in_review':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
                        Review Staging Klien
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        Dibatalkan
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
                        Menunggu Bayar
                    </span>
                );
        }
    };

    const getPaymentStageBadge = (order: ProjectOrder) => {
        if (order.payment_scheme === 'full_payment' || order.payment_scheme === 'full') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    Full Payment
                </span>
            );
        }

        const effectiveStage = (order.payment_stage === 'awaiting_dp' && (order.dp_transaction?.status === 'held' || order.dp_transaction?.status === 'released'))
            ? 'dp_paid'
            : order.payment_stage;

        switch (effectiveStage) {
            case 'fully_paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={11} />
                        Lunas 100% (2/2)
                    </span>
                );
            case 'awaiting_final':
            case 'final_unpaid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Clock size={11} className="animate-spin" />
                        DP Lunas • Tunggu Pelunasan
                    </span>
                );
            case 'dp_paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <ShieldCheck size={11} />
                        DP {order.dp_percentage || 50}% Terbayar
                    </span>
                );
            case 'awaiting_dp':
            case 'dp_unpaid':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <Clock size={11} />
                        Menunggu DP
                    </span>
                );
        }
    };

    const getWhatsAppUrl = (order: ProjectOrder) => {
        let phone = order.client_phone ? order.client_phone.replace(/\D/g, '') : '';
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }
        if (!phone) {
            phone = '6281284567890';
        }

        const projectTypeName = order.project_type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const trackerUrl = `${origin}/track-project/${order.tracking_code}`;

        let stageNote = '';
        if (order.payment_scheme === 'down_payment' || order.payment_scheme === 'milestone_dp') {
            if (order.payment_stage === 'dp_paid') {
                stageNote = `\nStatus Pembayaran: DP ${Number(order.dp_percentage) || 50}% telah diamankan di Rekening Bersama (Escrow), pengerjaan proyek berjalan aktif.\n`;
            } else if (order.payment_stage === 'awaiting_final' || order.payment_stage === 'final_unpaid') {
                stageNote = `\nStatus Pembayaran: Preview staging telah siap dan kesepakatan akhir tercapai. Silakan lakukan pelunasan akhir melalui portal untuk membuka brankas serah terima aset.\n`;
            } else if (order.payment_stage === 'fully_paid') {
                stageNote = `\nStatus Pembayaran: LUNAS 100% (Rekening Bersama / Escrow terverifikasi). Brankas kredensial & repositori telah dibuka penuh.\n`;
            }
        }

        const msg = encodeURIComponent(
            `Halo ${order.client_name}, ini Ridhwan Anang Ma'ruf terkait proyek pembuatan website ${projectTypeName} (Ref: #${order.tracking_code}).\n\n` +
            `Status pengerjaan saat ini: ${order.status.replace(/_/g, ' ').toUpperCase()}.${stageNote}\n` +
            `Anda dapat memantau progres langsung, mencoba demo live, dan memeriksa detail kontrak di portal klien berikut:\n` +
            `${trackerUrl}\n\n` +
            `Bila ada pertanyaan atau penyesuaian, silakan balas pesan ini. Terima kasih!`
        );

        return `https://wa.me/${phone}?text=${msg}`;
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio Cockpit', href: '/admin' },
                { title: 'Order Layanan & Escrow', href: '/admin/orders' },
            ]}
        >
            <Head title="Order Layanan & Delivery Command Center - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
                {/* 1. Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 shadow-xs">
                            <ShoppingBag size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Order{' '}
                                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text font-mono font-extrabold text-transparent">
                                    Layanan & Delivery Cockpit
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Pusat kendali pengerjaan pesanan software, update milestone terpadu, staging review, dan brankas serah terima aset (Handover Vault)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/layanan"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
                        >
                            <Laptop size={14} className="text-violet-500" />
                            <span>Kalkulator Layanan Publik</span>
                            <ExternalLink size={12} className="opacity-60" />
                        </Link>
                    </div>
                </div>

                {/* 2. Cockpit KPI Cards Row (Instant Situational Awareness) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Total Orders */}
                    <div className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pesanan</span>
                            <FolderKanban size={16} className="text-violet-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {totalOrdersCount}
                        </div>
                        <div className="text-[10.5px] text-slate-500">Semua proyek masuk</div>
                    </div>

                    {/* In Progress */}
                    <div className="p-4 rounded-3xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-blue-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Dalam Pengerjaan</span>
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full size-2 bg-blue-500" />
                            </span>
                        </div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                            {inProgressCount}
                        </div>
                        <div className="text-[10.5px] text-blue-600/70 dark:text-blue-400/70">Fokus coding aktif</div>
                    </div>

                    {/* In Review */}
                    <div className="p-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-amber-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Review Staging</span>
                            <AlertCircle size={16} className="text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            {inReviewCount}
                        </div>
                        <div className="text-[10.5px] text-amber-600/70 dark:text-amber-400/70">Menunggu feedback klien</div>
                    </div>

                    {/* Escrow Protected Total */}
                    <div className="p-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 backdrop-blur-xl shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-500">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Nilai Escrow Dilindungi</span>
                            <ShieldCheck size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono truncate">
                            {formatCurrency(totalEscrowVolume)}
                        </div>
                        <div className="text-[10.5px] text-emerald-600/70 dark:text-emerald-400/70">Escrow Terverifikasi</div>
                    </div>
                </div>

                {/* 3. Filter Bar HUD */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm">
                    {/* Search bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Cari kode tracking, nama klien, atau email..."
                            className="pl-10 pr-8 h-10 text-xs rounded-2xl border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 focus-visible:ring-violet-500/30"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => handleSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        {[
                            { key: 'all', label: 'Semua Status' },
                            { key: 'pending_payment', label: 'Menunggu Bayar' },
                            { key: 'in_progress', label: 'Pengerjaan' },
                            { key: 'in_review', label: 'Review Staging' },
                            { key: 'completed', label: 'Selesai' },
                        ].map((tab) => {
                            const isActive =
                                (!filters.status && tab.key === 'all') ||
                                filters.status === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleStatusFilter(tab.key === 'all' ? '' : tab.key)}
                                    className={`px-3 py-1.5 text-xs rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Orders List (Distinctive Modular Studio Mission Control Cards) */}
                {orders.data.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
                        <ShoppingBag className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Pesanan Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {search
                                ? `Tidak ada pesanan yang sesuai dengan pencarian "${search}".`
                                : 'Belum ada pesanan klien yang masuk.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.data.map((order) => {
                            const isExpanded = expandedOrderId === order.id;

                            // Calculate milestone completion for this order
                            const milestones = order.milestone_progress && order.milestone_progress.length > 0
                                ? order.milestone_progress
                                : [];
                            const doneMilestones = milestones.filter((m) => m.status === 'completed').length;
                            const totalMilestonesCount = milestones.length || 5;
                            const milestonePct = Math.round((doneMilestones / totalMilestonesCount) * 100);

                            return (
                                <div
                                    key={order.id}
                                    className={`rounded-[2.2rem] border transition-all duration-300 overflow-hidden ${
                                        isExpanded
                                            ? 'border-violet-500/50 bg-white/95 dark:bg-slate-900/90 ring-2 ring-violet-500/20 shadow-2xl'
                                            : 'border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-lg shadow-slate-100/50 dark:shadow-none hover:border-violet-500/30'
                                    }`}
                                >
                                    {/* TOP MICRO-HEADER STRIP */}
                                    <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            {/* Tracking Code Pill */}
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(order.tracking_code)}
                                                className="cursor-pointer font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 border border-violet-500/20 transition-all flex items-center gap-1.5"
                                                title="Klik untuk salin kode"
                                            >
                                                {copiedTracking === order.tracking_code ? (
                                                    <Check className="size-3 text-emerald-500" />
                                                ) : (
                                                    <Copy className="size-3 opacity-60" />
                                                )}
                                                <span>#{order.tracking_code}</span>
                                            </button>

                                            {/* Project Type Badge */}
                                            <span className="capitalize font-bold text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-[11px] flex items-center gap-1">
                                                <Layers size={12} className="text-violet-500" />
                                                <span>{order.project_type.replace(/_/g, ' ')}</span>
                                            </span>

                                            {/* Speed Badge */}
                                            <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                                                {order.delivery_speed === 'express' ? '⚡ Express Priority' : '⏱️ Standar'}
                                            </span>

                                            {/* Payment Stage Badge */}
                                            {getPaymentStageBadge(order)}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Creation Date */}
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </span>

                                            {/* Status Badge */}
                                            <div>{getStatusPill(order.status)}</div>
                                        </div>
                                    </div>

                                    {/* MAIN BODY: 3-COLUMN STRUCTURED RESPONSIVE GRID */}
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                        {/* COL 1: CLIENT DOSSIER (4 COLS) */}
                                        <div className="md:col-span-5 flex items-center gap-4 min-w-0">
                                            {/* Initials Avatar */}
                                            <div className="size-13 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shrink-0 shadow-sm">
                                                <div className="size-full rounded-[0.95rem] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-sm text-violet-600 dark:text-violet-300">
                                                    {order.client_name.slice(0, 2).toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="min-w-0 space-y-1">
                                                <h3 className="text-base font-black text-slate-900 dark:text-white truncate leading-tight">
                                                    {order.client_name}
                                                </h3>

                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    <Mail size={12} className="shrink-0 opacity-70" />
                                                    <span className="font-mono truncate">{order.client_email}</span>
                                                </div>

                                                {order.client_phone && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                                                        <Phone size={11} className="shrink-0 opacity-70" />
                                                        <span>{order.client_phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* COL 2: PRODUCTION HEALTH & MILESTONES (4 COLS) */}
                                        <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-5">
                                            {/* Milestone Progress Mini-Tracker */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-bold text-slate-500">Tahapan Progress:</span>
                                                    <span className="font-mono font-black text-violet-600 dark:text-violet-400">
                                                        {doneMilestones}/{totalMilestonesCount} ({milestonePct}%)
                                                    </span>
                                                </div>

                                                {/* Mini Stepper Dots */}
                                                <div className="flex items-center gap-1.5">
                                                    {[0, 1, 2, 3, 4].map((stepIdx) => {
                                                        const isDone = stepIdx < doneMilestones;
                                                        const isCurrent = stepIdx === doneMilestones && order.status !== 'completed';
                                                        return (
                                                            <div
                                                                key={stepIdx}
                                                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                                                    isDone
                                                                        ? 'bg-emerald-500'
                                                                        : isCurrent
                                                                        ? 'bg-violet-600 animate-pulse'
                                                                        : 'bg-slate-200 dark:bg-slate-800'
                                                                }`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Staging Preview Status */}
                                            <div className="flex items-center justify-between text-xs pt-0.5">
                                                <span className="text-[11px] text-slate-400">Demo Staging:</span>
                                                {order.staging_url ? (
                                                    <a
                                                        href={order.staging_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                                                    >
                                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                                                        <span>Live Staging</span>
                                                        <ExternalLink size={11} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">Belum diunggah</span>
                                                )}
                                            </div>

                                            {/* Revisions Alert (If present) */}
                                            {order.revision_notes && order.revision_notes.length > 0 && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10.5px] font-bold">
                                                    <AlertCircle size={12} />
                                                    <span>{order.revision_notes.length} Catatan Revisi Klien Menunggu</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* COL 3: FINANCIAL VALUE & ESCROW BADGE (3 COLS) */}
                                        <div className="md:col-span-3 text-left md:text-right border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-5 space-y-2">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                    Nilai Kontrak Layanan
                                                </span>
                                                <div className="font-mono text-lg font-black text-slate-900 dark:text-white">
                                                    {formatCurrency(order.total_amount)}
                                                </div>
                                            </div>

                                            {/* Milestone DP / Pelunasan Breakdown */}
                                            {order.payment_scheme !== 'full_payment' && order.payment_scheme !== 'full' ? (
                                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 text-[11px] font-mono space-y-1 text-left md:text-right">
                                                    <div className="flex items-center justify-between md:justify-end gap-2 text-slate-500">
                                                        <span>Termin 1 (DP {order.dp_percentage || 50}%):</span>
                                                        <span className={`font-bold ${['dp_paid', 'awaiting_final', 'final_unpaid', 'fully_paid'].includes(order.payment_stage || '') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                            {formatCurrency(order.dp_amount || Math.round(Number(order.total_amount) * 0.5))}
                                                            {['dp_paid', 'awaiting_final', 'final_unpaid', 'fully_paid'].includes(order.payment_stage || '') ? ' ✓' : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between md:justify-end gap-2 text-slate-500">
                                                        <span>Termin 2 (Pelunasan):</span>
                                                        <span className={`font-bold ${order.payment_stage === 'fully_paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                            {formatCurrency(order.remaining_amount || Math.round(Number(order.total_amount) * 0.5))}
                                                            {order.payment_stage === 'fully_paid' ? ' ✓' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null}

                                            <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck size={13} />
                                                <span>
                                                    {order.status === 'completed'
                                                        ? 'Rekber Dicairkan'
                                                        : order.payment_stage === 'fully_paid'
                                                        ? 'Dana 100% Ditahan'
                                                        : ['dp_paid', 'awaiting_final', 'final_unpaid'].includes(order.payment_stage || '')
                                                        ? 'DP Ditahan di Escrow'
                                                        : 'Rekening Bersama (Escrow)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD ACTION TOOLBAR (SEPARATED BOTTOM STRIP) */}
                                    <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                                        {/* Left Notes/Addon Excerpt */}
                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                                            {order.selected_features && order.selected_features.length > 0 ? (
                                                <span className="font-medium">
                                                    Add-ons: {order.selected_features.join(', ').replace(/_/g, ' ')}
                                                </span>
                                            ) : order.notes ? (
                                                <span className="italic truncate">"{order.notes}"</span>
                                            ) : (
                                                <span className="text-slate-400">Paket website standar</span>
                                            )}
                                        </div>

                                        {/* Right Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            {/* WhatsApp Dispatch Button */}
                                            <a
                                                href={getWhatsAppUrl(order)}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Kirim Update Progres via WhatsApp ke Klien"
                                                className="h-8.5 px-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                            >
                                                <MessageSquare className="size-3.5 text-emerald-600" />
                                                <span>WA Klien</span>
                                            </a>

                                            {/* Client Tracker Link */}
                                            <a
                                                href={`/track-project/${order.tracking_code}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Buka Halaman Pelacak Klien"
                                                className="h-8.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                            >
                                                <span>Portal</span>
                                                <ExternalLink className="size-3 opacity-60" />
                                            </a>

                                            {/* Toggle Inline Cockpit */}
                                            <button
                                                type="button"
                                                onClick={() => toggleExpandOrder(order)}
                                                className={`cursor-pointer h-8.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                                                    isExpanded
                                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25'
                                                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                                                }`}
                                            >
                                                <SlidersHorizontal size={13} />
                                                <span>{isExpanded ? 'Tutup Cockpit' : 'Kelola & Vault'}</span>
                                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} className="opacity-70" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* INLINE EXPANDED FLIGHT DECK (WHEN EXPANDED) */}
                                    {isExpanded && (
                                        <div className="p-6 sm:p-7 border-t border-violet-500/20 bg-slate-50/70 dark:bg-slate-950/60 space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
                                            {/* Segmented Tab Controller */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                                                <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('status')}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            activeTab === 'status'
                                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Status & Staging
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('milestones')}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            activeTab === 'milestones'
                                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        5 Milestones Checkpoints
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('handover')}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            activeTab === 'handover'
                                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <KeyRound size={13} className="text-amber-500" />
                                                        <span>Handover Vault</span>
                                                    </button>
                                                    {order.revision_notes && order.revision_notes.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveTab('revisions')}
                                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                                activeTab === 'revisions'
                                                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                                                                    : 'text-amber-600 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            <span>Catatan Revisi</span>
                                                            <span className="size-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-mono font-bold">
                                                                {order.revision_notes.length}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>

                                                <span className="text-xs text-slate-500">
                                                    Mode Pengembang • Proyek #{order.tracking_code}
                                                </span>
                                            </div>

                                            {/* Flight Deck Form */}
                                            <form onSubmit={(e) => handleUpdateOrder(e, order.id)} className="space-y-6">
                                                {/* TAB 1: STATUS & STAGING */}
                                                {activeTab === 'status' && (
                                                    <div className="space-y-5">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {/* Status Pengerjaan */}
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                    Status Pengerjaan Proyek
                                                                </Label>
                                                                <Select
                                                                    value={updateForm.data.status}
                                                                    onValueChange={(val: any) => updateForm.setData('status', val)}
                                                                >
                                                                    <SelectTrigger className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs">
                                                                        <SelectValue placeholder="Pilih status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                                                                        <SelectItem value="pending_payment">Menunggu Pembayaran Rekber</SelectItem>
                                                                        <SelectItem value="in_progress">Sedang Dikerjakan (In Progress)</SelectItem>
                                                                        <SelectItem value="in_review">Menunggu Review Staging Klien (In Review)</SelectItem>
                                                                        <SelectItem value="completed">Selesai & Disetujui (Completed)</SelectItem>
                                                                        <SelectItem value="cancelled">Dibatalkan (Cancelled)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            {/* Tahapan Pembayaran (Payment Stage) */}
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                    Tahapan Pembayaran (Escrow Stage)
                                                                </Label>
                                                                <Select
                                                                    value={updateForm.data.payment_stage || 'awaiting_dp'}
                                                                    onValueChange={(val: any) => updateForm.setData('payment_stage', val)}
                                                                >
                                                                    <SelectTrigger className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs">
                                                                        <SelectValue placeholder="Pilih stage" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                                                                        <SelectItem value="awaiting_dp">Termin 1: Menunggu DP</SelectItem>
                                                                        <SelectItem value="dp_paid">Termin 1: DP Terbayar (Sedang Dikerjakan)</SelectItem>
                                                                        <SelectItem value="awaiting_final">Termin 2: Menunggu Pelunasan Akhir</SelectItem>
                                                                        <SelectItem value="fully_paid">Lunas 100% (Semua Termin Selesai)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            {/* Skema Pembayaran */}
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                    Skema Pembayaran
                                                                </Label>
                                                                <Select
                                                                    value={updateForm.data.payment_scheme || 'down_payment'}
                                                                    onValueChange={(val: any) => updateForm.setData('payment_scheme', val)}
                                                                >
                                                                    <SelectTrigger className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs">
                                                                        <SelectValue placeholder="Pilih skema" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                                                                        <SelectItem value="down_payment">Termin Bertahap (DP + Pelunasan)</SelectItem>
                                                                        <SelectItem value="full_payment">Pembayaran Penuh Sekaligus (100%)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Pengaturan Kustom DP oleh Admin (Jika skema down_payment) */}
                                                        {updateForm.data.payment_scheme === 'down_payment' && (
                                                            <div className="p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-500/25 space-y-3">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <SlidersHorizontal size={14} className="text-violet-600 dark:text-violet-400" />
                                                                        <Label className="text-xs font-black text-slate-900 dark:text-white">
                                                                            Persentase DP Khusus Pesanan Ini (Ditentukan oleh Admin)
                                                                        </Label>
                                                                    </div>
                                                                    {order.dp_paid_at && (
                                                                        <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                                                            ✓ DP Telah Terbayar ({order.dp_percentage}%)
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                            Persentase DP (%):
                                                                        </Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <Input
                                                                                type="number"
                                                                                min={10}
                                                                                max={100}
                                                                                step={1}
                                                                                disabled={Boolean(order.dp_paid_at) || order.payment_stage === 'fully_paid'}
                                                                                value={updateForm.data.dp_percentage || ''}
                                                                                onChange={(e) => {
                                                                                    const val = Number(e.target.value);
                                                                                    const total = Number(order.total_amount);
                                                                                    const dpAmt = Math.round((total * val) / 100);
                                                                                    updateForm.setData('dp_percentage', val);
                                                                                    updateForm.setData('dp_amount', dpAmt);
                                                                                    updateForm.setData('remaining_amount', total - dpAmt);
                                                                                }}
                                                                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                                                                            />
                                                                            <span className="text-xs font-mono font-bold text-slate-500">%</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 space-y-0.5 text-xs">
                                                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                                                            Nominal DP (Termin 1)
                                                                        </span>
                                                                        <span className="font-mono font-black text-violet-700 dark:text-violet-300">
                                                                            {formatCurrency(updateForm.data.dp_amount || Math.round((Number(order.total_amount) * (Number(updateForm.data.dp_percentage) || 50)) / 100))}
                                                                        </span>
                                                                    </div>

                                                                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 space-y-0.5 text-xs">
                                                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                                                            Sisa Pelunasan (Termin 2)
                                                                        </span>
                                                                        <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                                                                            {formatCurrency(updateForm.data.remaining_amount || (Number(order.total_amount) - Math.round((Number(order.total_amount) * (Number(updateForm.data.dp_percentage) || 50)) / 100)))}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                    {order.dp_paid_at
                                                                        ? `Persentase DP telah terkunci karena pembayaran DP sudah diverifikasi oleh Rekening Bersama (Escrow) pada ${new Date(order.dp_paid_at).toLocaleString('id-ID')}.`
                                                                        : 'Sebagai Admin, Anda dapat menyesuaikan persentase DP pesanan ini (misal hasil negosiasi via WA). Nominal tagihan DP otomatis disinkronisasi.'}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Staging URL */}
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                                                <span>Staging URL (Demo Uji Coba Klien)</span>
                                                                {updateForm.data.staging_url && (
                                                                    <a
                                                                        href={updateForm.data.staging_url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-mono text-[10.5px]"
                                                                    >
                                                                        <span>Buka Demo</span>
                                                                        <ExternalLink size={10} />
                                                                    </a>
                                                                )}
                                                            </Label>
                                                            <Input
                                                                type="url"
                                                                value={updateForm.data.staging_url}
                                                                onChange={(e) => updateForm.setData('staging_url', e.target.value)}
                                                                placeholder="https://preview-klien.vercel.app"
                                                                className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus-visible:ring-violet-500/30"
                                                            />
                                                        </div>

                                                        {/* Escrow Ledger Details Card */}
                                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Receipt size={15} className="text-violet-500" />
                                                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                                                        Catatan Transaksi Rekening Bersama (Escrow)
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10.5px] text-slate-400 font-mono">
                                                                    ID Proyek #{order.id}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                                {/* Termin 1: DP */}
                                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                                                            Termin 1: Down Payment ({order.dp_percentage || 50}%)
                                                                        </span>
                                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                            ['dp_paid', 'awaiting_final', 'final_unpaid', 'fully_paid'].includes(order.payment_stage || '') || order.dp_paid_at
                                                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                                                        }`}>
                                                                            {['dp_paid', 'awaiting_final', 'final_unpaid', 'fully_paid'].includes(order.payment_stage || '') || order.dp_paid_at
                                                                                ? 'Lunas'
                                                                                : 'Belum Terbayar'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                                                                        <span>Nominal DP:</span>
                                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                                            {formatCurrency(order.dp_amount || Math.round(Number(order.total_amount) * 0.5))}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                                                                        <span>External ID:</span>
                                                                        <span className="truncate max-w-[180px]">
                                                                            {order.dp_transaction?.xendit_external_id || order.quest?.dp_deposit_transaction?.xendit_external_id || order.quest?.deposit_transaction?.xendit_external_id || '-'}
                                                                        </span>
                                                                    </div>
                                                                    {order.dp_paid_at && (
                                                                        <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                                                                            <span>Dibayar Pada:</span>
                                                                            <span>{new Date(order.dp_paid_at).toLocaleString('id-ID')}</span>
                                                                        </div>
                                                                    )}
                                                                    {order.dp_transaction?.payment_details?.invoice_url && (
                                                                        <div className="pt-1">
                                                                            <a
                                                                                href={order.dp_transaction.payment_details.invoice_url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-violet-600 dark:text-violet-400 text-[10.5px] font-bold hover:underline inline-flex items-center gap-1"
                                                                            >
                                                                                <span>Buka Tagihan DP (Invoice)</span>
                                                                                <ExternalLink size={10} />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Termin 2: Pelunasan Final */}
                                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                                                            Termin 2: Pelunasan Final
                                                                        </span>
                                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                            order.payment_stage === 'fully_paid' || order.final_paid_at
                                                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                                                : ['awaiting_final', 'final_unpaid'].includes(order.payment_stage || '')
                                                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                                        }`}>
                                                                            {order.payment_stage === 'fully_paid' || order.final_paid_at
                                                                                ? 'Lunas'
                                                                                : ['awaiting_final', 'final_unpaid'].includes(order.payment_stage || '')
                                                                                ? 'Siap Dibayar'
                                                                                : 'Menunggu Staging'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                                                                        <span>Nominal Pelunasan:</span>
                                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                                            {formatCurrency(order.remaining_amount || Math.round(Number(order.total_amount) * 0.5))}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                                                                        <span>External ID:</span>
                                                                        <span className="truncate max-w-[180px]">
                                                                            {order.final_transaction?.xendit_external_id || order.quest?.final_deposit_transaction?.xendit_external_id || '-'}
                                                                        </span>
                                                                    </div>
                                                                    {order.final_paid_at && (
                                                                        <div className="flex justify-between text-slate-500 text-[11px] font-mono">
                                                                            <span>Dibayar Pada:</span>
                                                                            <span>{new Date(order.final_paid_at).toLocaleString('id-ID')}</span>
                                                                        </div>
                                                                    )}
                                                                    {order.final_transaction?.payment_details?.invoice_url && (
                                                                        <div className="pt-1">
                                                                            <a
                                                                                href={order.final_transaction.payment_details.invoice_url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-violet-600 dark:text-violet-400 text-[10.5px] font-bold hover:underline inline-flex items-center gap-1"
                                                                            >
                                                                                <span>Buka Tagihan Pelunasan (Invoice)</span>
                                                                                <ExternalLink size={10} />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Catatan Internal Proyek */}
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                Catatan Internal Proyek
                                                            </Label>
                                                            <Textarea
                                                                rows={3}
                                                                value={updateForm.data.notes}
                                                                onChange={(e) => updateForm.setData('notes', e.target.value)}
                                                                placeholder="Catatan progres, kesepakatan fitur spesifik, atau deadline..."
                                                                className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30 leading-relaxed"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* TAB 2: 5 MILESTONES CHECKPOINTS */}
                                                {activeTab === 'milestones' && (
                                                    <div className="space-y-4">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Perbarui status setiap checkpoint. Klien akan langsung melihat kemajuan ini secara transparan di portal pelacak:
                                                        </p>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                                            {updateForm.data.milestone_progress.map((m, idx) => (
                                                                <div
                                                                    key={m.id || idx}
                                                                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-xs ${
                                                                        m.status === 'completed'
                                                                            ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                                                                            : m.status === 'in_progress'
                                                                            ? 'border-violet-500/40 bg-violet-500/5 dark:bg-violet-950/20'
                                                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                                                                    }`}
                                                                >
                                                                    <div className="space-y-1">
                                                                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                                                                            <span className="flex items-center gap-1.5">
                                                                                <span className="size-5 rounded-lg bg-violet-600/10 text-violet-700 dark:text-violet-400 font-mono text-[10px] flex items-center justify-center">
                                                                                    {idx + 1}
                                                                                </span>
                                                                                <span>{m.title}</span>
                                                                            </span>
                                                                            <span className={`text-[9.5px] uppercase font-black px-2 py-0.5 rounded-full ${
                                                                                m.status === 'completed'
                                                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                                                                    : m.status === 'in_progress'
                                                                                    ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                                            }`}>
                                                                                {m.status === 'completed' ? 'Selesai' : m.status === 'in_progress' ? 'Aktif' : 'Antrean'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                                            {m.description}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleMilestoneStatusChange(m.id, 'pending')}
                                                                            className={`flex-1 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all ${
                                                                                m.status === 'pending'
                                                                                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-extrabold'
                                                                                    : 'text-slate-400 hover:text-slate-700'
                                                                            }`}
                                                                        >
                                                                            Antrean
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleMilestoneStatusChange(m.id, 'in_progress')}
                                                                            className={`flex-1 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all ${
                                                                                m.status === 'in_progress'
                                                                                    ? 'bg-violet-600 text-white font-extrabold shadow-xs'
                                                                                    : 'text-slate-400 hover:text-violet-600'
                                                                            }`}
                                                                        >
                                                                            Aktif
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleMilestoneStatusChange(m.id, 'completed')}
                                                                            className={`flex-1 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all ${
                                                                                m.status === 'completed'
                                                                                    ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                                                                                    : 'text-slate-400 hover:text-emerald-600'
                                                                            }`}
                                                                        >
                                                                            ✓ Selesai
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* TAB 3: HANDOVER VAULT */}
                                                {activeTab === 'handover' && (
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-xs flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="size-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                                                    <KeyRound size={16} />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="font-extrabold text-amber-900 dark:text-amber-200">
                                                                        Brankas Serah Terima Aset Digital (Handover Vault)
                                                                    </div>
                                                                    <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                                                                        Kredensial dan repositori di bawah akan otomatis terenkripsi dan <strong>hanya terbuka di portal klien</strong> saat status pesanan berubah menjadi <strong>Completed (Disetujui)</strong>.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="shrink-0 font-mono text-[10.5px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                                                {order.status === 'completed' ? '🔓 Status: Terbuka' : '🔒 Status: Terkunci'}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                                            {/* Source Code Repository */}
                                                            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                    Source Code Repository (GitHub/GitLab)
                                                                </Label>
                                                                <Input
                                                                    type="url"
                                                                    value={updateForm.data.handover_data.repository_url || ''}
                                                                    onChange={(e) =>
                                                                        updateForm.setData('handover_data', {
                                                                            ...updateForm.data.handover_data,
                                                                            repository_url: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="https://github.com/ridhwananang/..."
                                                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-mono"
                                                                />
                                                            </div>

                                                            {/* Live Domain */}
                                                            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                    Domain Live Produksi
                                                                </Label>
                                                                <Input
                                                                    type="url"
                                                                    value={updateForm.data.handover_data.live_domain_url || ''}
                                                                    onChange={(e) =>
                                                                        updateForm.setData('handover_data', {
                                                                            ...updateForm.data.handover_data,
                                                                            live_domain_url: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="https://klien-domain.com"
                                                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-mono"
                                                                />
                                                            </div>

                                                            {/* CMS Admin URL */}
                                                            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                    URL Admin Panel (CMS)
                                                                </Label>
                                                                <Input
                                                                    value={updateForm.data.handover_data.cms_admin_url || ''}
                                                                    onChange={(e) =>
                                                                        updateForm.setData('handover_data', {
                                                                            ...updateForm.data.handover_data,
                                                                            cms_admin_url: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="https://klien-domain.com/admin"
                                                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-mono"
                                                                />
                                                            </div>

                                                            {/* Username CMS */}
                                                            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                    Username Login CMS
                                                                </Label>
                                                                <Input
                                                                    value={updateForm.data.handover_data.cms_admin_username || ''}
                                                                    onChange={(e) =>
                                                                        updateForm.setData('handover_data', {
                                                                            ...updateForm.data.handover_data,
                                                                            cms_admin_username: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="admin@klien.com"
                                                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-mono"
                                                                />
                                                            </div>

                                                            {/* Password CMS */}
                                                            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                        Password Akses CMS
                                                                    </Label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowVaultPassword(!showVaultPassword)}
                                                                        className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                                                    >
                                                                        {showVaultPassword ? 'Sembunyikan' : 'Perlihatkan'}
                                                                    </button>
                                                                </div>
                                                                <Input
                                                                    type={showVaultPassword ? 'text' : 'password'}
                                                                    value={updateForm.data.handover_data.cms_admin_password || ''}
                                                                    onChange={(e) =>
                                                                        updateForm.setData('handover_data', {
                                                                            ...updateForm.data.handover_data,
                                                                            cms_admin_password: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="SandiAdmin#2026"
                                                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-mono"
                                                                />
                                                            </div>

                                                            {/* Documentation URL */}
                                                            <div className="space-y-1.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                                <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                                    Dokumentasi / Panduan URL
                                                                </Label>
                                                                <Input
                                                                    type="url"
                                                                    value={updateForm.data.handover_data.documentation_url || ''}
                                                                    onChange={(e) =>
                                                                        updateForm.setData('handover_data', {
                                                                            ...updateForm.data.handover_data,
                                                                            documentation_url: e.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="https://notion.so/Panduan-..."
                                                                    className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 text-xs font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* TAB 4: REVISIONS */}
                                                {activeTab === 'revisions' && order.revision_notes && (
                                                    <div className="space-y-3">
                                                        <p className="text-xs text-slate-500">
                                                            Daftar catatan revisi yang dikirim klien melalui halaman pelacak proyek:
                                                        </p>
                                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                                            {order.revision_notes.map((rev, idx) => (
                                                                <div
                                                                    key={rev.id || idx}
                                                                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1"
                                                                >
                                                                    <div className="flex justify-between text-[10px] text-slate-400">
                                                                        <span className="font-bold text-amber-600 dark:text-amber-400">
                                                                            Catatan Revisi #{idx + 1}
                                                                        </span>
                                                                        <span className="font-mono">
                                                                            {new Date(rev.created_at).toLocaleString('id-ID')}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                                                                        {rev.text}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Footer */}
                                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedOrderId(null)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                                    >
                                                        Tutup Panel
                                                    </button>

                                                    <Button
                                                        type="submit"
                                                        disabled={updateForm.processing}
                                                        className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
                                                    >
                                                        {updateForm.processing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
