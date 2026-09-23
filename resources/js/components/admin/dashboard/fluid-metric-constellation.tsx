import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Award, ShoppingBag, ShieldCheck, Briefcase, Mail, Radio, ArrowUpRight } from 'lucide-react';

interface FluidMetricConstellationProps {
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

export function FluidMetricConstellation({ metrics, totalOrderValue }: FluidMetricConstellationProps) {
    const todayDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    const formattedOrderValue = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(totalOrderValue);

    return (
        <div className="space-y-6 pt-2">
            {/* Top Row: Floating Status Capsule & Quick Actions (No box!) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Floating Pulse Capsule */}
                    <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md shadow-xs">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        <span>STUDIO.LIVE // ESCROW.ARMED</span>
                    </div>

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {todayDate}
                    </span>
                </div>

                {/* Floating Capsule Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/admin/projects/create"
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 text-xs font-bold shadow-md shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={14} />
                        <span>Proyek Baru</span>
                    </Link>

                    <Link
                        href="/admin/certificates/create"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 hover:bg-white text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                    >
                        <Award size={13} className="text-amber-500" />
                        <span>+ Lisensi</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 hover:bg-white text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                    >
                        <ShoppingBag size={13} className="text-indigo-500" />
                        <span>Pesanan</span>
                    </Link>
                </div>
            </div>

            {/* Floating Metric Constellation: 4 Numbers Breathing Freely on Canvas (NO BOXES!) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2 pb-4">
                {/* Metric 1: Escrow Vault */}
                <Link
                    href="/admin/orders"
                    className="group relative block space-y-1 transition-transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>ESCROW POOL</span>
                    </div>

                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                        {formattedOrderValue}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Escrow Terverifikasi</span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>

                    {/* Subtle ambient light underline */}
                    <div className="h-0.5 w-16 bg-gradient-to-r from-emerald-500 to-transparent rounded-full opacity-60 group-hover:w-full transition-all duration-500" />
                </Link>

                {/* Metric 2: Live Projects */}
                <Link
                    href="/admin/projects"
                    className="group relative block space-y-1 transition-transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                        <Briefcase size={14} className="text-blue-500" />
                        <span>KARYA LIVE</span>
                    </div>

                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                        {metrics.totalProjects}{' '}
                        <span className="text-base font-semibold text-slate-400">Karya</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>Showcase Publik</span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                    </p>

                    {/* Subtle ambient light underline */}
                    <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full opacity-60 group-hover:w-full transition-all duration-500" />
                </Link>

                {/* Metric 3: Verified Credentials */}
                <Link
                    href="/admin/certificates"
                    className="group relative block space-y-1 transition-transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                        <Award size={14} className="text-amber-500" />
                        <span>LISENSI RESMI</span>
                    </div>

                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                        {metrics.totalCertificates}{' '}
                        <span className="text-base font-semibold text-slate-400">Sertifikat</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Dicoding Verified</span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                    </p>

                    {/* Subtle ambient light underline */}
                    <div className="h-0.5 w-16 bg-gradient-to-r from-amber-500 to-transparent rounded-full opacity-60 group-hover:w-full transition-all duration-500" />
                </Link>

                {/* Metric 4: Inbound Messages */}
                <Link
                    href="/admin/messages"
                    className="group relative block space-y-1 transition-transform hover:-translate-y-1"
                >
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                        <Mail size={14} className={metrics.unreadMessages > 0 ? 'text-rose-500' : 'text-slate-400'} />
                        <span>INBOX KLIEN</span>
                    </div>

                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums flex items-baseline gap-2">
                        <span>{metrics.unreadMessages}</span>
                        <span className="text-sm font-semibold text-slate-400">
                            / {metrics.totalMessages} total
                        </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className={metrics.unreadMessages > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                            {metrics.unreadMessages > 0 ? 'Perlu Dibalas' : 'Semua Terbaca'}
                        </span>
                        <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
                    </p>

                    {/* Subtle ambient light underline */}
                    <div className="h-0.5 w-16 bg-gradient-to-r from-rose-500 to-transparent rounded-full opacity-60 group-hover:w-full transition-all duration-500" />
                </Link>
            </div>
        </div>
    );
}
