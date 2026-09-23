import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ImageUpload } from '@/components/admin/image-upload';
import { EducationRepeater } from '@/components/admin/education-repeater';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Profile, Education } from '@/types';
import {
    Save,
    User,
    GraduationCap,
    Globe,
    Github,
    Linkedin,
    MapPin,
    Mail,
    Eye,
    Sparkles,
    Send,
    Download,
    ExternalLink,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';

interface ProfilePageProps {
    profile: Profile | null;
}

export default function AdminProfile({ profile }: ProfilePageProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: profile?.name || '',
        role: profile?.role || '',
        bio: profile?.bio || '',
        location: profile?.location || '',
        email: profile?.email || '',
        github_url: profile?.github_url || '',
        linkedin_url: profile?.linkedin_url || '',
        image: null as File | null,
        education: (profile?.education || []) as Education[],
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.image || null);

    const handleAvatarChange = (file: File | null) => {
        setData('image', file);
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setAvatarPreview(profile?.image || null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/profile', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Profil portofolio berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal menyimpan profil. Silakan periksa formulir.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Profil & Bio Portofolio', href: '/admin/profile' },
            ]}
        >
            <Head title="Creator Identity Studio - Ridhwan Anang" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Cockpit Hero Banner */}
                <div className="glass-card relative overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xl shadow-slate-100/50 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-blue-500/5 blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                Creator Identity Studio & Bio Engine
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                Profil & Narasi{' '}
                                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                    Portofolio Publik
                                </span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                                Kelola narasi bio, spesialisasi keahlian, dan riwayat akademik dengan pratinjau kartu profil publik langsung secara real-time.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                            >
                                <Link href="/admin">
                                    <ArrowLeft className="size-4 mr-1.5" />
                                    Kembali ke Cockpit
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                            >
                                <a href="/#profile-card" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="size-4 mr-1.5" />
                                    Buka di Publik
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Split Dossier Studio Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Form Editor (7 cols) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                        {/* Section 1: Informasi Utama & Peran */}
                        <div className="glass-card rounded-[2rem] sm:rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-200/70 dark:border-slate-800/80 pb-4">
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-xs">
                                    <User className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Informasi Pribadi & Peran
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Data utama yang tampil pada hero section dan kartu pengembang portofolio.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth: Ridhwan Anang Ma'ruf"
                                        required
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                    />
                                    {errors.name && <p className="text-xs font-semibold text-rose-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Role / Spesialisasi
                                    </Label>
                                    <Input
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        placeholder="cth: Fullstack Web Developer & Escrow Architect"
                                        required
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                    />
                                    {errors.role && <p className="text-xs font-semibold text-rose-500">{errors.role}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Email Kontak Publik
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="cth: hello@ridhwan.dev"
                                        required
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus-visible:ring-violet-500/30"
                                    />
                                    {errors.email && <p className="text-xs font-semibold text-rose-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="location" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Lokasi Domisili
                                    </Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="cth: Yogyakarta, Indonesia"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30"
                                    />
                                    {errors.location && (
                                        <p className="text-xs font-semibold text-rose-500">{errors.location}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="bio" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Biografi & Narasi Profesional
                                </Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Ceritakan latar belakang, fokus rekayasa perangkat lunak, dan nilai tambah yang Anda tawarkan kepada calon klien..."
                                    className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus-visible:ring-violet-500/30 leading-relaxed"
                                />
                                {errors.bio && <p className="text-xs font-semibold text-rose-500">{errors.bio}</p>}
                            </div>

                            {/* Avatar Upload */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Foto Profil / Avatar Portofolio
                                </Label>
                                <ImageUpload
                                    currentImageUrl={profile?.image || undefined}
                                    onChange={handleAvatarChange}
                                    error={errors.image}
                                />
                            </div>
                        </div>

                        {/* Section 2: Media Sosial & Ekosistem */}
                        <div className="glass-card rounded-[2rem] sm:rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-200/70 dark:border-slate-800/80 pb-4">
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs">
                                    <Globe className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Tautan Sosial & Repositori
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Tautan eksternal yang dapat diakses oleh pengunjung dan calon klien.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="github_url" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        GitHub Profile URL
                                    </Label>
                                    <Input
                                        id="github_url"
                                        value={data.github_url}
                                        onChange={(e) => setData('github_url', e.target.value)}
                                        placeholder="https://github.com/username"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus-visible:ring-violet-500/30"
                                    />
                                    {errors.github_url && (
                                        <p className="text-xs font-semibold text-rose-500">{errors.github_url}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="linkedin_url" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        LinkedIn Profile URL
                                    </Label>
                                    <Input
                                        id="linkedin_url"
                                        value={data.linkedin_url}
                                        onChange={(e) => setData('linkedin_url', e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                        className="rounded-xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus-visible:ring-violet-500/30"
                                    />
                                    {errors.linkedin_url && (
                                        <p className="text-xs font-semibold text-rose-500">{errors.linkedin_url}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Riwayat Pendidikan */}
                        <div className="glass-card rounded-[2rem] sm:rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-200/70 dark:border-slate-800/80 pb-4">
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-xs">
                                    <GraduationCap className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Riwayat Pendidikan & Gelar
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Informasi institusi pendidikan formal atau universitas yang tampil pada kartu profil.
                                    </p>
                                </div>
                            </div>

                            <EducationRepeater
                                value={data.education}
                                onChange={(items) => setData('education', items)}
                            />
                        </div>

                        {/* Save Action */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-auto"
                            >
                                <Save className="size-4 mr-2" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                            </Button>
                        </div>
                    </form>

                    {/* Right Column: Live Public Profile Card Preview (5 cols, sticky) */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Eye className="size-4 text-violet-600 dark:text-violet-400" />
                                Pratinjau Kartu Publik Langsung
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                Live Sync
                            </span>
                        </div>

                        {/* Public Profile Hero Card Mockup - Exact match to ProfileCard.tsx */}
                        <div
                            id="profile-card-preview"
                            className="glass-card relative flex w-full flex-col items-center overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-white/75 p-8 text-center shadow-xl shadow-slate-100/50 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none transition-all duration-300"
                        >
                            {/* Decorative top gradient accent bar */}
                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

                            {/* Avatar Container with glowing rings */}
                            <div className="group relative mb-6 select-none">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-violet-500 to-indigo-500 opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-50 animate-spin-slow" />
                                <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-gradient-to-tr from-blue-500 via-violet-500 to-indigo-500 p-[3px] shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-slate-800">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={data.name || 'Preview'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-violet-500/10 text-violet-600 dark:text-violet-300 font-black text-2xl">
                                                {data.name ? data.name.slice(0, 2).toUpperCase() : 'RA'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Breathing Online Status Indicator Dot */}
                                <span className="absolute right-2 bottom-1 flex h-4 w-4">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span
                                        className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] dark:border-slate-900"
                                        title="Aktif saat ini"
                                    />
                                </span>
                            </div>

                            {/* Profile Details */}
                            <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {data.name || 'Nama Lengkap Anda'}
                            </h2>
                            <p className="mb-4 inline-block rounded-full bg-violet-50 px-3.5 py-1 text-xs sm:text-sm font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                                {data.role || 'Role / Profesi Anda'}
                            </p>

                            {/* Brief bio text */}
                            <p className="mb-6 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {data.bio || 'Bio dan narasi perkenalan akan tampil di sini saat Anda mengetik...'}
                            </p>

                            {/* Decorative separator line */}
                            <div className="mb-6 h-[1px] w-full bg-slate-100 dark:bg-slate-800" />

                            {/* Contact Statistics List */}
                            <div className="mb-6 w-full space-y-3.5 text-left">
                                {/* Location Row */}
                                <div className="group flex items-start gap-3.5">
                                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-colors duration-300 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                            Location
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {data.location || 'Lokasi belum diatur'}
                                        </span>
                                    </div>
                                </div>

                                {/* Email Row */}
                                <div className="group flex items-start gap-3.5">
                                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 transition-colors duration-300 group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-violet-950 dark:group-hover:text-violet-400">
                                        <Mail size={16} strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                            Email
                                        </span>
                                        <span className="text-xs font-semibold break-words text-slate-700 dark:text-slate-300">
                                            {data.email || 'email@domain.com'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Call To Action Buttons (Simulated) */}
                            <div className="w-full space-y-2.5">
                                <button
                                    type="button"
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                >
                                    <Send size={14} strokeWidth={2.4} />
                                    Hubungi Saya
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200/60 bg-white py-3 text-xs font-bold text-slate-800 shadow-xs transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    <Download size={14} strokeWidth={2.4} />
                                    Download Resume (PDF)
                                </button>
                            </div>

                            {/* Social Network Grid */}
                            <div className="mt-5 flex items-center gap-3">
                                {data.github_url && (
                                    <a
                                        href={data.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-slate-200/50 bg-slate-50 p-2.5 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-slate-950 hover:text-white hover:border-slate-950 dark:border-slate-800/50 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-white dark:hover:text-slate-950 dark:hover:border-white"
                                        aria-label="Kunjungi profil GitHub"
                                    >
                                        <Github size={16} />
                                    </a>
                                )}
                                {data.linkedin_url && (
                                    <a
                                        href={data.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-slate-200/50 bg-slate-50 p-2.5 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] dark:border-slate-800/50 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-[#0A66C2] dark:hover:text-white dark:hover:border-[#0A66C2]"
                                        aria-label="Kunjungi profil LinkedIn"
                                    >
                                        <Linkedin size={16} />
                                    </a>
                                )}
                            </div>

                            {/* Education History Section */}
                            {data.education && data.education.length > 0 && (
                                <div className="mt-6 w-full border-t border-slate-100/75 pt-5 text-left dark:border-slate-800/60">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            <GraduationCap size={14} />
                                        </div>
                                        <span className="text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                            Riwayat Pendidikan
                                        </span>
                                    </div>

                                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3.5 pl-5 space-y-4">
                                        {data.education.map((edu, idx) => (
                                            <div key={idx} className="relative group/edu">
                                                <div className="absolute -left-[25px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 group-hover/edu:border-amber-400 group-hover/edu:bg-amber-50 dark:group-hover/edu:bg-amber-950/40 transition-all duration-300">
                                                    <div className="h-1 w-1 rounded-full bg-slate-300 group-hover/edu:bg-amber-500 transition-colors" />
                                                </div>

                                                <div>
                                                    <h5 className="text-[11px] font-extrabold leading-snug text-slate-800 dark:text-slate-200 group-hover/edu:text-amber-500 dark:group-hover/edu:text-amber-400 transition-colors">
                                                        {edu.school || '-'}
                                                    </h5>
                                                    {edu.major && (
                                                        <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                            {edu.major}
                                                        </span>
                                                    )}
                                                    {edu.period && (
                                                        <span className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                                                            {edu.period}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
