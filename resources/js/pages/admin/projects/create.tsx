import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ImageUpload } from '@/components/admin/image-upload';
import { TagsInput } from '@/components/admin/tags-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Save,
    Laptop,
    Globe,
    Smartphone,
    Monitor,
    Sparkles,
    Eye,
    FolderGit2,
    ArrowRight,
} from 'lucide-react';

export default function ProjectCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        tags: [] as string[],
        mockup_type: 'macbook',
        image: null as File | null,
    });

    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const handleImageChange = (file: File | null) => {
        setData('image', file);
        if (file) {
            setPreviewImageUrl(URL.createObjectURL(file));
        } else {
            setPreviewImageUrl(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/projects', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Proyek baru berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan proyek. Silakan periksa formulir.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Portofolio Proyek', href: '/admin/projects' },
                { title: 'Tambah Baru', href: '/admin/projects/create' },
            ]}
        >
            <Head title="Tambah Proyek Baru - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Section Header (Persis Projects.tsx) */}
                <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-violet-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-violet-400">
                        <FolderGit2 size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Tambah Proyek{' '}
                            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                Portofolio
                            </span>
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Unggah karya baru, definisikan tag teknologi, dan pilih jenis frame mockup perangkat
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
                                        Judul Proyek
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="cth: SaaS Escrow Rekber Platform"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-violet-500/30"
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mockup_type" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Tipe Tampilan Mockup
                                    </Label>
                                    <Select
                                        value={data.mockup_type}
                                        onValueChange={(val) => setData('mockup_type', val)}
                                    >
                                        <SelectTrigger id="mockup_type" className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white">
                                            <SelectValue placeholder="Pilih tipe mockup" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
                                            <SelectItem value="macbook">
                                                <span className="flex items-center gap-2">
                                                    <Laptop className="size-3.5 text-violet-500" />
                                                    MacBook / Laptop
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="browser">
                                                <span className="flex items-center gap-2">
                                                    <Globe className="size-3.5 text-blue-500" />
                                                    Web Browser Window
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="mobile">
                                                <span className="flex items-center gap-2">
                                                    <Smartphone className="size-3.5 text-emerald-500" />
                                                    Mobile / Smartphone
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="desktop">
                                                <span className="flex items-center gap-2">
                                                    <Monitor className="size-3.5 text-indigo-500" />
                                                    Desktop Display
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.mockup_type && (
                                        <p className="text-xs text-destructive">{errors.mockup_type}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Deskripsi Proyek & Studi Kasus
                                </Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan arsitektur perangkat lunak, fitur unggulan, dan masalah yang berhasil dipecahkan..."
                                    required
                                    className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30 leading-relaxed"
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Tags Teknologi (Tekan Enter atau Koma)
                                </Label>
                                <TagsInput
                                    value={data.tags}
                                    onChange={(tags) => setData('tags', tags)}
                                    placeholder="Laravel, React, TypeScript, Tailwind, MongoDB..."
                                    error={errors.tags}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Tangkapan Layar / Mockup Utama
                                </Label>
                                <ImageUpload
                                    onChange={handleImageChange}
                                    error={errors.image}
                                    label="Pilih Screenshot Proyek"
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
                                <Link href="/admin/projects">Batal</Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2 min-w-36 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs h-10 cursor-pointer"
                            >
                                <Save className="size-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Proyek'}
                            </Button>
                        </div>
                    </form>

                    {/* Right Column: Live Studio Canvas Mockup (5 cols) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="size-3.5 text-violet-500" />
                                Live Canvas Mockup
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 border border-violet-200 dark:border-violet-900/60">
                                Real-Time Render
                            </span>
                        </div>

                        {/* Interactive Mockup Frame (Matches Projects.tsx Card) */}
                        <div className="glass-card rounded-[2.2rem] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none space-y-5">
                            {/* The Mockup Box */}
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-950 overflow-hidden shadow-inner dark:border-slate-800">
                                {/* Browser Chrome / Header */}
                                {data.mockup_type === 'browser' ? (
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-rose-500/80" />
                                            <span className="size-2 rounded-full bg-amber-500/80" />
                                            <span className="size-2 rounded-full bg-emerald-500/80" />
                                        </div>
                                        <div className="flex-1 text-center">
                                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 truncate max-w-[200px]">
                                                https://ridhwan.dev/{data.title ? data.title.toLowerCase().replace(/\s+/g, '-') : 'karya'}
                                            </span>
                                        </div>
                                    </div>
                                ) : data.mockup_type === 'mobile' ? (
                                    <div className="flex items-center justify-center py-2 border-b border-slate-800 bg-slate-900">
                                        <div className="w-16 h-2 rounded-full bg-slate-800" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-slate-700" />
                                            <span className="size-2 rounded-full bg-slate-700" />
                                            <span className="size-2 rounded-full bg-slate-700" />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 capitalize">
                                            {data.mockup_type}
                                        </span>
                                    </div>
                                )}

                                {/* Image Canvas */}
                                <div className="aspect-[16/10] w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                    {previewImageUrl ? (
                                        <img
                                            src={previewImageUrl}
                                            alt="Live Preview"
                                            className="w-full h-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className="text-center p-6 space-y-2">
                                            <Sparkles className="size-8 text-slate-700 mx-auto" />
                                            <p className="text-xs text-slate-500">
                                                Pilih gambar di sebelah kiri untuk melihat mockup hidup di kanvas ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Live Details Output */}
                            <div className="space-y-2.5">
                                <div className="flex flex-wrap gap-1.5">
                                    {data.tags.length > 0 ? (
                                        data.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-lg border border-slate-200/60 bg-slate-100/70 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[11px] text-slate-400 italic">
                                            Belum ada tag teknologi ditambahkan
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                                    {data.title || 'Judul Proyek Anda'}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {data.description || 'Deskripsi proyek akan ditampilkan di sini saat Anda mengetik...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
