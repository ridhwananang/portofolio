import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Copy, Check, ArrowUpRight, ShieldCheck, Clock, PlayCircle, Eye, CheckCircle2, Terminal } from 'lucide-react';
import { ProjectOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TacticalOrderBoardProps {
    orders: ProjectOrder[];
    totalOrders: number;
}

export function TacticalOrderBoard({ orders, totalOrders }: TacticalOrderBoardProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedTracking(code);
        toast.success(`Tracking chip #${code} disalin ke clipboard`);
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
        { key: 'all', label: 'ALL_ORDERS', count: counts.all },
        { key: 'pending_payment', label: 'PENDING', count: counts.pending_payment, dot: 'bg-amber-500' },
        { key: 'in_progress', label: 'DEV_ACTIVE', count: counts.in_progress, dot: 'bg-blue-500' },
        { key: 'in_review', label: 'STAGING_REV', count: counts.in_review, dot: 'bg-purple-500' },
        { key: 'completed', label: 'RELEASED', count: counts.completed, dot: 'bg-emerald-500' },
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
                    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
                };
            case 'in_progress':
                return {
                    label: 'Dalam Pengerjaan',
                    icon: PlayCircle,
                    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
                };
            case 'in_review':
                return {
                    label: 'Review Demo Klien',
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-2xl shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50 space-y-5">
            {/* Precision Crosshair Corner Ornaments */}
            <div className="pointer-events-none absolute top-2 left-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>
            <div className="pointer-events-none absolute top-2 right-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>
            <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>
            <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>

            {/* Board Header & Tactical Filter Chips */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            // 01
                        </span>
                        <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                            Tactical Escrow Workstation
                        </h2>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700">
                            {totalOrders} TOTAL
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Monitoring pesanan kalkulator software dengan proteksi Rekening Bersama (Escrow)
                    </p>
                </div>

                {/* Filter Tabs Styled Like Tactical Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {filterTabs.map((tab) => {
                        const isActive = activeFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveFilter(tab.key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                            >
                                {tab.dot && <span className={`size-1.5 rounded-full ${tab.dot}`} />}
                                <span>{tab.label}</span>
                                <span className={`text-[10.5px] px-1.5 py-0.2 rounded ${
                                    isActive
                                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-900'
                                        : 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
                <div className="py-14 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
                    <Terminal size={26} className="mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="font-mono text-slate-500 dark:text-slate-400">
                        [ NO_ORDERS_FOUND_IN_THIS_VIEW ]
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        const initials = (order.client_name || 'CL').slice(0, 2).toUpperCase();
                        const currentStage = getStageIndex(order.status);

                        return (
                            <div
                                key={order.id}
                                className="group relative rounded-xl border border-slate-200/80 bg-white/80 p-4 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-md hover:shadow-indigo-500/5 dark:border-slate-700/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 flex flex-col justify-between space-y-3.5"
                            >
                                {/* Top: Client & Laser-Etched Serial Chip */}
                                <div className="flex items-start justify-between gap-2.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-10 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                                            {initials}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {order.client_name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate font-mono">
                                                {order.client_email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Laser-Etched Serial Chip */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(order.tracking_code)}
                                        className="inline-flex items-center gap-1 font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                                        title="Salin Serial Chip"
                                    >
                                        {copiedTracking === order.tracking_code ? (
                                            <Check size={11} className="text-emerald-500" />
                                        ) : (
                                            <Copy size={11} className="opacity-50" />
                                        )}
                                        <span>#{order.tracking_code}</span>
                                    </button>
                                </div>

                                {/* Milestone Timeline Progress Meter */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                        <span>TIMELINE MILESTONE</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            FASE {currentStage} / 4
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 1 ? 'bg-amber-500' : 'bg-transparent'}`} />
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 2 ? 'bg-blue-500' : 'bg-transparent'}`} />
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 3 ? 'bg-purple-500' : 'bg-transparent'}`} />
                                        <div className={`h-full rounded-full transition-all ${currentStage >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                                    </div>
                                </div>

                                {/* Spec Tag & Delivery Speed */}
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 px-3 py-2 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize truncate">
                                        {order.project_type}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400 capitalize shrink-0">
                                        {order.delivery_speed}
                                    </span>
                                </div>

                                {/* Bottom Row: Value, Status Badge & Action */}
                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                                    <div>
                                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white block tabular-nums">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: order.currency || 'IDR',
                                                maximumFractionDigits: 0,
                                            }).format(Number(order.total_amount))}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-md border mt-0.5 ${statusConfig.badgeClass}`}
                                        >
                                            <StatusIcon size={10} />
                                            <span>{statusConfig.label}</span>
                                        </span>
                                    </div>

                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 font-semibold cursor-pointer"
                                    >
                                        <Link href="/admin/orders">
                                            <span>Inspect</span>
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
