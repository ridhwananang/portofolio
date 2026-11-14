import React, { useState, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Briefcase,
    Camera,
    Check,
    CheckCircle2,
    Crown,
    Eye,
    EyeOff,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    RotateCcw,
    Search,
    Shield,
    ShieldCheck,
    Sparkles,
    Trash2,
    UploadCloud,
    User,
    UserCheck,
    UserPlus,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PmsUser } from '@/types/pms';

const QUICK_ROLES = [
    'Senior Fullstack Engineer',
    'Lead UI/UX Designer',
    'Frontend Specialist',
    'Backend Architect',
    'DevOps & Cloud Engineer',
    'Mobile App Developer',
    'QA & Automation Lead',
    'Product Manager',
];

interface Props {
    users: {
        data: PmsUser[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    existingRoles: string[];
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

export default function UsersIndex({ users, existingRoles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<PmsUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<PmsUser | null>(null);

    // Password visibility toggles
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Avatar preview & file input refs
    const [createAvatarPreview, setCreateAvatarPreview] = useState<string | null>(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
    const createFileInputRef = useRef<HTMLInputElement | null>(null);
    const editFileInputRef = useRef<HTMLInputElement | null>(null);

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role_title: '',
        phone: '',
        is_admin: false,
        status: 'active',
        avatar: null as File | null,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role_title: '',
        phone: '',
        is_admin: false,
        status: 'active',
        avatar: null as File | null,
    });

    const handleCreateAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran foto maksimal 2MB');
                return;
            }
            createForm.setData('avatar', file);
            if (createAvatarPreview) {
                URL.revokeObjectURL(createAvatarPreview);
            }
            setCreateAvatarPreview(URL.createObjectURL(file));
        }
    };

    const removeCreateAvatar = () => {
        createForm.setData('avatar', null);
        if (createAvatarPreview) {
            URL.revokeObjectURL(createAvatarPreview);
            setCreateAvatarPreview(null);
        }
        if (createFileInputRef.current) {
            createFileInputRef.current.value = '';
        }
    };

