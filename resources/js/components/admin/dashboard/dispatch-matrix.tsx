import React from 'react';
import { Link } from '@inertiajs/react';
import { Mail, ArrowUpRight, CheckCircle2, Radio, Activity } from 'lucide-react';
import { Message } from '@/types';

interface DispatchMatrixProps {
    messages: Message[];
    unreadCount: number;
}

export function DispatchMatrix({ messages, unreadCount }: DispatchMatrixProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-2xl shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50 space-y-4">
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

            {/* Header with Waveform Meter */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        // 03
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                                Client Dispatch Matrix
                            </h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                                    {unreadCount} UNREAD
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Waveform Equalizer Ornament */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60" title="Audio Waveform Activity">
                    <span className="w-0.5 h-3 bg-rose-500 rounded-full animate-pulse" />
                    <span className="w-0.5 h-4 bg-indigo-500 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-2.5 bg-violet-500 rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-0.5 h-4.5 bg-cyan-500 rounded-full animate-pulse [animation-delay:450ms]" />
                    <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-pulse [animation-delay:200ms]" />
                </div>
            </div>

            {/* Messages Feed */}
            {messages.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-mono">
                    [ NO_INBOUND_MESSAGES_LOGGED ]
                </div>
            ) : (
                <div className="space-y-2.5">
                    {messages.slice(0, 4).map((msg) => (
                        <div
                            key={msg.id}
                            className={`group rounded-xl border p-3.5 transition-all duration-200 flex flex-col justify-between space-y-2 ${
                                !msg.is_read
                                    ? 'border-indigo-200/90 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20'
                                    : 'border-slate-200/70 bg-white/70 hover:bg-white hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    {!msg.is_read && (
                                        <span className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                                    )}
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {msg.name}
                                    </span>
                                    {msg.replied_at && (
                                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                                            <CheckCircle2 size={10} />
                                            REPLIED
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10.5px] font-mono text-slate-400 shrink-0">
                                    {new Date(msg.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {msg.subject || '(TANPA SUBJEK)'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                                    {msg.message}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                                    {msg.email}
                                </span>
                                <Link
                                    href="/admin/messages"
                                    className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-0.5"
                                >
                                    <span>DISPATCH REPLY</span>
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
