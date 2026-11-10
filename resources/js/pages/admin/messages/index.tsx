import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Mail,
    Trash2,
    Send,
    Search,
    X,
    Inbox,
    Check,
    CheckCheck,
    Sparkles,
    UserCheck,
    MessageCircle,
    CornerDownLeft,
    Clock,
    Tag,
    Copy,
    ArrowUpRight,
} from 'lucide-react';
import { Message, PaginatedData } from '@/types';
import { toast } from 'sonner';

export interface ThreadChatItem {
    id: string;
    message_id: number;
    sender: 'visitor' | 'admin';
    sender_name: string;
    text: string;
    subject?: string | null;
    created_at: string;
    time: string;
    date: string;
    is_read: boolean;
}

export interface MessageThread {
    id: number;
    email: string;
    name: string;
    subject: string;
    latest_message: string;
    latest_sender: 'visitor' | 'admin';
    latest_time: string;
    latest_timestamp: string;
    unread_count: number;
    has_unread: boolean;
    is_read: boolean;
    total_messages: number;
    items: ThreadChatItem[];
    raw_ids: number[];
}

interface MessagesIndexProps {
    threads?: MessageThread[];
    messages?: PaginatedData<Message>;
    filters: {
        search?: string;
        filter?: string;
    };
    unreadCount: number;
}

