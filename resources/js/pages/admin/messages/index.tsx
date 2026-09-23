import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Mail,
    MailOpen,
    Reply,
    Trash2,
    CheckCircle2,
    Clock,
    User,
    Send,
    Search,
    X,
    Inbox,
    CornerDownLeft,
    Check,
} from 'lucide-react';
import { Message, PaginatedData } from '@/types';
import { toast } from 'sonner';

interface MessagesIndexProps {
    messages: PaginatedData<Message>;
    filters: {
        search?: string;
        filter?: string;
    };
    unreadCount: number;
}

export default function MessagesIndex({ messages, filters, unreadCount }: MessagesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(
        messages.data.length > 0 ? messages.data[0] : null
    );
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
    const [deleting, setDeleting] = useState(false);

    const replyForm = useForm({
        subject: selectedMessage ? `Balasan: ${selectedMessage.subject || 'Pesan Anda'}` : '',
        reply_content: '',
    });

    const handleSelectMessage = (msg: Message) => {
        setSelectedMessage(msg);
        replyForm.setData({
            subject: `Balasan: ${msg.subject || 'Pesan Anda'}`,
            reply_content: '',
        });
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            '/admin/messages',
            { ...filters, search: val },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (filterType: string) => {
        router.get(
            '/admin/messages',
            { ...filters, filter: filterType },
            { preserveState: true }
        );
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMessage) return;

        replyForm.post(`/admin/messages/${selectedMessage.id}/reply`, {
            onSuccess: () => {
                toast.success('Email balasan berhasil dikirimkan!');
                replyForm.reset('reply_content');
            },
            onError: () => {
                toast.error('Gagal mengirimkan balasan. Silakan periksa formulir.');
            },
        });
    };

    const handleToggleRead = (msg: Message) => {
        router.patch(
            `/admin/messages/${msg.id}/toggle-read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(msg.is_read ? 'Ditandai belum dibaca.' : 'Ditandai sudah dibaca.');
                    if (selectedMessage?.id === msg.id) {
                        setSelectedMessage({ ...selectedMessage, is_read: !selectedMessage.is_read });
                    }
                },
            }
        );
    };

    const handleDelete = () => {
        if (!messageToDelete) return;
        setDeleting(true);
        router.delete(`/admin/messages/${messageToDelete.id}`, {
            onSuccess: () => {
                toast.success('Pesan berhasil dihapus.');
                if (selectedMessage?.id === messageToDelete.id) {
                    const remaining = messages.data.filter((m) => m.id !== messageToDelete.id);
                    setSelectedMessage(remaining.length > 0 ? remaining[0] : null);
                }
                setMessageToDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus pesan.');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Pesan Masuk (Inbox)', href: '/admin/messages' },
            ]}
        >
            <Head title="Studio Inbox & Pesan Masuk - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-pink-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-pink-400">
                            <Mail size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Pesan Masuk{' '}
                                <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                    Portofolio (Inbox)
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Kelola pesan klien, pertanyaan prospek proyek, dan kirim balasan langsung
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-pink-200/80 bg-pink-50/90 px-4 py-1.5 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/40 dark:text-pink-400 text-xs font-bold shadow-xs">
                            <span className="size-2 rounded-full bg-pink-500 animate-ping" />
                            {unreadCount} Pesan Belum Dibaca
                        </span>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-[1.8rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-lg shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Cari pengirim, email, subjek, atau isi pesan..."
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
                            { key: 'all', label: 'Semua Pesan' },
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

                {/* Superhuman Split-Pane Inbox (Glass-card rounded-[2.2rem]) */}
                {messages.data.length === 0 ? (
                    <div className="glass-card py-20 text-center rounded-[2.2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                        <Inbox className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Pesan Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {search
                                ? `Tidak ada pesan yang cocok dengan "${search}".`
                                : 'Kotak masuk pesan kontak Anda saat ini kosong.'}
                        </p>
                    </div>
                ) : (
                    <div className="glass-card rounded-[2.2rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
                        {/* Left Pane: Message Stream (5 cols) */}
                        <div className="lg:col-span-5 border-r border-slate-200/70 dark:border-slate-800/70 flex flex-col">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Daftar Pesan Masuk ({messages.data.length})
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[650px] flex-1">
                                {messages.data.map((msg) => {
                                    const isSelected = selectedMessage?.id === msg.id;
                                    return (
                                        <button
                                            key={msg.id}
                                            type="button"
                                            onClick={() => handleSelectMessage(msg)}
                                            className={`w-full p-4.5 text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-violet-50/90 dark:bg-violet-950/30 border-l-4 border-l-violet-600'
                                                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                                            }`}
                                        >
                                            <div className="size-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-violet-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                                                {msg.name.slice(0, 2).toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {!msg.is_read && (
                                                            <span className="size-2 rounded-full bg-violet-600 shrink-0" />
                                                        )}
                                                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                                            {msg.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                        {new Date(msg.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                </div>

                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                                    {msg.subject || '(Tanpa Subjek)'}
                                                </p>

                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Pane: Message Reader & Inline Composer (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 bg-white/40 dark:bg-slate-900/40">
                            {selectedMessage ? (
                                <div className="space-y-6">
                                    {/* Sender Details Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3.5">
                                            <div className="size-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-violet-500/20 border border-pink-500/30 text-pink-600 dark:text-pink-400 font-extrabold text-base flex items-center justify-center">
                                                {selectedMessage.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                    {selectedMessage.name}
                                                </h3>
                                                <span className="text-xs font-mono text-slate-500">
                                                    {selectedMessage.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggleRead(selectedMessage)}
                                                className="h-8 text-xs rounded-xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 font-bold"
                                            >
                                                {selectedMessage.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setMessageToDelete(selectedMessage)}
                                                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 font-bold"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                            {selectedMessage.subject || '(Tanpa Subjek)'}
                                        </h4>
                                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 p-5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </div>
                                    </div>

                                    {/* Inline Quick Reply Composer */}
                                    <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <Reply className="size-3.5 text-violet-500" />
                                                Kirim Balasan Email Langsung:
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                Ke: {selectedMessage.email}
                                            </span>
                                        </div>

                                        <Textarea
                                            rows={3}
                                            value={replyForm.data.reply_content}
                                            onChange={(e) => replyForm.setData('reply_content', e.target.value)}
                                            placeholder="Ketik draf balasan Anda untuk pengirim pesan ini..."
                                            required
                                            className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                        />

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={replyForm.processing}
                                                className="gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-violet-500/25 px-5 h-9 cursor-pointer"
                                            >
                                                <Send className="size-3.5" />
                                                {replyForm.processing ? 'Mengirim...' : 'Kirim Balasan Email'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="py-24 text-center text-xs text-slate-400">
                                    Pilih pesan di sebelah kiri untuk melihat isi lengkap dan membalas.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={!!messageToDelete}
                    onOpenChange={(open) => !open && setMessageToDelete(null)}
                    title="Hapus Pesan Kontak"
                    description={`Apakah Anda yakin ingin menghapus pesan dari "${messageToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                    confirmLabel="Hapus Pesan"
                    variant="destructive"
                    loading={deleting}
                    onConfirm={handleDelete}
                />
            </div>
        </AppLayout>
    );
}
