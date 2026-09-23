import React from 'react';
import { Link } from '@inertiajs/react';
import { Mail, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Message } from '@/types';

interface RecentMessagesCardProps {
    messages: Message[];
    unreadCount: number;
}

export function RecentMessagesCard({ messages, unreadCount }: RecentMessagesCardProps) {
    return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 sm:p-7 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/60 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60">
                        <Mail size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                Pesan Masuk Klien
                            </h2>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                                    {unreadCount} Baru
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pertanyaan dan komunikasi dari formulir kontak publik
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/messages"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 group"
                >
                    <span>Buka Inbox</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {messages.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
                    <Mail size={28} className="mx-auto text-slate-400 opacity-60" />
                    <p className="font-medium">Belum ada pesan masuk dari formulir kontak.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.slice(0, 4).map((msg) => (
                        <div
                            key={msg.id}
                            className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between space-y-2.5 ${
                                !msg.is_read
                                    ? 'border-violet-200/90 bg-violet-50/40 dark:border-violet-900/50 dark:bg-violet-950/20'
                                    : 'border-slate-200/70 bg-white/60 hover:bg-white hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-950/30 dark:hover:bg-slate-850'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    {!msg.is_read && (
                                        <span className="size-2 rounded-full bg-violet-600 shrink-0" />
                                    )}
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {msg.name}
                                    </span>
                                    {msg.replied_at && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                            <CheckCircle2 size={10} />
                                            Dibalas
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-slate-400 shrink-0">
                                    {new Date(msg.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {msg.subject || '(Tanpa Subjek)'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                                    {msg.message}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                    {msg.email}
                                </span>
                                <Link
                                    href="/admin/messages"
                                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-0.5"
                                >
                                    <span>Balas</span>
                                    <ArrowUpRight size={12} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
