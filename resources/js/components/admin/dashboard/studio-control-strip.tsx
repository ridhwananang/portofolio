import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Award, ShoppingBag, ShieldCheck, Briefcase, Mail, Coins } from 'lucide-react';

interface StudioControlStripProps {
    metrics: {
        totalProjects: number;
        totalCertificates: number;
        totalTechStacks: number;
        totalMessages: number;
        unreadMessages: number;
        totalOrders: number;
    };
    totalOrderValue: number;
}

export function StudioControlStrip({ metrics, totalOrderValue }: StudioControlStripProps) {
    const todayDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date());

    const formattedOrderValue = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(totalOrderValue);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 sm:p-4 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                {/* Left: Studio Status & Date */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                        <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
                        <span>Studio Active</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                        {todayDate}
                    </span>
                </div>

                {/* Center: Horizontal KPI Ribbon */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:flex-nowrap overflow-x-auto py-1">
                    {/* KPI 1: Escrow Value */}
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300 hover:border-emerald-400 transition-colors text-xs shrink-0"
                    >
                        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold tabular-nums">{formattedOrderValue}</span>
                        <span className="text-[10.5px] opacity-75 hidden sm:inline">Escrow</span>
                    </Link>

                    {/* KPI 2: Live Projects */}
                    <Link
                        href="/admin/projects"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 hover:border-blue-400 transition-colors text-xs shrink-0"
                    >
                        <Briefcase size={14} className="text-blue-500" />
                        <span className="font-bold tabular-nums">{metrics.totalProjects}</span>
                        <span className="text-[10.5px] text-slate-400 hidden sm:inline">Karya</span>
                    </Link>

                    {/* KPI 3: Verified Certificates */}
                    <Link
                        href="/admin/certificates"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 hover:border-amber-400 transition-colors text-xs shrink-0"
                    >
                        <Award size={14} className="text-amber-500" />
                        <span className="font-bold tabular-nums">{metrics.totalCertificates}</span>
                        <span className="text-[10.5px] text-slate-400 hidden sm:inline">Lisensi</span>
                    </Link>

                    {/* KPI 4: Unread / Total Messages */}
                    <Link
                        href="/admin/messages"
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shrink-0 transition-colors ${
                            metrics.unreadMessages > 0
                                ? 'border-rose-200/80 bg-rose-50/70 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 hover:border-rose-400'
                                : 'border-slate-200/80 bg-white/70 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 hover:border-violet-400'
                        }`}
                    >
                        <Mail size={14} className={metrics.unreadMessages > 0 ? 'text-rose-500' : 'text-slate-400'} />
                        <span className="font-bold tabular-nums">{metrics.unreadMessages}</span>
                        <span className="text-[10.5px] opacity-75 hidden sm:inline">
                            {metrics.unreadMessages > 0 ? 'Pesan Baru' : 'Pesan'}
                        </span>
                    </Link>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <Link
                        href="/admin/projects/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={14} />
                        <span>Proyek</span>
                    </Link>

                    <Link
                        href="/admin/certificates/create"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
                    >
                        <Plus size={13} className="text-amber-500" />
                        <span>Lisensi</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
                    >
                        <ShoppingBag size={13} className="text-indigo-500" />
                        <span>Pesanan</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
