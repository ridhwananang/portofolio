import React from 'react';
import { Link } from '@inertiajs/react';
import { Mail, ArrowUpRight, CheckCircle2, Clock, Reply, Sparkles } from 'lucide-react';
import { Message } from '@/types';

interface FluidDispatchStreamProps {
    messages: Message[];
    unreadCount: number;
}

const AVATAR_GRADIENTS = [
    'from-violet-600 to-indigo-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-rose-500 to-pink-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-cyan-600 to-blue-600 text-white',
    'from-fuchsia-600 to-purple-600 text-white',
];

function getAvatarGradient(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export function FluidDispatchStream({ messages, unreadCount }: FluidDispatchStreamProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                        <Mail size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Pesan Masuk Klien</span>
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                                    <span className="size-1.5 rounded-full bg-rose-500" />
                                    {unreadCount} BARU
                                </span>
                            )}
                        </h3>
                    </div>
                </div>

                <Link
                    href="/admin/messages"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 inline-flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                >
                    <span>Buka Inbox</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {/* Messages Stream */}
            {messages.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
                    <Mail size={24} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <span>[ BELUM ADA PESAN MASUK ]</span>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {messages.slice(0, 4).map((msg) => {
                        const avatarGradient = getAvatarGradient(msg.name || 'User');
                        const initials = getInitials(msg.name || 'U');

                        return (
                            <div
                                key={msg.id}
                                className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border ${
                                    !msg.is_read
                                        ? 'bg-violet-500/[0.04] dark:bg-violet-500/[0.08] border-violet-500/25 hover:border-violet-500/45 hover:shadow-md hover:shadow-violet-500/5'
                                        : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/70 hover:shadow-sm'
                                } hover:-translate-y-0.5`}
                            >
                                <div className="flex items-start gap-3.5">
                                    {/* Sender Avatar with Initials */}
                                    <div className="relative shrink-0">
                                        <div
                                            className={`size-10 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-xs font-black shadow-xs tracking-wider`}
                                        >
                                            {initials}
                                        </div>
                                        {!msg.is_read && (
                                            <span className="absolute -top-1 -right-1 size-3 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 animate-pulse" />
                                        )}
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                                    {msg.name}
                                                </span>
                                                {msg.replied_at && (
                                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                                                        <CheckCircle2 size={10} />
                                                        Dibalas
                                                    </span>
                                                )}
                                                {!msg.is_read && (
                                                    <span className="hidden sm:inline-flex items-center text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-300">
                                                        Unread
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
                                                <Clock size={11} className="hidden sm:inline" />
                                                <span>
                                                    {new Date(msg.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subject & Message Preview */}
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {msg.subject || '(Tanpa Subjek)'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {msg.message}
                                        </p>

                                        {/* Footer Meta & Quick Action */}
                                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/40">
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[200px]">
                                                {msg.email}
                                            </span>

                                            <Link
                                                href="/admin/messages"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 group-hover:translate-x-0.5 transition-transform"
                                            >
                                                <Reply size={12} />
                                                <span>Balas</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
