import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Edit2,
    Trash2,
    Award,
    ExternalLink,
    LayoutGrid,
    List,
    Search,
    X,
    Calendar,
    Clock,
    ShieldCheck,
    ArrowUpRight,
} from 'lucide-react';
import { Certificate } from '@/types';
import { toast } from 'sonner';

interface CertificatesIndexProps {
    certificates: Certificate[];
}

export default function CertificatesIndex({ certificates = [] }: CertificatesIndexProps) {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [certToDelete, setCertToDelete] = useState<Certificate | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filteredCerts = certificates.filter((c) => {
        const query = search.toLowerCase();
        return (
            !search.trim() ||
            c.title.toLowerCase().includes(query) ||
            c.category.toLowerCase().includes(query) ||
            c.issuer.toLowerCase().includes(query) ||
            (c.credential_id && c.credential_id.toLowerCase().includes(query)) ||
            c.skills?.some((s) => s.toLowerCase().includes(query))
        );
    });

    const handleDelete = () => {
        if (!certToDelete) return;
        setDeleting(true);
        router.delete(`/admin/certificates/${certToDelete.id}`, {
            onSuccess: () => {
                toast.success('Sertifikat berhasil dihapus.');
                setCertToDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus sertifikat.');
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
                { title: 'Sertifikat & Lisensi', href: '/admin/certificates' },
            ]}
        >
            <Head title="Sertifikat & Lisensi Kompetensi - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Section Header (Exact same as Certificates.tsx on Public Homepage) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-amber-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-amber-400">
                            <Award size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Sertifikasi &{' '}
                                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                    Lisensi Resmi
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Kelola bukti kelulusan kursus spesialis, lisensi profesional, dan kredensial terverifikasi
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/certificates/create"
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
                    >
                        <Plus size={15} />
                        <span>Tambah Sertifikat Baru</span>
                    </Link>
                </div>

                {/* Filter & View Control HUD (Glass-card rounded-[1.8rem]) */}
                <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-[1.8rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-lg shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                    {/* Search bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama sertifikat, institusi (Dicoding), ID kredensial..."
                            className="pl-10 pr-8 h-10 text-xs rounded-2xl border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50 focus-visible:ring-violet-500/30"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* View Switcher: Grid vs Table */}
                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Grid Cards"
                            aria-label="Tampilan Grid"
                        >
                            <LayoutGrid className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-xl transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Table Sheet"
                            aria-label="Tampilan Tabel"
                        >
                            <List className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {filteredCerts.length === 0 ? (
                    <div className="glass-card py-20 text-center rounded-[2.2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                        <Award className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Sertifikat Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {search
                                ? `Tidak ada lisensi yang sesuai dengan pencarian "${search}".`
                                : 'Belum ada sertifikat lisensi yang ditambahkan ke etalase.'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View (Exact same card style as Certificates.tsx on Public Homepage) */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCerts.map((cert) => (
                            <div
                                key={cert.id}
                                className="glass-card group flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/50 hover:bg-white/90 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:shadow-none"
                            >
                                <div className="space-y-4">
                                    {/* Thumbnail Preview if Available */}
                                    {cert.thumbnail_url || cert.file_url ? (
                                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-950 shadow-inner dark:border-slate-800">
                                            <img
                                                src={(cert.thumbnail_url || cert.file_url) ?? undefined}
                                                alt={cert.title}
                                                className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                        </div>
                                    ) : null}

                                    {/* Category & Verified Badge */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-[10.5px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                                            <ShieldCheck size={13} />
                                            {cert.issuer || 'Verified'}
                                        </span>
                                        <span className="text-[10.5px] font-bold text-slate-400 font-mono">
                                            {cert.category}
                                        </span>
                                    </div>

                                    {/* Title & Details */}
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                                            {cert.title}
                                        </h3>
                                        {cert.credential_id && (
                                            <p className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
                                                ID: #{cert.credential_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Date & Duration Info */}
                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                        {cert.date && (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={12} className="text-slate-400" />
                                                {cert.date}
                                            </span>
                                        )}
                                        {cert.duration && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock size={12} className="text-slate-400" />
                                                {cert.duration}
                                            </span>
                                        )}
                                    </div>

                                    {/* Skills Badges */}
                                    {cert.skills && cert.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {cert.skills.slice(0, 4).map((s) => (
                                                <span
                                                    key={s}
                                                    className="rounded-lg border border-slate-200/60 bg-slate-100/70 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100/80 pt-4 text-xs dark:border-slate-800/70">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1.5 text-xs rounded-xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold"
                                        >
                                            <Link href={`/admin/certificates/${cert.id}/edit`}>
                                                <Edit2 className="size-3 text-violet-500" />
                                                Edit
                                            </Link>
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setCertToDelete(cert)}
                                            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 font-bold"
                                        >
                                            <Trash2 className="size-3 mr-1" />
                                            Hapus
                                        </Button>
                                    </div>

                                    {cert.file_url && (
                                        <a
                                            href={cert.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-bold text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 inline-flex items-center gap-1"
                                        >
                                            <span>Lihat Dokumen</span>
                                            <ArrowUpRight size={13} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View with Glass Card */
                    <div className="glass-card rounded-[2rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Sertifikat</th>
                                    <th className="px-4 py-3.5">Penerbit</th>
                                    <th className="px-4 py-3.5">Kategori</th>
                                    <th className="px-4 py-3.5">Tanggal</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredCerts.map((cert) => (
                                    <tr
                                        key={cert.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                                            {cert.title}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                                            {cert.issuer}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                                            {cert.category}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 font-mono">
                                            {cert.date || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right space-x-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs rounded-lg"
                                            >
                                                <Link href={`/admin/certificates/${cert.id}/edit`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setCertToDelete(cert)}
                                                className="h-7 text-xs text-rose-600 rounded-lg"
                                            >
                                                Hapus
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={!!certToDelete}
                    onOpenChange={(open) => !open && setCertToDelete(null)}
                    title="Hapus Sertifikat"
                    description={`Apakah Anda yakin ingin menghapus "${certToDelete?.title}"? Dokumen ini akan dihapus dari etalase sertifikasi.`}
                    confirmLabel="Hapus Sertifikat"
                    variant="destructive"
                    loading={deleting}
                    onConfirm={handleDelete}
                />
            </div>
        </AppLayout>
    );
}
