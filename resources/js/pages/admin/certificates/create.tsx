import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ImageUpload } from '@/components/admin/image-upload';
import { TagsInput } from '@/components/admin/tags-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Save,
    Award,
    Calendar,
    Clock,
    CheckCircle2,
    Eye,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

export default function CertificateCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: '',
        issuer: 'Dicoding Indonesia',
        credential_id: '',
        date: '',
        duration: '',
        skills: [] as string[],
        file: null as File | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (file: File | null) => {
        setData('file', file);
        if (file && file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/certificates', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Sertifikat berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan sertifikat. Silakan periksa input formulir.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Sertifikat & Lisensi', href: '/admin/certificates' },
                { title: 'Tambah Baru', href: '/admin/certificates/create' },
            ]}
        >
            <Head title="Tambah Sertifikat Baru - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-amber-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-amber-400">
                        <Award size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Tambah Sertifikat{' '}
                            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                & Lisensi
                            </span>
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Unggah bukti kelulusan kursus atau lisensi sertifikasi profesional dengan live preview
                        </p>
                    </div>
                </div>

                {/* Split-Screen Studio Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                    {/* Left Column: Form Editor (7 cols) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                        <div className="glass-card rounded-[2.2rem] border border-slate-200/70 bg-white/75 p-7 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Sertifikat / Kursus
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="cth: Menjadi Back-End Developer Expert"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-violet-500/30"
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="issuer" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Penerbit / Institusi
                                    </Label>
                                    <Input
                                        id="issuer"
                                        value={data.issuer}
                                        onChange={(e) => setData('issuer', e.target.value)}
                                        placeholder="cth: Dicoding Indonesia, AWS, Google"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-violet-500/30"
                                    />
                                    {errors.issuer && (
                                        <p className="text-xs text-destructive">{errors.issuer}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Kategori Keahlian
                                    </Label>
                                    <Input
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="cth: Backend, Frontend, Cloud"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-violet-500/30"
                                    />
                                    {errors.category && (
                                        <p className="text-xs text-destructive">{errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="credential_id" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        ID Kredensial (Opsional)
                                    </Label>
                                    <Input
                                        id="credential_id"
                                        value={data.credential_id}
                                        onChange={(e) => setData('credential_id', e.target.value)}
                                        placeholder="cth: 07255..."
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus-visible:ring-violet-500/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Tanggal Terbit
                                    </Label>
                                    <Input
                                        id="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        placeholder="cth: Jan 2024"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Durasi Belajar / Total Jam
                                </Label>
                                <Input
                                    id="duration"
                                    value={data.duration}
                                    onChange={(e) => setData('duration', e.target.value)}
                                    placeholder="cth: 90 Jam Belajar"
                                    className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Skills / Materi yang Dikuasai
                                </Label>
                                <TagsInput
                                    value={data.skills}
                                    onChange={(skills) => setData('skills', skills)}
                                    placeholder="Node.js, PostgreSQL, AWS, Microservices..."
                                    error={errors.skills}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    File Sertifikat (Gambar / PDF)
                                </Label>
                                <ImageUpload
                                    onChange={handleFileChange}
                                    error={errors.file}
                                    label="Upload File Sertifikat"
                                />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                asChild
                                variant="ghost"
                                className="rounded-2xl text-xs font-bold"
                            >
                                <Link href="/admin/certificates">Batal</Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2 min-w-36 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs h-10 cursor-pointer"
                            >
                                <Save className="size-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Sertifikat'}
                            </Button>
                        </div>
                    </form>

                    {/* Right Column: Live Certificate Canvas Preview (5 cols) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="size-3.5 text-amber-500" />
                                Live Credential Canvas
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                                Real-Time Render
                            </span>
                        </div>

                        {/* Certificate Card Preview (Matches Certificates.tsx) */}
                        <div className="glass-card rounded-[2.2rem] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none space-y-5">
                            {previewUrl && (
                                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-950 shadow-inner dark:border-slate-800">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-[10.5px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <ShieldCheck size={13} />
                                    {data.issuer || 'Penerbit'}
                                </span>
                                <span className="text-[10.5px] font-bold text-slate-400 font-mono">
                                    {data.category || 'Kategori'}
                                </span>
                            </div>

                            <div>
                                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                                    {data.title || 'Nama Sertifikat Anda'}
                                </h4>
                                {data.credential_id && (
                                    <p className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
                                        ID: #{data.credential_id}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                {data.date && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar size={12} className="text-slate-400" />
                                        {data.date}
                                    </span>
                                )}
                                {data.duration && (
                                    <span className="inline-flex items-center gap-1">
                                        <Clock size={12} className="text-slate-400" />
                                        {data.duration}
                                    </span>
                                )}
                            </div>

                            {data.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {data.skills.map((s) => (
                                        <span
                                            key={s}
                                            className="rounded-lg border border-slate-200/60 bg-slate-100/70 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
