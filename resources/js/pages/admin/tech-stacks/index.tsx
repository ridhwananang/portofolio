import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Plus,
    Edit2,
    Trash2,
    Code2,
    LayoutGrid,
    List,
    Search,
    X,
    Palette,
    Layers,
    Sparkles,
    Terminal,
} from 'lucide-react';
import {
    SiLaravel,
    SiPhp,
    SiReact,
    SiJavascript,
    SiMysql,
    SiMongodb,
    SiHtml5,
    SiCss,
    SiTailwindcss,
    SiTypescript,
    SiDocker,
    SiGit,
    SiNodedotjs,
    SiPostgresql,
    SiNextdotjs,
    SiVuedotjs,
    SiPython,
} from 'react-icons/si';
import { TechStack } from '@/types';
import { toast } from 'sonner';

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
    SiLaravel,
    SiPhp,
    SiReact,
    SiJavascript,
    SiMysql,
    SiMongodb,
    SiHtml5,
    SiCss,
    SiTailwindcss,
    SiTypescript,
    SiDocker,
    SiGit,
    SiNodedotjs,
    SiPostgresql,
    SiNextdotjs,
    SiVuedotjs,
    SiPython,
};

interface TechStacksIndexProps {
    techStacks: TechStack[];
}

export default function TechStacksIndex({ techStacks = [] }: TechStacksIndexProps) {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStack, setEditingStack] = useState<TechStack | null>(null);
    const [stackToDelete, setStackToDelete] = useState<TechStack | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        badge: '',
        color: '#f8fafc',
        text_color: '#0f172a',
        accent: '#cbd5e1',
        icon_name: '',
    });

    const openCreateDialog = () => {
        setEditingStack(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (stack: TechStack) => {
        setEditingStack(stack);
        setData({
            name: stack.name,
            description: stack.description,
            badge: stack.badge,
            color: stack.color || '#f8fafc',
            text_color: stack.text_color || '#0f172a',
            accent: stack.accent || '#cbd5e1',
            icon_name: stack.icon_name || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingStack) {
            put(`/admin/tech-stacks/${editingStack.id}`, {
                onSuccess: () => {
                    toast.success('Tech stack berhasil diperbarui.');
                    setIsDialogOpen(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal memperbarui tech stack.');
                },
            });
        } else {
            post('/admin/tech-stacks', {
                onSuccess: () => {
                    toast.success('Tech stack baru berhasil ditambahkan.');
                    setIsDialogOpen(false);
                    reset();
                },
                onError: () => {
                    toast.error('Gagal menambahkan tech stack.');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!stackToDelete) return;
        setDeleting(true);
        router.delete(`/admin/tech-stacks/${stackToDelete.id}`, {
            onSuccess: () => {
                toast.success('Tech stack berhasil dihapus.');
                setStackToDelete(null);
            },
            onError: () => {
                toast.error('Gagal menghapus tech stack.');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    const filteredStacks = techStacks.filter(
        (s) =>
            !search.trim() ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase()) ||
            s.badge.toLowerCase().includes(search.toLowerCase())
    );

    const renderTechIcon = (iconName: string) => {
        const IconComponent = iconComponents[iconName];
        if (!IconComponent) {
            return <Terminal className="size-8 text-violet-500" />;
        }
        return <IconComponent className="size-8" />;
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/admin' },
                { title: 'Tech Stacks Matrix', href: '/admin/tech-stacks' },
            ]}
        >
            <Head title="Tech Stacks Matrix - Ridhwan Studio" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Section Header (Persis TechStack.tsx) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="rounded-2xl border border-slate-200/50 bg-white p-3 text-cyan-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-cyan-400">
                            <Terminal size={24} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Tech{' '}
                                <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                    Stacks Matrix
                                </span>
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Kelola bahasa pemrograman, framework, arsitektur database, dan perkakas rekayasa perangkat lunak
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={openCreateDialog}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Tambah Tech Stack</span>
                    </Button>
                </div>

                {/* Filter & View Control HUD */}
                <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-[1.8rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-lg shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama teknologi, deskripsi, atau kategori..."
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
                {filteredStacks.length === 0 ? (
                    <div className="glass-card py-20 text-center rounded-[2.2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                        <Terminal className="size-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Tech Stack Ditemukan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {search
                                ? `Tidak ada teknologi yang sesuai dengan pencarian "${search}".`
                                : 'Belum ada data tech stack yang ditambahkan ke matriks.'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View (Exact same card style as TechStack.tsx on Public Homepage) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredStacks.map((stack) => (
                            <div
                                key={stack.id}
                                className="glass-card group flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/50 hover:bg-white/90 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:shadow-none"
                            >
                                <div className="space-y-4">
                                    {/* Icon & Category Badge */}
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-110 transition-transform duration-300">
                                            {renderTechIcon(stack.icon_name)}
                                        </div>
                                        <span className="rounded-full border border-slate-200/80 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800 px-3 py-1 text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
                                            {stack.badge || 'Tool'}
                                        </span>
                                    </div>

                                    {/* Name & Description */}
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400 transition-colors">
                                            {stack.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                            {stack.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100/80 pt-4 text-xs dark:border-slate-800/70">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditDialog(stack)}
                                        className="h-8 gap-1.5 text-xs rounded-xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold"
                                    >
                                        <Edit2 className="size-3 text-violet-500" />
                                        Edit
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setStackToDelete(stack)}
                                        className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-2.5 font-bold"
                                    >
                                        <Trash2 className="size-3 mr-1" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="glass-card rounded-[2rem] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-5 py-3.5">Teknologi</th>
                                    <th className="px-4 py-3.5">Badge Kategori</th>
                                    <th className="px-4 py-3.5">Deskripsi</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredStacks.map((stack) => (
                                    <tr
                                        key={stack.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {stack.name}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                                                {stack.badge}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 line-clamp-1">
                                            {stack.description}
                                        </td>
                                        <td className="px-5 py-3.5 text-right space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditDialog(stack)}
                                                className="h-7 text-xs rounded-lg"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setStackToDelete(stack)}
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

                {/* Create/Edit Modal */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-lg rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                <Terminal className="size-5 text-cyan-600 dark:text-cyan-400" />
                                {editingStack ? 'Edit Tech Stack' : 'Tambah Tech Stack Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-xs">
                                Konfigurasikan teknologi dan ikon representatif untuk matriks keahlian Anda.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stack-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Teknologi
                                    </Label>
                                    <Input
                                        id="stack-name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="cth: Laravel, React, MongoDB"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stack-badge" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Badge Kategori
                                    </Label>
                                    <Input
                                        id="stack-badge"
                                        value={data.badge}
                                        onChange={(e) => setData('badge', e.target.value)}
                                        placeholder="cth: Backend, Frontend, Database"
                                        required
                                        className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                    />
                                    {errors.badge && (
                                        <p className="text-xs text-destructive">{errors.badge}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stack-desc" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Deskripsi Singkat
                                </Label>
                                <Textarea
                                    id="stack-desc"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Jelaskan peran teknologi ini dalam arsitektur rekayasa Anda..."
                                    required
                                    className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stack-icon" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Nama Ikon React-Icons (Si...)
                                </Label>
                                <Input
                                    id="stack-icon"
                                    value={data.icon_name}
                                    onChange={(e) => setData('icon_name', e.target.value)}
                                    placeholder="cth: SiLaravel, SiReact, SiMysql, SiMongodb"
                                    className="rounded-2xl border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs"
                                />
                            </div>

                            <DialogFooter className="pt-3 gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="rounded-2xl text-xs font-bold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-violet-500/25"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Tech Stack'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={!!stackToDelete}
                    onOpenChange={(open) => !open && setStackToDelete(null)}
                    title="Hapus Tech Stack"
                    description={`Apakah Anda yakin ingin menghapus "${stackToDelete?.name}" dari matriks keahlian?`}
                    confirmLabel="Hapus Stack"
                    variant="destructive"
                    loading={deleting}
                    onConfirm={handleDelete}
                />
            </div>
        </AppLayout>
    );
}
