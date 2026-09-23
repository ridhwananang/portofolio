import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Clock, PlayCircle, Eye, CheckCircle2 } from 'lucide-react';

interface OrderPipelineBarProps {
    counts: {
        pending_payment: number;
        in_progress: number;
        in_review: number;
        completed: number;
    };
    totalOrders: number;
}

export function OrderPipelineBar({ counts, totalOrders }: OrderPipelineBarProps) {
    const stages = [
        {
            key: 'pending_payment',
            step: '01',
            label: 'Menunggu Pembayaran',
            description: 'Invoice kalkulator terbit',
            count: counts.pending_payment,
            href: '/admin/orders?status=pending_payment',
            icon: Clock,
            colorText: 'text-amber-600 dark:text-amber-400',
            bgBadge: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/60',
            dotColor: 'bg-amber-500',
        },
        {
            key: 'in_progress',
            step: '02',
            label: 'Dalam Pengerjaan',
            description: 'Fase coding & perakitan',
            count: counts.in_progress,
            href: '/admin/orders?status=in_progress',
            icon: PlayCircle,
            colorText: 'text-blue-600 dark:text-blue-400',
            bgBadge: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/60',
            dotColor: 'bg-blue-500',
        },
        {
            key: 'in_review',
            step: '03',
            label: 'Review Klien',
            description: 'Demo staging preview',
            count: counts.in_review,
            href: '/admin/orders?status=in_review',
            icon: Eye,
            colorText: 'text-purple-600 dark:text-purple-400',
            bgBadge: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/60',
            dotColor: 'bg-purple-500',
        },
        {
            key: 'completed',
            step: '04',
            label: 'Selesai & Rilis',
            description: 'Dana escrow dicairkan',
            count: counts.completed,
            href: '/admin/orders?status=completed',
            icon: CheckCircle2,
            colorText: 'text-emerald-600 dark:text-emerald-400',
            bgBadge: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/60',
            dotColor: 'bg-emerald-500',
        },
    ];

    return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 sm:p-7 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Alur & Siklus Pengerjaan Pesanan
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pantau distribusi status pengerjaan proyek dari kalkulator layanan secara real-time
                    </p>
                </div>
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 self-start sm:self-auto group"
                >
                    <span>Semua Pesanan ({totalOrders})</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {/* Pipeline Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stages.map((stage) => {
                    const Icon = stage.icon;
                    return (
                        <Link
                            key={stage.key}
                            href={stage.href}
                            className="group relative rounded-xl border border-slate-200/70 bg-white/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-white hover:shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30 dark:hover:bg-slate-850 flex flex-col justify-between space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${stage.dotColor}`} />
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Tahap {stage.step}
                                    </span>
                                </div>
                                <Icon size={15} className={stage.colorText} />
                            </div>

                            <div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                                        {stage.count}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        Order
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                                    {stage.label}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {stage.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
