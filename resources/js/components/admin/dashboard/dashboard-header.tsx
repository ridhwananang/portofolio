import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus, ShoppingBag, Award, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
    totalOrders: number;
}

export function DashboardHeader({ totalOrders }: DashboardHeaderProps) {
    const todayDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 transition-all">
            {/* Soft subtle studio glow in background */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent blur-3xl dark:from-indigo-500/15" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl dark:from-emerald-500/10" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Greeting & Status */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>Studio Operasional Aktif</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                            {todayDate}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Selamat Datang di{' '}
                        <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400">
                            Studio Workspace
                        </span>
                    </h1>

                    <p className="max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Pantau progres proyek digital, status pembayaran rekening bersama (escrow), sertifikasi resmi, dan pesan masuk klien dengan nyaman dan terstruktur.
                    </p>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <Link
                        href="/admin/projects/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={15} />
                        <span>Tambah Proyek</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-850 dark:hover:border-slate-700"
                    >
                        <ShoppingBag size={14} className="text-indigo-500" />
                        <span>Pesanan ({totalOrders})</span>
                    </Link>

                    <Link
                        href="/admin/certificates/create"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-850 dark:hover:border-slate-700"
                    >
                        <Award size={14} className="text-amber-500" />
                        <span>+ Lisensi</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
