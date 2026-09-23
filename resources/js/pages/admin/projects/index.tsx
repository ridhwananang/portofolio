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
    LayoutGrid,
    List,
    Search,
    X,
    Laptop,
    Globe,
    Smartphone,
    Monitor,
    ExternalLink,
    FolderGit2,
    ArrowUpRight,
    Sparkles,
} from 'lucide-react';
import { Project } from '@/types';
import { toast } from 'sonner';

interface ProjectsIndexProps {
    projects: Project[];
}

export default function ProjectsIndex({ projects = [] }: ProjectsIndexProps) {
    const [search, setSearch] = useState('');
    const [mockupFilter, setMockupFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filteredProjects = projects.filter((p) => {
        const matchesQuery =
            !search.trim() ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

        const matchesMockup = mockupFilter === 'all' || p.mockup_type === mockupFilter;

        return matchesQuery && matchesMockup;
    });

    const handleDelete = () => {
        if (!projectToDelete) return;
        setDeleting(true);
        router.delete(`/admin/projects/${projectToDelete.id}`, {
            onSuccess: () => {
                toast.success('Proyek berhasil dihapus.');
                setProjectToDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus proyek.');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    const getMockupIcon = (type: string) => {
        switch (type) {
            case 'macbook':
                return <Laptop className="size-3.5" />;
            case 'browser':
                return <Globe className="size-3.5" />;
            case 'mobile':
                return <Smartphone className="size-3.5" />;
            default:
                return <Monitor className="size-3.5" />;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Portofolio Proyek', href: '/admin/projects' },
            ]}
        >
            <Head title="Galeri Portofolio Proyek - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Section Header (Exact same as Projects.tsx on Public Homepage) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-violet-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-violet-400">
                            <FolderGit2 size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Portofolio{' '}
                                <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                    Karya & Proyek
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Kelola etalase karya digital, studi kasus sistem, dan tampilan mockup portofolio
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/projects/create"
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
                    >
                        <Plus size={15} />
                        <span>Tambah Proyek Baru</span>
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
                            placeholder="Cari judul proyek, teknologi, atau kata kunci..."
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

                    {/* Filter Pills & View Switcher */}
                    <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
                        {/* Mockup filter pills */}
                        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            {['all', 'macbook', 'browser', 'mobile', 'desktop'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setMockupFilter(type)}
                                    className={`px-3 py-1.5 text-xs rounded-xl capitalize font-bold transition-all ${
                                        mockupFilter === type
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs font-extrabold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {type === 'all' ? 'Semua' : type}
                                </button>
                            ))}
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
                                title="Studio Grid Cards"
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
                                title="Compact Data Sheet"
                                aria-label="Tampilan Tabel"
                            >
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {filteredProjects.length === 0 ? (
                    <div className="glass-card py-20 text-center rounded-[2.2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                        <FolderGit2 className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Proyek Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {search
                                ? `Tidak ada karya yang sesuai dengan pencarian "${search}".`
                                : 'Belum ada karya portofolio yang ditambahkan ke galeri.'}
                        </p>
                        {search && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setMockupFilter('all');
                                }}
                                className="mt-4 rounded-2xl text-xs font-bold"
                            >
                                Reset Filter
                            </Button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Studio Grid View (Exact same card style as Projects.tsx on Public Homepage) */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="glass-card group flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/50 hover:bg-white/90 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:shadow-none"
                            >
                                {/* Thumbnail Container (Aspect [16/10], exact same as Projects.tsx) */}
                                <div>
                                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-950 shadow-inner dark:border-slate-800">
                                        {project.image_url ? (
                                            <img
                                                src={project.image_url}
                                                alt={project.title}
                                                className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                                                <FolderGit2 className="size-8 mb-1 opacity-50" />
                                                Belum ada gambar
                                            </div>
                                        )}

                                        {/* Mockup type badge overlay */}
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10.5px] font-bold bg-slate-950/70 text-white backdrop-blur-md border border-white/20 capitalize shadow-xs">
                                                {getMockupIcon(project.mockup_type)}
                                                {project.mockup_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Details */}
                                    <div className="pt-5 space-y-2.5">
                                        {/* Tags */}
                                        {project.tags && project.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {project.tags.slice(0, 4).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-lg border border-slate-200/60 bg-slate-100/70 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 dark:border-slate-800/80 dark:bg-slate-800/60 dark:text-slate-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>
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
                                            <Link href={`/admin/projects/${project.id}/edit`}>
                                                <Edit2 className="size-3 text-violet-500" />
                                                Edit
                                            </Link>
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setProjectToDelete(project)}
                                            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 font-bold"
                                        >
                                            <Trash2 className="size-3 mr-1" />
                                            Hapus
                                        </Button>
                                    </div>

                                    <Link
                                        href="/"
                                        target="_blank"
                                        className="text-xs font-bold text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 inline-flex items-center gap-1"
                                    >
                                        <span>Preview</span>
                                        <ArrowUpRight size={13} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Compact Table View with Glass Card */
                    <div className="glass-card rounded-[2rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-5 py-3.5">Karya</th>
                                    <th className="px-4 py-3.5">Tipe Mockup</th>
                                    <th className="px-4 py-3.5">Tags Teknologi</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredProjects.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                                            {project.title}
                                        </td>
                                        <td className="px-4 py-3.5 capitalize text-slate-600 dark:text-slate-300">
                                            {project.mockup_type}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {project.tags?.slice(0, 3).map((t) => (
                                                    <span
                                                        key={t}
                                                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right space-x-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs rounded-lg"
                                            >
                                                <Link href={`/admin/projects/${project.id}/edit`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setProjectToDelete(project)}
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
                    open={!!projectToDelete}
                    onOpenChange={(open) => !open && setProjectToDelete(null)}
                    title="Hapus Proyek Portofolio"
                    description={`Apakah Anda yakin ingin menghapus "${projectToDelete?.title}"? Karya ini tidak akan tampil lagi di etalase publik.`}
                    confirmLabel="Hapus Karya"
                    variant="destructive"
                    loading={deleting}
                    onConfirm={handleDelete}
                />
            </div>
        </AppLayout>
    );
}
