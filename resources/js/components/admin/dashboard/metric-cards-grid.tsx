import React from 'react';
import { Link } from '@inertiajs/react';
import { Coins, Briefcase, Award, Mail, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface MetricCardsGridProps {
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

export function MetricCardsGrid({ metrics, totalOrderValue }: MetricCardsGridProps) {
    const formattedOrderValue = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(totalOrderValue);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Total Kontrak Escrow */}
            <Link
                href="/admin/orders"
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-emerald-500/30 flex flex-col justify-between space-y-4"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Kontrak Escrow
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 group-hover:scale-105 transition-transform">
                        <Coins size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {formattedOrderValue}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck size={13} />
                            Escrow Terverifikasi
                        </span>
                        <span className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                            Lihat <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card 2: Karya & Proyek */}
            <Link
                href="/admin/projects"
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-blue-500/30 flex flex-col justify-between space-y-4"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Karya Portofolio
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60 group-hover:scale-105 transition-transform">
                        <Briefcase size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {metrics.totalProjects}{' '}
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Proyek
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="font-medium">
                            Showcase publik live
                        </span>
                        <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-0.5">
                            Kelola <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card 3: Sertifikasi Resmi */}
            <Link
                href="/admin/certificates"
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-amber-500/30 flex flex-col justify-between space-y-4"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Kredensial & Lisensi
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60 group-hover:scale-105 transition-transform">
                        <Award size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {metrics.totalCertificates}{' '}
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Sertifikat
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="font-medium">
                            Dicoding & Resmi
                        </span>
                        <span className="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-0.5">
                            Buka Vault <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card 4: Pesan & Pertanyaan */}
            <Link
                href="/admin/messages"
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-md hover:shadow-rose-500/5 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-rose-500/30 flex flex-col justify-between space-y-4"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Pesan Calon Klien
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 group-hover:scale-105 transition-transform">
                        <Mail size={18} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {metrics.unreadMessages}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            belum dibaca ({metrics.totalMessages} total)
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="font-medium text-rose-600 dark:text-rose-400">
                            Respon Cepat
                        </span>
                        <span className="font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-0.5">
                            Buka Inbox <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
