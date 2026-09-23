import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Award, ShoppingBag, ShieldCheck, Briefcase, Mail, Radio } from 'lucide-react';

interface ArchitecturalHeaderProps {
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

export function ArchitecturalHeader({ metrics, totalOrderValue }: ArchitecturalHeaderProps) {
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 backdrop-blur-2xl shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50 transition-all">
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

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                {/* Left: Radial Pulse Orb + Studio Coordinates */}
                <div className="flex items-center gap-3.5">
                    {/* Concentric Radial Pulse Orb */}
                    <div className="relative flex size-10 items-center justify-center shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400/25 dark:bg-indigo-500/20" />
                        <span className="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
                            <Radio size={14} className="animate-pulse" />
                        </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono">
                                Studio Command Deck
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                SYS.ONLINE
                            </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                            {todayDate} // ESCROW-ARMED // SSL-SECURE
                        </p>
                    </div>
                </div>

                {/* Center: Architectural KPI Ribbon with Technical Badges */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap overflow-x-auto py-0.5">
                    {/* KPI 1: Escrow Vault */}
                    <Link
                        href="/admin/orders"
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 hover:border-emerald-400 transition-all text-xs shrink-0"
                    >
                        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="font-mono font-bold tabular-nums">{formattedOrderValue}</span>
                        <span className="text-[10px] font-mono opacity-70 hidden sm:inline">ESCROW</span>
                    </Link>

                    {/* KPI 2: Live Works */}
                    <Link
                        href="/admin/projects"
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300 hover:border-blue-400 transition-all text-xs shrink-0"
                    >
                        <Briefcase size={14} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <span className="font-mono font-bold tabular-nums">{metrics.totalProjects}</span>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">KARYA</span>
                    </Link>

                    {/* KPI 3: Credentials */}
                    <Link
                        href="/admin/certificates"
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300 hover:border-amber-400 transition-all text-xs shrink-0"
                    >
                        <Award size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="font-mono font-bold tabular-nums">{metrics.totalCertificates}</span>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">LISENSI</span>
                    </Link>

                    {/* KPI 4: Inbound Messages */}
                    <Link
                        href="/admin/messages"
                        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shrink-0 transition-all ${
                            metrics.unreadMessages > 0
                                ? 'border-rose-300/80 bg-rose-50/80 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 hover:border-rose-400'
                                : 'border-slate-200/80 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300 hover:border-violet-400'
                        }`}
                    >
                        <Mail size={14} className={metrics.unreadMessages > 0 ? 'text-rose-500 group-hover:scale-110 transition-transform' : 'text-slate-400'} />
                        <span className="font-mono font-bold tabular-nums">{metrics.unreadMessages}</span>
                        <span className="text-[10px] font-mono opacity-70 hidden sm:inline">
                            {metrics.unreadMessages > 0 ? 'UNREAD' : 'INBOX'}
                        </span>
                    </Link>
                </div>

                {/* Right: Tactical Action Controls */}
                <div className="flex items-center gap-2 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800">
                    <Link
                        href="/admin/projects/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={14} />
                        <span>+ Proyek</span>
                    </Link>

                    <Link
                        href="/admin/certificates/create"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
                    >
                        <Award size={13} className="text-amber-500" />
                        <span>+ Lisensi</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
                    >
                        <ShoppingBag size={13} className="text-indigo-500" />
                        <span>Pesanan</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
