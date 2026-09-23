import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Copy, Check, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { ProjectOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RecentOrdersCardProps {
    orders: ProjectOrder[];
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
    const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedTracking(code);
        toast.success(`Tracking code #${code} disalin ke clipboard`);
        setTimeout(() => setCopiedTracking(null), 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Selesai',
                    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
                };
            case 'in_progress':
                return {
                    label: 'Pengerjaan',
                    className: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
                };
            case 'in_review':
                return {
                    label: 'Review',
                    className: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60',
                };
            default:
                return {
                    label: 'Menunggu Bayar',
                    className: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
                };
        }
    };

    return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 sm:p-7 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/60 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60">
                        <ShoppingBag size={18} />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            Transaksi & Pesanan Aktif
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pesanan kalkulator layanan dengan proteksi Rekening Bersama (Escrow)
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 group"
                >
                    <span>Lihat Semua</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-slate-400 opacity-60" />
                    <p className="font-medium">Belum ada transaksi pesanan yang masuk.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        const initials = (order.client_name || 'CL').slice(0, 2).toUpperCase();

                        return (
                            <div
                                key={order.id}
                                className="group rounded-2xl border border-slate-200/70 bg-white/60 p-4 transition-all duration-200 hover:border-violet-500/30 hover:bg-white hover:shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30 dark:hover:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    {/* Client Initial Avatar */}
                                    <div className="size-10 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700">
                                        {initials}
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {order.client_name}
                                            </span>

                                            {/* Tracking Code Chip */}
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(order.tracking_code)}
                                                className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                                                title="Salin Tracking Code"
                                            >
                                                {copiedTracking === order.tracking_code ? (
                                                    <Check size={11} className="text-emerald-500" />
                                                ) : (
                                                    <Copy size={11} className="opacity-60" />
                                                )}
                                                <span>#{order.tracking_code}</span>
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                                            {order.project_type} · Speed: {order.delivery_speed}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                    <div className="text-left sm:text-right">
                                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block tabular-nums">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: order.currency || 'IDR',
                                                maximumFractionDigits: 0,
                                            }).format(Number(order.total_amount))}
                                        </span>
                                        <span
                                            className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-md border mt-0.5 ${statusBadge.className}`}
                                        >
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 font-semibold"
                                    >
                                        <Link href="/admin/orders">Kelola</Link>
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