export default function MessagesIndex({
    threads = [],
    messages,
    filters,
    unreadCount,
}: MessagesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [threadsList, setThreadsList] = useState<MessageThread[]>(threads);
    const [liveUnreadCount, setLiveUnreadCount] = useState<number>(unreadCount);
    const [selectedEmail, setSelectedEmail] = useState<string | null>(
        threads.length > 0 ? threads[0].email : null
    );
    const [threadToDelete, setThreadToDelete] = useState<MessageThread | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const chatScrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Keep local state synchronized when Inertia props change
    useEffect(() => {
        setThreadsList(threads);
    }, [threads]);

    useEffect(() => {
        setLiveUnreadCount(unreadCount);
    }, [unreadCount]);

    // Active selected thread derived from threadsList
    const activeThread =
        threadsList.find((t) => t.email.toLowerCase() === selectedEmail?.toLowerCase()) ||
        (threadsList.length > 0 ? threadsList[0] : null);

    const replyForm = useForm({
        reply_content: '',
    });

    // Real-time synchronization loop: polls /studio/messages/sync every 2 seconds
    useEffect(() => {
        let isSyncing = false;

        const pollSync = async () => {
            if (isSyncing || document.hidden) return;
            isSyncing = true;

            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (filters.filter) params.append('filter', filters.filter);

                const res = await fetch(`/studio/messages/sync?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.threads)) {
                        setThreadsList((prev) => {
                            const prevSummary = prev
                                .map((t) => `${t.id}-${t.unread_count}-${t.items.length}-${t.latest_message}`)
                                .join('|');
                            const nextSummary = data.threads
                                .map((t: MessageThread) => `${t.id}-${t.unread_count}-${t.items.length}-${t.latest_message}`)
                                .join('|');

                            if (prevSummary !== nextSummary) {
                                return data.threads;
                            }
                            return prev;
                        });
                    }
                    if (typeof data.unreadCount === 'number') {
                        setLiveUnreadCount(data.unreadCount);
                    }
                }
            } catch (err) {
                // Silently ignore background poll errors
            } finally {
                isSyncing = false;
            }
        };

        const timer = setInterval(pollSync, 2000);

        const handleVisibilityChange = () => {
            if (!document.hidden) pollSync();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [search, filters.filter]);

    // Auto-scroll chat feed to the bottom when active thread changes or new items appear
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [activeThread?.items, selectedEmail]);

    const handleSelectThread = (thread: MessageThread) => {
        setSelectedEmail(thread.email);
        replyForm.reset('reply_content');
        setTimeout(() => textareaRef.current?.focus(), 80);
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/studio/messages',
            { ...filters, search: val },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (filterType: string) => {
        router.get(
            '/studio/messages',
            { ...filters, filter: filterType },
            { preserveState: true }
        );
    };

    const handleSendReply = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!activeThread || !replyForm.data.reply_content.trim() || isSubmittingReply) return;

        const replyText = replyForm.data.reply_content.trim();
        const now = new Date();

        // Optimistic UI update: instantly append admin bubble to chat feed
        const optimisticItem: ThreadChatItem = {
            id: 'temp_' + Date.now(),
            message_id: activeThread.id,
            sender: 'admin',
            sender_name: 'Ridhwan (Anda)',
            text: replyText,
            created_at: now.toISOString(),
            time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            is_read: true,
        };

        setThreadsList((prev) =>
            prev.map((t) =>
                t.email === activeThread.email
                    ? {
                          ...t,
                          items: [...t.items, optimisticItem],
                          latest_message: replyText,
                          latest_sender: 'admin',
                          unread_count: 0,
                          has_unread: false,
                          is_read: true,
                      }
                    : t
            )
        );

        setIsSubmittingReply(true);

        router.post(
            `/studio/messages/${activeThread.id}/reply`,
            {
                reply_content: replyText,
                subject: `Balasan: ${activeThread.subject || 'Percakapan Portofolio'}`,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pesan balasan berhasil dikirim!');
                    replyForm.setData('reply_content', '');
                    setIsSubmittingReply(false);
                    setTimeout(() => {
                        if (chatScrollRef.current) {
                            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                        }
                        textareaRef.current?.focus();
                    }, 100);
                },
                onError: (errors) => {
                    console.error('Reply failed:', errors);
                    toast.error('Gagal mengirimkan balasan. Silakan coba lagi.');
                    setIsSubmittingReply(false);
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendReply();
        }
    };

    const handleToggleRead = (thread: MessageThread) => {
        router.patch(
            `/studio/messages/${thread.id}/toggle-read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        thread.is_read ? 'Percakapan ditandai belum dibaca.' : 'Percakapan ditandai sudah dibaca.'
                    );
                },
            }
        );
    };

    const handleDeleteThread = () => {
        if (!threadToDelete) return;
        setDeleting(true);
        router.delete(`/studio/messages/${threadToDelete.id}?all_thread=1`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Seluruh riwayat percakapan berhasil dihapus.');
                const remaining = threadsList.filter((t) => t.email !== threadToDelete.email);
                setSelectedEmail(remaining.length > 0 ? remaining[0].email : null);
                setThreadToDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus percakapan.');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(true);
        toast.info(`Alamat email ${email} disalin!`);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Pusat Percakapan (Inbox)', href: '/studio/messages' },
            ]}
        >
            <Head title="Studio Chat & Inbox - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-violet-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-violet-400">
                            <MessageCircle size={26} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Studio{' '}
                                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                    Live Chat & Inbox
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Diskusi dua arah terpadu dengan klien dan pengunjung portofolio secara real-time
                            </p>
                        </div>
                    </div>

                    {liveUnreadCount > 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-pink-50/90 px-4 py-1.5 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/40 dark:text-pink-400 text-xs font-bold shadow-xs">
                            <span className="size-2 rounded-full bg-pink-500 animate-ping" />
                            {liveUnreadCount} Pesan Belum Dibaca
                        </span>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-[1.8rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-lg shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Cari nama klien, email, perihal, atau isi chat..."
                            className="pl-10 pr-8 h-10 text-xs rounded-2xl border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50 focus-visible:ring-violet-500/30"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => handleSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        {[
                            { key: 'all', label: 'Semua Obrolan' },
                            { key: 'unread', label: 'Belum Dibaca' },
                            { key: 'read', label: 'Sudah Dibaca' },
                        ].map((f) => {
                            const isActive =
                                (!filters.filter && f.key === 'all') ||
                                filters.filter === f.key;
                            return (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => handleFilterChange(f.key === 'all' ? '' : f.key)}
                                    className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Split-Pane: Left Threads (5 cols) & Right Chat Room (7 cols) */}
                {threadsList.length === 0 ? (
                    <div className="glass-card py-20 text-center rounded-[2.2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                        <Inbox className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Percakapan Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {search
                                ? `Tidak ada percakapan yang cocok dengan kata kunci "${search}".`
                                : 'Belum ada pesan masuk dari pengunjung web atau formulir kontak.'}
                        </p>
                    </div>
                ) : (
                    <div className="glass-card rounded-[2.2rem] border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
                        {/* LEFT PANE: Unified Conversation Thread List */}
                        <div className="lg:col-span-5 border-r border-slate-200/70 dark:border-slate-800/70 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/20">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>Daftar Percakapan ({threadsList.length})</span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold normal-case">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Sync
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[680px] flex-1 scrollbar-thin">
                                {threadsList.map((thread) => {
                                    const isSelected = activeThread?.email === thread.email;
                                    return (
                                        <button
                                            key={thread.email}
                                            type="button"
                                            onClick={() => handleSelectThread(thread)}
                                            className={`w-full p-4.5 text-left transition-all flex items-start gap-3.5 cursor-pointer border-l-4 ${
                                                isSelected
                                                    ? 'bg-violet-50/90 dark:bg-violet-950/40 border-l-violet-600'
                                                    : 'border-l-transparent hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                                            }`}
                                        >
                                            {/* Avatar with Initials */}
                                            <div className="relative shrink-0">
                                                <div className="size-11 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-violet-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-extrabold text-sm flex items-center justify-center">
                                                    {thread.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                {thread.unread_count > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-pink-500 ring-2 ring-white dark:ring-slate-900" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                                            {thread.name}
                                                        </span>
                                                        {thread.unread_count > 0 && (
                                                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500 text-white shrink-0">
                                                                {thread.unread_count} baru
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                        {thread.latest_time}
                                                    </span>
                                                </div>

                                                <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 truncate">
                                                    {thread.subject}
                                                </p>

                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                                    {thread.latest_sender === 'admin' ? (
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                            Anda:{' '}
                                                        </span>
                                                    ) : null}
                                                    {thread.latest_message}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT PANE: Modern Chat Room & Continuous Conversation */}
                        <div className="lg:col-span-7 flex flex-col h-full bg-white/40 dark:bg-slate-900/40">
                            {activeThread ? (
                                <div className="flex flex-col h-full">
                                    {/* Chat Room Header */}
                                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white/60 dark:bg-slate-950/30">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-11 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-violet-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                                                {activeThread.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                                                        {activeThread.name}
                                                    </h3>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Aktif
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                    <span className="font-mono text-[11px] truncate">{activeThread.email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyEmail(activeThread.email)}
                                                        className="hover:text-violet-600 transition-colors"
                                                        title="Salin Email"
                                                    >
                                                        <Copy size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggleRead(activeThread)}
                                                className="h-8 text-xs rounded-xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 font-bold"
                                            >
                                                {activeThread.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setThreadToDelete(activeThread)}
                                                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 font-bold"
                                                title="Hapus Percakapan"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Topic Header Strip */}
                                    <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-0">
                                            <Tag className="size-3.5 text-violet-500 shrink-0" />
                                            <span className="font-bold shrink-0">Topik Diskusi:</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                                {activeThread.subject}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                                            {activeThread.total_messages} Pesan
                                        </span>
                                    </div>

                                    {/* Chat Bubbles Feed (Scrollable) */}
                                    <div
                                        ref={chatScrollRef}
                                        className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[460px] scrollbar-thin"
                                    >
                                        <div className="text-center my-2">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/60 dark:border-slate-700/60">
                                                Awal Riwayat Obrolan dengan {activeThread.name}
                                            </span>
                                        </div>

                                        {activeThread.items.map((item) => {
                                            const isVisitor = item.sender === 'visitor';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex flex-col ${isVisitor ? 'items-start' : 'items-end'}`}
                                                >
                                                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[78%]">
                                                        {isVisitor && (
                                                            <div className="size-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mb-1">
                                                                {item.sender_name.slice(0, 2).toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div
                                                            className={`p-4 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-xs ${
                                                                isVisitor
                                                                    ? 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/70 dark:border-slate-700/70'
                                                                    : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white rounded-br-xs shadow-md shadow-violet-500/20'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 font-semibold mb-1">
                                                                <span>{isVisitor ? item.sender_name : 'Ridhwan (Anda)'}</span>
                                                                <span>{item.time}</span>
                                                            </div>

                                                            <div className="whitespace-pre-wrap break-words font-normal">
                                                                {item.text}
                                                            </div>
                                                        </div>

                                                        {!isVisitor && (
                                                            <div className="size-7 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mb-1 shadow-xs">
                                                                RM
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-mono ${
                                                            isVisitor ? 'pl-9' : 'pr-9'
                                                        }`}
                                                    >
                                                        <span>{item.date}</span>
                                                        {!isVisitor && (
                                                            <span className="flex items-center text-violet-500 gap-0.5">
                                                                <CheckCheck className="size-3" />
                                                                Terkirim
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Bottom Sticky Chat Composer ("Seperti Chat Biasa") */}
                                    <form
                                        onSubmit={handleSendReply}
                                        className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md space-y-2.5"
                                    >
                                        <div className="relative rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-inner focus-within:ring-2 focus-within:ring-violet-500/30 transition-all">
                                            <Textarea
                                                ref={textareaRef}
                                                rows={2}
                                                value={replyForm.data.reply_content}
                                                onChange={(e) => replyForm.setData('reply_content', e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={`Ketik pesan balasan untuk ${activeThread.name}... (Tekan Enter untuk kirim)`}
                                                className="border-0 focus-visible:ring-0 text-xs resize-none bg-transparent py-3 px-3.5 pr-24 rounded-2xl min-h-[58px]"
                                            />

                                            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        !replyForm.data.reply_content.trim() || isSubmittingReply
                                                    }
                                                    size="sm"
                                                    className="h-8 gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 text-white font-bold text-xs shadow-md shadow-violet-500/25 px-3.5 cursor-pointer disabled:opacity-50"
                                                >
                                                    <Send className="size-3" />
                                                    <span>{isSubmittingReply ? 'Mengirim...' : 'Kirim'}</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                                            <span className="flex items-center gap-1">
                                                <CornerDownLeft className="size-3 text-slate-400" />
                                                Tekan <strong className="text-slate-600 dark:text-slate-300">Enter</strong> untuk kirim, <strong className="text-slate-600 dark:text-slate-300">Shift + Enter</strong> untuk baris baru
                                            </span>
                                            <span className="font-mono">
                                                Terkirim ke email {activeThread.email} &amp; widget web
                                            </span>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="py-32 text-center text-xs text-slate-400 space-y-2">
                                    <MessageCircle className="size-10 mx-auto text-slate-300 dark:text-slate-700" />
                                    <p>Pilih salah satu percakapan di sebelah kiri untuk mulai mengobrol.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={!!threadToDelete}
                    onOpenChange={(open) => !open && setThreadToDelete(null)}
                    title="Hapus Seluruh Percakapan"
                    description={`Apakah Anda yakin ingin menghapus seluruh riwayat percakapan dari "${threadToDelete?.name}" (${threadToDelete?.email})? Seluruh pesan dan balasan terkait akan dibersihkan.`}
                    confirmLabel="Hapus Seluruh Obrolan"
                    variant="destructive"
                    loading={deleting}
                    onConfirm={handleDeleteThread}
                />
            </div>
        </AppLayout>
    );
}