    const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran foto maksimal 2MB');
                return;
            }
            editForm.setData('avatar', file);
            if (editAvatarPreview && editAvatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(editAvatarPreview);
            }
            setEditAvatarPreview(URL.createObjectURL(file));
        }
    };

    const removeEditAvatar = () => {
        editForm.setData('avatar', null);
        if (editAvatarPreview && editAvatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(editAvatarPreview);
        }
        setEditAvatarPreview(null);
        if (editFileInputRef.current) {
            editFileInputRef.current.value = '';
        }
    };

    // Auto-search (Debounced live search)
    const isInitialSearchRender = useRef(true);

    useEffect(() => {
        if (isInitialSearchRender.current) {
            isInitialSearchRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/studio/users',
                {
                    search: search || undefined,
                    role: selectedRole !== 'all' ? selectedRole : undefined,
                    status: selectedStatus !== 'all' ? selectedStatus : undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/studio/users',
            {
                search: search || undefined,
                role: selectedRole !== 'all' ? selectedRole : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleRoleChange = (val: string) => {
        setSelectedRole(val);
        router.get(
            '/studio/users',
            {
                search: search || undefined,
                role: val !== 'all' ? val : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleStatusChange = (val: string) => {
        setSelectedStatus(val);
        router.get(
            '/studio/users',
            {
                search: search || undefined,
                role: selectedRole !== 'all' ? selectedRole : undefined,
                status: val !== 'all' ? val : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedRole('all');
        setSelectedStatus('all');
        router.get('/studio/users', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasActiveFilters = Boolean(search || selectedRole !== 'all' || selectedStatus !== 'all');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/studio/users', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Pengguna baru berhasil ditambahkan');
                setIsCreateOpen(false);
                setShowCreatePassword(false);
                createForm.reset();
                if (createAvatarPreview) {
                    URL.revokeObjectURL(createAvatarPreview);
                    setCreateAvatarPreview(null);
                }
                if (createFileInputRef.current) {
                    createFileInputRef.current.value = '';
                }
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] as string || 'Gagal menambahkan pengguna');
            },
        });
    };

    const openEdit = (user: PmsUser) => {
        setEditingUser(user);
        setShowEditPassword(false);
        const avatarUrl = user.avatar
            ? (user.avatar.startsWith('http') ? user.avatar : `/storage/${user.avatar}`)
            : null;
        setEditAvatarPreview(avatarUrl);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role_title: user.role_title || '',
            phone: user.phone || '',
            is_admin: Boolean(user.is_admin),
            status: user.status || 'active',
            avatar: null,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        router.post(`/studio/users/${editingUser.id}`, {
            _method: 'put',
            name: editForm.data.name,
            email: editForm.data.email,
            password: editForm.data.password || undefined,
            role_title: editForm.data.role_title,
            phone: editForm.data.phone,
            is_admin: editForm.data.is_admin ? 1 : 0,
            status: editForm.data.status,
            avatar: editForm.data.avatar,
        }, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Data pengguna berhasil diperbarui');
                setEditingUser(null);
                setShowEditPassword(false);
                if (editAvatarPreview && editAvatarPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(editAvatarPreview);
                }
                setEditAvatarPreview(null);
                if (editFileInputRef.current) {
                    editFileInputRef.current.value = '';
                }
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] as string || 'Gagal memperbarui pengguna');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(`/studio/users/${deletingUser.id}`, {
            onSuccess: () => {
                toast.success('Pengguna berhasil dihapus');
                setDeletingUser(null);
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] as string || 'Gagal menghapus pengguna');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Tim & Pengguna Dinamis', href: '/studio/users' },
            ]}
        >
            <Head title="Manajemen Tim & Pengguna Dinamis - Studio" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header Strip */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                <Users className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Tim & Pengguna Dinamis
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Kelola pengguna, administrator, dan spesialisasi peran tanpa batasan role statis.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/20 gap-2 h-10 px-4"
                    >
                        <UserPlus className="size-4" />
                        Tambah Anggota Tim
                    </Button>
                </div>

                {/* Filter and Search Bar (Live Debounced Auto-Search) */}
                <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, email, atau jabatan dinamis (otomatis)..."
                                    className="pl-9 pr-9 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                                        title="Hapus pencarian"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            <Select
                                value={selectedRole}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger className="w-full md:w-52 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Pilih Spesialisasi" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Peran & Role</SelectItem>
                                    <SelectItem value="admin">Administrator Saja</SelectItem>
                                    {existingRoles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedStatus}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full md:w-44 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResetFilters}
                                    className="h-10 rounded-xl px-3.5 gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border-dashed"
                                    title="Reset semua filter"
                                >
                                    <RotateCcw className="size-3.5" /> Reset
                                </Button>
                            )}

                            <Button type="submit" variant="secondary" className="h-10 rounded-xl px-5 gap-2 font-medium">
                                <Search className="size-4" /> Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Users Table / Grid */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 text-[11px] font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Pengguna & Akun</th>
                                    <th className="py-3.5 px-4">Spesialisasi / Role Title</th>
                                    <th className="py-3.5 px-4">Hak Akses</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Proyek PMS</th>
                                    <th className="py-3.5 px-4">Tugas Aktif</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                            Tidak ada data anggota tim yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-violet-500/[0.02] dark:hover:bg-violet-500/[0.04] transition-colors"
                                        >
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex items-center justify-center shrink-0">
                                                        <div className="size-10 rounded-full p-[1.5px] bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-sm shrink-0">
                                                            <div className="size-full rounded-full bg-white dark:bg-slate-950 p-[1px]">
                                                                <div className="size-full rounded-full overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                                                                    <img
                                                                        src={
                                                                            user.avatar
                                                                                ? (user.avatar.startsWith('http') || user.avatar.startsWith('/')
                                                                                    ? user.avatar
                                                                                    : `/storage/${user.avatar}`)
                                                                                : (user.is_admin || user.email === 'ridhwananang@gmail.com'
                                                                                    ? '/images/me.webp'
                                                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=ffffff&bold=true`)
                                                                        }
                                                                        alt={user.name || 'Avatar'}
                                                                        className="size-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.currentTarget as HTMLImageElement).src = '/images/me.webp';
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {user.status === 'active' && (
                                                            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            {user.name}
                                                            {user.is_admin && (
                                                                <ShieldCheck className="size-3.5 text-violet-500" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Mail className="size-3 text-slate-400" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {user.role_title ? (
                                                    <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 font-medium text-xs">
                                                        {user.role_title}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Belum diisi</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {user.is_admin ? (
                                                    <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 font-semibold text-[11px] gap-1">
                                                        <Shield className="size-3" /> Admin Studio
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-500 text-xs font-medium">Member Tim</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {user.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                        <span className="size-1.5 rounded-full bg-slate-400" />
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                    {user.pms_projects_count ?? 0}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                    {user.assigned_pms_tasks_count ?? 0}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                                        <DropdownMenuItem
                                                            onClick={() => openEdit(user)}
                                                            className="cursor-pointer gap-2 text-xs"
                                                        >
                                                            <UserCheck className="size-3.5 text-blue-500" />
                                                            Edit Data Pengguna
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingUser(user)}
                                                            disabled={user.email === 'ridhwananang@gmail.com'}
                                                            className="cursor-pointer gap-2 text-xs text-rose-600 focus:text-rose-600"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                            Hapus Pengguna
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create User Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="w-full max-w-xl max-h-[88vh] flex flex-col p-0 rounded-3xl border border-slate-200/90 dark:border-violet-500/30 bg-white dark:bg-slate-900 shadow-2xl shadow-violet-500/10 overflow-hidden relative">
                        {/* Header */}
                        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0 relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[11px] font-bold w-fit mb-1.5">
                                <Sparkles className="size-3.5 text-violet-500" />
                                Personnel Orchestration
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="size-5 text-violet-500" />
                                Tambah Anggota Tim Dinamis
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Daftarkan anggota tim baru dengan foto profil ornamen, peran fleksibel, dan hak akses terintegrasi.
                            </DialogDescription>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                                {/* Live Persona Preview Card */}
                                <div className="relative overflow-hidden rounded-2xl border border-violet-200/80 dark:border-violet-500/30 bg-gradient-to-r from-violet-50/90 via-indigo-50/40 to-slate-50 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-slate-900/80 p-4 sm:p-4.5 shadow-sm">
                                    <div className="flex items-center gap-4 sm:gap-5">
                                        {/* Ornamental Circular Avatar with Hover Upload */}
                                        <div
                                            onClick={() => createFileInputRef.current?.click()}
                                            title="Klik untuk memilih foto avatar"
                                            className="relative flex items-center justify-center shrink-0 cursor-pointer group"
                                        >
                                            {/* Glowing Ambient Halo */}
                                            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-cyan-400/30 blur-md pointer-events-none group-hover:scale-110 transition-transform" />

                                            {/* Rotating Celestial Bezel */}
                                            <svg
                                                className="absolute -inset-2.5 size-[calc(100%+20px)] pointer-events-none text-violet-500/60 dark:text-violet-400/70 animate-[spin_40s_linear_infinite]"
                                                viewBox="0 0 100 100"
                                            >
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="46"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                    strokeDasharray="3 5"
                                                />
                                                <polygon points="50,1 53,5 50,9 47,5" fill="currentColor" />
                                                <polygon points="99,50 95,53 91,50 95,47" fill="currentColor" />
                                                <polygon points="50,99 47,95 50,91 53,95" fill="currentColor" />
                                                <polygon points="1,50 5,47 9,50 5,53" fill="currentColor" />
                                            </svg>

                                            {/* Jewelry Ring */}
                                            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(124,58,237,0.35)]">
                                                <div className="p-[2px] rounded-full bg-white dark:bg-slate-950">
                                                    <div className="size-16 sm:size-20 rounded-full overflow-hidden relative bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white shadow-inner">
                                                        {createAvatarPreview ? (
                                                            <img
                                                                src={createAvatarPreview}
                                                                alt="Avatar"
                                                                className="size-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        ) : (
                                                            <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-violet-200 via-white to-cyan-200">
                                                                {createForm.data.name ? createForm.data.name.charAt(0).toUpperCase() : '?'}
                                                            </span>
                                                        )}
                                                        {/* Hover Camera Overlay */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
                                                            <Camera className="size-4" />
                                                            <span>Ubah</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Active Status Beacon */}
                                            <div className="absolute bottom-0 right-0 size-4.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-md shadow-emerald-500/50 flex items-center justify-center">
                                                <span className="size-1.5 rounded-full bg-white animate-ping" />
                                            </div>
                                        </div>

                                        {/* Persona Info & Controls */}
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                                                    {createForm.data.name || 'Nama Personil Baru'}
                                                </h4>
                                                {createForm.data.is_admin && (
                                                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold gap-1">
                                                        <Crown className="size-2.5" /> Admin Studio
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 text-xs font-semibold">
                                                    {createForm.data.role_title || 'Spesialisasi Dinamis'}
                                                </Badge>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                                                    {createForm.data.email || 'email@studio.com'}
                                                </span>
                                            </div>

                                            {/* Upload & Clear Buttons */}
                                            <div className="pt-1 flex flex-wrap items-center gap-2">
                                                <input
                                                    type="file"
                                                    ref={createFileInputRef}
                                                    onChange={handleCreateAvatarChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => createFileInputRef.current?.click()}
                                                    className="h-7.5 rounded-lg px-2.5 gap-1.5 text-xs bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-slate-700 dark:text-slate-200"
                                                >
                                                    <Camera className="size-3.5 text-violet-500" />
                                                    {createAvatarPreview ? 'Ganti Foto' : 'Pilih Foto'}
                                                </Button>

                                                {createAvatarPreview && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={removeCreateAvatar}
                                                        className="h-7.5 rounded-lg px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                                                    >
                                                        <X className="size-3.5" />
                                                        Hapus
                                                    </Button>
                                                )}
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">Maks. 2MB (JPG/PNG/WEBP)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields - 2 Col Responsive Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            Nama Lengkap *
                                        </Label>
                                        <Input
                                            required
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="Contoh: Budi Pratama"
                                            className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            Alamat Email *
                                        </Label>
                                        <Input
                                            required
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            placeholder="budi@example.com"
                                            className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            Password Sementara *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                required
                                                type={showCreatePassword ? 'text' : 'password'}
                                                value={createForm.data.password}
                                                onChange={(e) => createForm.setData('password', e.target.value)}
                                                placeholder="Minimal 8 karakter"
                                                className="rounded-xl h-10 pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreatePassword(!showCreatePassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                                tabIndex={-1}
                                                title={showCreatePassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                            >
                                                {showCreatePassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            No. WhatsApp / HP
                                        </Label>
                                        <Input
                                            value={createForm.data.phone}
                                            onChange={(e) => createForm.setData('phone', e.target.value)}
                                            placeholder="08123456789"
                                            className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Role Title & Quick Selection Chips */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            Spesialisasi / Jabatan Dinamis (Freeform)
                                        </Label>
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Pilih cepat atau ketik bebas</span>
                                    </div>
                                    <Input
                                        value={createForm.data.role_title}
                                        onChange={(e) => createForm.setData('role_title', e.target.value)}
                                        placeholder="Contoh: Senior Fullstack Engineer, Lead UI/UX, Cloud Architect"
                                        className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                    />
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {QUICK_ROLES.map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => createForm.setData('role_title', role)}
                                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                                    createForm.data.role_title === role
                                                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/25 font-semibold'
                                                        : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status & Admin Card Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            Status Akun
                                        </Label>
                                        <Select
                                            value={createForm.data.status}
                                            onValueChange={(val: any) => createForm.setData('status', val)}
                                        >
                                            <SelectTrigger className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="active">
                                                    <span className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-emerald-500" />
                                                        Aktif (Dapat Bertugas)
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    <span className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-slate-400" />
                                                        Nonaktif (Ditangguhkan)
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div
                                        onClick={() => createForm.setData('is_admin', !createForm.data.is_admin)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                            createForm.data.is_admin
                                                ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/40 text-violet-900 dark:text-violet-100 shadow-sm'
                                                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className={`mt-0.5 size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                            createForm.data.is_admin
                                                ? 'bg-violet-600 border-violet-600 text-white'
                                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                        }`}>
                                            {createForm.data.is_admin && <Check className="size-3 stroke-[3]" />}
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <ShieldCheck className="size-3.5 text-violet-500" />
                                                Admin Studio
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                                Akses penuh kelola proyek PMS & tim.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pinned Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 shrink-0 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl h-10 px-4 text-xs font-semibold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/25 h-10 px-5 gap-2 text-xs font-bold"
                                >
                                    <Sparkles className="size-3.5" />
                                    {createForm.processing ? 'Menyimpan Personil...' : 'Simpan Anggota Tim'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent className="w-full max-w-xl max-h-[88vh] flex flex-col p-0 rounded-3xl border border-slate-200/90 dark:border-violet-500/30 bg-white dark:bg-slate-900 shadow-2xl shadow-violet-500/10 overflow-hidden relative">
                        {/* Header */}
                        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0 relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[11px] font-bold w-fit mb-1.5">
                                <Sparkles className="size-3.5 text-violet-500" />
                                Edit Personnel Profile
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="size-5 text-violet-500" />
                                Edit Profil Anggota Tim
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Perbarui informasi profil, ganti foto avatar ornamen, ubah jabatan dinamis, atau atur ulang password.
                            </DialogDescription>
                        </div>

                        {editingUser && (
                            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 min-h-0">
                                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                                    {/* Live Persona Preview Card */}
                                    <div className="relative overflow-hidden rounded-2xl border border-violet-200/80 dark:border-violet-500/30 bg-gradient-to-r from-violet-50/90 via-indigo-50/40 to-slate-50 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-slate-900/80 p-4 sm:p-4.5 shadow-sm">
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            {/* Ornamental Circular Avatar with Hover Upload */}
                                            <div
                                                onClick={() => editFileInputRef.current?.click()}
                                                title="Klik untuk memilih foto avatar baru"
                                                className="relative flex items-center justify-center shrink-0 cursor-pointer group"
                                            >
                                                {/* Glowing Ambient Halo */}
                                                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-cyan-400/30 blur-md pointer-events-none group-hover:scale-110 transition-transform" />

                                                {/* Rotating Celestial Bezel */}
                                                <svg
                                                    className="absolute -inset-2.5 size-[calc(100%+20px)] pointer-events-none text-violet-500/60 dark:text-violet-400/70 animate-[spin_40s_linear_infinite]"
                                                    viewBox="0 0 100 100"
                                                >
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="46"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1"
                                                        strokeDasharray="3 5"
                                                    />
                                                    <polygon points="50,1 53,5 50,9 47,5" fill="currentColor" />
                                                    <polygon points="99,50 95,53 91,50 95,47" fill="currentColor" />
                                                    <polygon points="50,99 47,95 50,91 53,95" fill="currentColor" />
                                                    <polygon points="1,50 5,47 9,50 5,53" fill="currentColor" />
                                                </svg>

                                                {/* Jewelry Ring */}
                                                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(124,58,237,0.35)]">
                                                    <div className="p-[2px] rounded-full bg-white dark:bg-slate-950">
                                                        <div className="size-16 sm:size-20 rounded-full overflow-hidden relative bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white shadow-inner">
                                                            {editAvatarPreview ? (
                                                                <img
                                                                    src={editAvatarPreview}
                                                                    alt="Avatar"
                                                                    className="size-full object-cover group-hover:scale-105 transition-transform"
                                                                />
                                                            ) : (
                                                                <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-violet-200 via-white to-cyan-200">
                                                                    {editForm.data.name ? editForm.data.name.charAt(0).toUpperCase() : '?'}
                                                                </span>
                                                            )}
                                                            {/* Hover Camera Overlay */}
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
                                                                <Camera className="size-4" />
                                                                <span>Ubah</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Active Status Beacon */}
                                                <div className="absolute bottom-0 right-0 size-4.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-md shadow-emerald-500/50 flex items-center justify-center">
                                                    <span className="size-1.5 rounded-full bg-white animate-ping" />
                                                </div>
                                            </div>

                                            {/* Persona Info & Controls */}
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                                                        {editForm.data.name || 'Nama Personil'}
                                                    </h4>
                                                    {editForm.data.is_admin && (
                                                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold gap-1">
                                                            <Crown className="size-2.5" /> Admin Studio
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 text-xs font-semibold">
                                                        {editForm.data.role_title || 'Spesialisasi Dinamis'}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                                                        {editForm.data.email || 'email@studio.com'}
                                                    </span>
                                                </div>

                                                {/* Upload & Clear Buttons */}
                                                <div className="pt-1 flex flex-wrap items-center gap-2">
                                                    <input
                                                        type="file"
                                                        ref={editFileInputRef}
                                                        onChange={handleEditAvatarChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => editFileInputRef.current?.click()}
                                                        className="h-7.5 rounded-lg px-2.5 gap-1.5 text-xs bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 text-slate-700 dark:text-slate-200"
                                                    >
                                                        <Camera className="size-3.5 text-violet-500" />
                                                        {editAvatarPreview ? 'Ganti Foto' : 'Pilih Foto'}
                                                    </Button>

                                                    {editAvatarPreview && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={removeEditAvatar}
                                                            className="h-7.5 rounded-lg px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1"
                                                        >
                                                            <X className="size-3.5" />
                                                            Hapus
                                                        </Button>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Maks. 2MB (JPG/PNG/WEBP)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields - 2 Col Responsive Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Nama Lengkap *
                                            </Label>
                                            <Input
                                                required
                                                value={editForm.data.name}
                                                onChange={(e) => editForm.setData('name', e.target.value)}
                                                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Alamat Email *
                                            </Label>
                                            <Input
                                                required
                                                type="email"
                                                value={editForm.data.email}
                                                onChange={(e) => editForm.setData('email', e.target.value)}
                                                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Reset Password (Opsional)
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type={showEditPassword ? 'text' : 'password'}
                                                    value={editForm.data.password}
                                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                                    placeholder="Kosongkan jika tidak diubah"
                                                    className="rounded-xl h-10 pr-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                                    tabIndex={-1}
                                                    title={showEditPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                                >
                                                    {showEditPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                No. WhatsApp / HP
                                            </Label>
                                            <Input
                                                value={editForm.data.phone}
                                                onChange={(e) => editForm.setData('phone', e.target.value)}
                                                placeholder="08123456789"
                                                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Role Title & Quick Selection Chips */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Spesialisasi / Jabatan Dinamis (Freeform)
                                            </Label>
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">Pilih cepat atau ketik bebas</span>
                                        </div>
                                        <Input
                                            value={editForm.data.role_title}
                                            onChange={(e) => editForm.setData('role_title', e.target.value)}
                                            placeholder="Contoh: Senior Fullstack Engineer, Lead UI/UX, QA Tester"
                                            className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-950 focus:border-violet-500"
                                        />
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {QUICK_ROLES.map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => editForm.setData('role_title', role)}
                                                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                                        editForm.data.role_title === role
                                                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/25 font-semibold'
                                                            : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80'
                                                    }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status & Admin Card Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Status Akun
                                            </Label>
                                            <Select
                                                value={editForm.data.status}
                                                onValueChange={(val: any) => editForm.setData('status', val)}
                                            >
                                                <SelectTrigger className="rounded-xl h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="active">
                                                        <span className="flex items-center gap-2">
                                                            <span className="size-2 rounded-full bg-emerald-500" />
                                                            Aktif (Dapat Bertugas)
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        <span className="flex items-center gap-2">
                                                            <span className="size-2 rounded-full bg-slate-400" />
                                                            Nonaktif (Ditangguhkan)
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {editingUser.email !== 'ridhwananang@gmail.com' ? (
                                            <div
                                                onClick={() => editForm.setData('is_admin', !editForm.data.is_admin)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                                    editForm.data.is_admin
                                                        ? 'bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/40 text-violet-900 dark:text-violet-100 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <div className={`mt-0.5 size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                                    editForm.data.is_admin
                                                        ? 'bg-violet-600 border-violet-600 text-white'
                                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                                }`}>
                                                    {editForm.data.is_admin && <Check className="size-3 stroke-[3]" />}
                                                </div>
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <ShieldCheck className="size-3.5 text-violet-500" />
                                                        Admin Studio
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                                        Akses penuh kelola proyek PMS & tim.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300">
                                                <ShieldCheck className="size-4 shrink-0 text-violet-500" />
                                                <span>Akun Utama Pemilik Studio (Hak Akses Permanen)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pinned Modal Footer */}
                                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 shrink-0 flex items-center justify-end gap-2.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingUser(null)}
                                        className="rounded-xl h-10 px-4 text-xs font-semibold"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/25 h-10 px-5 gap-2 text-xs font-bold"
                                    >
                                        <Sparkles className="size-3.5" />
                                        {editForm.processing ? 'Menyimpan...' : 'Perbarui Pengguna'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
                    <DialogContent className="max-w-sm rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600">
                                Hapus Anggota Tim?
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Akun <strong>{deletingUser?.name}</strong> ({deletingUser?.email}) akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button variant="outline" onClick={() => setDeletingUser(null)} className="rounded-xl">
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                Ya, Hapus Pengguna
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
