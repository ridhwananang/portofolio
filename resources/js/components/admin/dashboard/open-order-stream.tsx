import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Copy, Check, ArrowUpRight, ShieldCheck, Clock, PlayCircle, Eye, CheckCircle2, Sparkles } from 'lucide-react';
import { ProjectOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OpenOrderStreamProps {
    orders: ProjectOrder[];
    totalOrders: number;
}

export function OpenOrderStream({ orders, totalOrders }: OpenOrderStreamProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedTracking(code);
        toast.success(`Tracking code #${code} disalin ke clipboard`);
        setTimeout(() => setCopiedTracking(null), 2000);
    };

    const filteredOrders = activeFilter === 'all'
        ? orders
        : orders.filter((o) => o.status === activeFilter);

    const counts = {
        all: orders.length,
        pending_payment: orders.filter((o) => o.status === 'pending_payment').length,
        in_progress: orders.filter((o) => o.status === 'in_progress').length,
        in_review: orders.filter((o) => o.status === 'in_review').length,
        completed: orders.filter((o) => o.status === 'completed').length,
    };

    const filterTabs = [
        { key: 'all', label: 'Semua', count: counts.all },
        { key: 'pending_payment', label: 'Menunggu Bayar', count: counts.pending_payment, dot: 'bg-amber-500' },
        { key: 'in_progress', label: 'Pengerjaan', count: counts.in_progress, dot: 'bg-blue-500' },
        { key: 'in_review', label: 'Review', count: counts.in_review, dot: 'bg-purple-500' },
        { key: 'completed', label: 'Selesai', count: counts.completed, dot: 'bg-emerald-500' },
    ];

    const getStageIndex = (status: string) => {
        switch (status) {
            case 'pending_payment': return 1;
            case 'in_progress': return 2;
            case 'in_review': return 3;
            case 'completed': return 4;
            default: return 1;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Selesai · Dana Cair',
                    icon: CheckCircle2,
                    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
                };
            case 'in_progress':
                return {
                    label: 'Dalam Pengerjaan',
                    icon: PlayCircle,
                    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs shadow-blue-500/10',
                };
            case 'in_review':
                return {
                    label: 'Review Demo Klien',
                    icon: Eye,
                    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-xs shadow-purple-500/10',
                };
            default:
                return {
                    label: 'Menunggu Pembayaran',
                    icon: Clock,
                    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs shadow-amber-500/10',
                };
        }
    };

    return (
        <div className="space-y-5">
            {/* Header & Filter Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/60">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Alur Pesanan & Transaksi Escrow
                        </h2>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60">
                            {totalOrders} Order
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pantau status pengerjaan proyek dan verifikasi rekening bersama (escrow) secara real-time
                    </p>
                </div>

                {/* Floating Capsule Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {filterTabs.map((tab) => {
                        const isActive = activeFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveFilter(tab.key)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900'
                                        : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                            >
                                {tab.dot && <span className={`size-1.5 rounded-full ${tab.dot}`} />}
                                <span>{tab.label}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isActive
                                        ? 'bg-white/25 text-white dark:bg-black/25 dark:text-slate-900'
                                        : 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders Stream: Balanced 2-Column Mesh on Desktop to eliminate awkward gaps */}
            {filteredOrders.length === 0 ? (
                <div className="py-14 text-center rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-800 text-xs text-slate-400 space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="font-medium text-slate-500 dark:text-slate-400">
                        Tidak ada pesanan pada filter ini.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        const initials = (order.client_name || 'CL').slice(0, 2).toUpperCase();
                        const currentStage = getStageIndex(order.status);

                        return (
                            <div
                                key={order.id}
                                className="group relative rounded-2xl border border-slate-200/70 bg-white/60 dark:border-slate-700/50 dark:bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/80 dark:hover:bg-slate-850/60 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between space-y-4"
                            >
                                {/* Top Row: Client Info & Tracking Chip */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 sm:size-11 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs">
                                            {initials}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {order.client_name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {order.client_email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Laser-Etched Serial Chip */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(order.tracking_code)}
                                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-all cursor-pointer shrink-0"
                                        title="Salin Tracking Code"
                                    >
                                        {copiedTracking === order.tracking_code ? (
                                            <Check size={12} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={12} className="opacity-50" />
                                        )}
                                        <span>#{order.tracking_code}</span>
                                    </button>
                                </div>

                                {/* Milestone 4-Stage Progress Stepper */}
                                <div className="space-y-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/30 p-2.5 border border-slate-100 dark:border-slate-800/60">
                                    <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
                                        <span className="capitalize">{order.project_type} · Speed: {order.delivery_speed}</span>
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            Fase {currentStage} / 4
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 1 ? 'bg-amber-500' : 'bg-transparent'}`} title="Menunggu Bayar" />
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 2 ? 'bg-blue-500' : 'bg-transparent'}`} title="Pengerjaan" />
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 3 ? 'bg-purple-500' : 'bg-transparent'}`} title="Review Klien" />
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} title="Selesai" />
                                    </div>
                                </div>

                                {/* Bottom Row: Value, Status Pill, Action */}
                                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                    <div>
                                        <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white block tabular-nums">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: order.currency || 'IDR',
                                                maximumFractionDigits: 0,
                                            }).format(Number(order.total_amount))}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${statusConfig.badgeClass}`}
                                        >
                                            <StatusIcon size={11} />
                                            <span>{statusConfig.label}</span>
                                        </span>
                                    </div>

                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-3.5 text-xs rounded-full border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 font-semibold shadow-xs"
                                    >
                                        <Link href="/admin/orders">
                                            <span>Kelola</span>
                                            <ArrowUpRight size={12} className="ml-1 opacity-70" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
