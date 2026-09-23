import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Copy, Check, ArrowUpRight, ShieldCheck, Clock, PlayCircle, Eye, CheckCircle2, ExternalLink } from 'lucide-react';
import { ProjectOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderWorkstationProps {
    orders: ProjectOrder[];
    totalOrders: number;
}

export function OrderWorkstation({ orders, totalOrders }: OrderWorkstationProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedTracking(code);
        toast.success(`Tracking code #${code} disalin ke clipboard`);
        setTimeout(() => setCopiedTracking(null), 2000);
    };

    // Filter orders based on active filter
    const filteredOrders = activeFilter === 'all'
        ? orders
        : orders.filter((o) => o.status === activeFilter);

    // Counts for filter pills
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Selesai (Cair)',
                    icon: CheckCircle2,
                    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
                };
            case 'in_progress':
                return {
                    label: 'Sedang Dikerjakan',
                    icon: PlayCircle,
                    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
                };
            case 'in_review':
                return {
                    label: 'Menunggu Review',
                    icon: Eye,
                    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60',
                };
            default:
                return {
                    label: 'Menunggu Pembayaran',
                    icon: Clock,
                    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
                };
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 sm:p-6 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 space-y-5">
            {/* Workstation Header & Filter Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            Pusat Pengerjaan Pesanan & Escrow
                        </h2>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {totalOrders} Total
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelola alur pengerjaan software dan pencairan dana jaminan Rekening Bersama (Escrow)
                    </p>
                </div>

                {/* Interactive Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {filterTabs.map((tab) => {
                        const isActive = activeFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveFilter(tab.key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                            >
                                {tab.dot && <span className={`size-1.5 rounded-full ${tab.dot}`} />}
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                    isActive
                                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-900 font-bold'
                                        : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders Grid / Cards */}
            {filteredOrders.length === 0 ? (
                <div className="py-14 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="font-medium text-slate-500 dark:text-slate-400">
                        Tidak ada pesanan pada kategori ini.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        const initials = (order.client_name || 'CL').slice(0, 2).toUpperCase();

                        return (
                            <div
                                key={order.id}
                                className="group rounded-xl border border-slate-200/70 bg-white/70 p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-xs dark:border-slate-800/70 dark:bg-slate-950/40 dark:hover:border-slate-700 flex flex-col justify-between space-y-3.5"
                            >
                                {/* Top Row: Client Avatar + Name + Tracking Chip */}
                                <div className="flex items-start justify-between gap-2.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-9 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                                            {initials}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {order.client_name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate">
                                                {order.client_email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 1-Click Copyable Tracking Chip */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(order.tracking_code)}
                                        className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                                        title="Salin Tracking Code"
                                    >
                                        {copiedTracking === order.tracking_code ? (
                                            <Check size={11} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={11} className="opacity-50" />
                                        )}
                                        <span>#{order.tracking_code}</span>
                                    </button>
                                </div>

                                {/* Middle Row: Project Type & Delivery Speed */}
                                <div className="rounded-lg bg-slate-50/80 dark:bg-slate-900/60 px-3 py-2 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize truncate">
                                        {order.project_type}
                                    </span>
                                    <span className="text-[11px] text-slate-400 capitalize shrink-0">
                                        Speed: {order.delivery_speed}
                                    </span>
                                </div>

                                {/* Bottom Row: Value, Status Badge, Action */}
                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                    <div>
                                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block tabular-nums">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: order.currency || 'IDR',
                                                maximumFractionDigits: 0,
                                            }).format(Number(order.total_amount))}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-md border mt-0.5 ${statusConfig.badgeClass}`}
                                        >
                                            <StatusIcon size={10} />
                                            <span>{statusConfig.label}</span>
                                        </span>
                                    </div>

                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 font-semibold"
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
