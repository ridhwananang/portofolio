import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { WordRichEditor } from '@/components/ui/word-rich-editor';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Code2,
    Coins,
    DollarSign,
    FileCode,
    Flame,
    GitBranch,
    Globe,
    Layers,
    ListChecks,
    Plus,
    Rocket,
    Save,
    Shield,
    Sparkles,
    Target,
    Trash2,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';

interface AvailableUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role_title?: string;
}

interface EligibleOrder {
    id: number;
    tracking_code: string;
    client_name: string;
    project_type: string;
    total_amount: number | string;
    status: string;
    selected_features?: string[];
    client_brief?: any;
    staging_url?: string;
}

interface Props {
    availableUsers: AvailableUser[];
    eligibleOrders: EligibleOrder[];
    proposedCode: string;
}

interface MemberRow {
    user_id: number | '';
    role_in_project: string;
    hours_per_week: number;
}

const COMMON_TECH_STACKS = [
    'Laravel 13',
    'React 19',
    'TypeScript',
    'Tailwind CSS v4',
    'PostgreSQL',
    'MySQL',
    'Inertia.js',
    'Redis',
    'Docker',
    'Next.js',
    'Vue.js',
    'Node.js',
    'Python',
    'Flutter',
    'AWS / Cloud',
    'Supabase',
    'GraphQL',
    'REST API',
];

export default function PmsProjectCreate({
    availableUsers,
    eligibleOrders,
    proposedCode,
}: Props) {
    const [techInput, setTechInput] = useState('');
    const [selectedTab, setSelectedTab] = useState<
        'info' | 'blueprint' | 'team' | 'sprint'
    >('info');

    const form = useForm({
        name: '',
        code: proposedCode || '',
        client: '',
        description: '',
        budget: '',
        status: 'planning',
        priority: 'medium',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        project_order_id: '' as number | string,
        // Blueprint Details
        background: '',
        objective: '',
        scope: '',
        tech_stack: [
            'Laravel 13',
            'React 19',
            'TypeScript',
            'Tailwind CSS v4',
            'PostgreSQL',
        ] as string[],
        deliverables: '',
        repository_url: '',
        live_demo_url: '',
        notes: '',
        // Initial Dynamic Members
        members: [] as MemberRow[],
        // Optional Sprint 1
        create_initial_sprint: true,
        initial_sprint_name: 'Sprint 1 - Foundation & Core Architecture',
        initial_sprint_goal:
            'Setup arsitektur basis data, scaffolding modul dasar, dan integrasi repositori.',
        initial_sprint_start_date: new Date().toISOString().split('T')[0],
        initial_sprint_end_date: new Date(Date.now() + 14 * 86400000)
            .toISOString()
            .split('T')[0],
    });

    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val) || 0);
    };

    const addTechStack = (tech: string) => {
        const clean = tech.trim();
        if (clean && !form.data.tech_stack.includes(clean)) {
            form.setData('tech_stack', [...form.data.tech_stack, clean]);
        }
    };

    const removeTechStack = (tech: string) => {
        form.setData(
            'tech_stack',
            form.data.tech_stack.filter((t) => t !== tech),
        );
    };

    const addMemberRow = () => {
        const available = availableUsers.find(
            (u) => !form.data.members.some((m) => m.user_id === u.id),
        );
        form.setData('members', [
            ...form.data.members,
            {
                user_id: available
                    ? available.id
                    : (availableUsers[0]?.id ?? ''),
                role_in_project: available?.role_title || 'Core Engineer',
                hours_per_week: 40,
            },
        ]);
    };

    const removeMemberRow = (index: number) => {
        form.setData(
            'members',
            form.data.members.filter((_, i) => i !== index),
        );
    };

    const updateMemberRow = (
        index: number,
        field: keyof MemberRow,
        value: any,
    ) => {
        const updated = [...form.data.members];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('members', updated);
    };

    const handleOrderSelect = (orderId: string) => {
        form.setData('project_order_id', orderId);
        if (!orderId) return;

        const order = eligibleOrders.find((o) => o.id === Number(orderId));
        if (order) {
            form.setData((prev) => ({
                ...prev,
                project_order_id: order.id,
                name:
                    prev.name || `${order.project_type} - ${order.client_name}`,
                client: prev.client || order.client_name,
                budget: prev.budget || order.total_amount.toString(),
                description:
                    prev.description ||
                    (typeof order.client_brief === 'object'
                        ? JSON.stringify(order.client_brief, null, 2)
                        : `Order Klien #${order.tracking_code}`),
                live_demo_url: prev.live_demo_url || order.staging_url || '',
                tech_stack:
                    Array.isArray(order.selected_features) &&
                    order.selected_features.length > 0
                        ? Array.from(
                              new Set([
                                  ...prev.tech_stack,
                                  ...order.selected_features,
                              ]),
                          )
                        : prev.tech_stack,
            }));
            toast.info(
                `Data otomatis disinkronkan dari Order #${order.tracking_code}!`,
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/studio/pms/projects', {
            onSuccess: () => {
                toast.success('Proyek PMS lengkap berhasil diinisialisasi!');
            },
            onError: (err) => {
                const firstErr = Object.values(err)[0] as string;
                toast.error(firstErr || 'Mohon lengkapi seluruh isian wajib.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Manajemen Proyek', href: '/studio/pms/projects' },
                {
                    title: 'Inisialisasi Proyek Baru',
                    href: '/studio/pms/projects/create',
                },
            ]}
        >
            <Head title="Inisialisasi Proyek Lengkap - Studio PMS" />

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-6xl space-y-8 px-4 py-6 pb-10 sm:px-6 lg:px-8"
            >
                {/* 1. Header Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-cyan-500/15 p-6 shadow-xl backdrop-blur-2xl md:p-8 dark:border-slate-800">
                    <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <Link
                                href="/studio/pms/projects"
                                className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
                            >
                                <ArrowLeft className="size-3.5" />
                                Kembali ke Daftar Proyek
                            </Link>
                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                                <Sparkles className="size-3.5 text-violet-500" />
                                Dedicated Project Provisioning Studio
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                                Inisialisasi Proyek Lengkap & Terstruktur
                            </h1>
                            <p className="max-w-3xl text-sm text-slate-600 md:text-base dark:text-slate-300">
                                Konfigurasikan identitas proyek, rencana
                                anggaran, cetak biru arsitektur teknis, alokasi
                                tim dinamis, serta iterasi sprint pertama secara
                                komprehensif dalam satu workspace.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge className="border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                Kode: {form.data.code || 'Auto-generated'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Tab Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/60 p-1.5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60">
                    <button
                        type="button"
                        onClick={() => setSelectedTab('info')}
                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                            selectedTab === 'info'
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Briefcase className="size-4" />
                        1. Informasi & Anggaran
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('blueprint')}
                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                            selectedTab === 'blueprint'
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Layers className="size-4" />
                        2. Cetak Biru Teknis & Scope
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('team')}
                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                            selectedTab === 'team'
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Users className="size-4" />
                        3. Alokasi Tim ({form.data.members.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('sprint')}
                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                            selectedTab === 'sprint'
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Zap className="size-4" />
                        4. Inisialisasi Sprint 1
                    </button>
                </div>

                {/* TAB 1: INFORMASI & ANGGARAN */}
                {selectedTab === 'info' && (
                    <div className="space-y-6">
                        {/* Sinkronisasi Order Klien (Opsional) */}
                        {eligibleOrders.length > 0 && (
                            <Card className="rounded-3xl border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
                                        <Rocket className="size-4" />
                                        Bridge Pesanan Klien Publik
                                    </div>
                                    <CardTitle className="text-lg">
                                        Tautkan dengan Pesanan Portal Layanan
                                        (Opsional)
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Pilih pesanan yang telah dikonfirmasi
                                        untuk mengisi rincian proyek secara
                                        otomatis.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                                        <select
                                            value={form.data.project_order_id}
                                            onChange={(e) =>
                                                handleOrderSelect(
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <option value="">
                                                -- Proyek Baru Mandiri (Tanpa
                                                Order Portal) --
                                            </option>
                                            {eligibleOrders.map((ord) => (
                                                <option
                                                    key={ord.id}
                                                    value={ord.id}
                                                >
                                                    #{ord.tracking_code} •{' '}
                                                    {ord.client_name} •{' '}
                                                    {ord.project_type} (
                                                    {formatCurrency(
                                                        ord.total_amount,
                                                    )}
                                                    )
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Identitas Proyek */}
                        <Card className="rounded-3xl border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Briefcase className="size-5 text-violet-500" />
                                    Identitas Utama Proyek
                                </CardTitle>
                                <CardDescription>
                                    Informasi umum, kode registrasi, klien
                                    pemesan, dan ringkasan eksekutif.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Nama Proyek{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            value={form.data.name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Enterprise ERP & Warehouse System"
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                        {form.errors.name && (
                                            <p className="text-xs text-rose-500">
                                                {form.errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Kode Unik Proyek{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            value={form.data.code}
                                            onChange={(e) =>
                                                form.setData(
                                                    'code',
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="PRJ-2026-001"
                                            className="h-11 rounded-xl font-mono font-bold uppercase"
                                            required
                                        />
                                        {form.errors.code && (
                                            <p className="text-xs text-rose-500">
                                                {form.errors.code}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Nama Klien / Lembaga / Perusahaan{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            value={form.data.client}
                                            onChange={(e) =>
                                                form.setData(
                                                    'client',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: PT Surya Logistik Global"
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                        {form.errors.client && (
                                            <p className="text-xs text-rose-500">
                                                {form.errors.client}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Estimasi Total Anggaran (IDR)
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-slate-400">
                                                Rp
                                            </span>
                                            <Input
                                                type="number"
                                                value={form.data.budget}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'budget',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="50000000"
                                                className="h-11 rounded-xl pl-10"
                                            />
                                        </div>
                                        {form.data.budget && (
                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                Terkonversi:{' '}
                                                {formatCurrency(
                                                    form.data.budget,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <FileCode className="size-4 text-violet-500" />
                                            Ringkasan Eksekutif & Deskripsi
                                            Singkat
                                        </Label>
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {form.data.description.length}{' '}
                                            karakter •{' '}
                                            {form.data.description.trim()
                                                ? form.data.description
                                                      .trim()
                                                      .split(/\s+/).length
                                                : 0}{' '}
                                            kata
                                        </span>
                                    </div>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={9}
                                        placeholder="Tuliskan gambaran umum solusi yang dibangun, latar belakang kebutuhan klien, arsitektur operasional, target pengguna, serta nilai bisnis utama secara komprehensif..."
                                        className="min-h-[220px] w-full resize-y rounded-2xl border border-slate-300 bg-white/80 px-4 py-3.5 text-sm leading-relaxed transition-all outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900/80"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status, Prioritas, & Linimasa */}
                        <Card className="rounded-3xl border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Clock className="size-5 text-indigo-500" />
                                    Parameter Status, Prioritas & Jadwal
                                </CardTitle>
                                <CardDescription>
                                    Tentukan fase awal siklus hidup proyek dan
                                    tanggal target penyelesaian.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Status Proyek Awal
                                        </Label>
                                        <select
                                            value={form.data.status}
                                            onChange={(e) =>
                                                form.setData(
                                                    'status',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <option value="planning">
                                                📋 Planning (Perencanaan)
                                            </option>
                                            <option value="in_progress">
                                                ⚡ In Progress (Sedang
                                                Dikerjakan)
                                            </option>
                                            <option value="review">
                                                🔍 In Review (Uji Kelayakan)
                                            </option>
                                            <option value="completed">
                                                ✅ Completed (Selesai)
                                            </option>
                                            <option value="on_hold">
                                                ⏸️ On Hold (Ditunda)
                                            </option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Tingkat Prioritas
                                        </Label>
                                        <select
                                            value={form.data.priority}
                                            onChange={(e) =>
                                                form.setData(
                                                    'priority',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <option value="low">
                                                🟢 Low (Rendah)
                                            </option>
                                            <option value="medium">
                                                🟡 Medium (Normal)
                                            </option>
                                            <option value="high">
                                                🟠 High (Tinggi)
                                            </option>
                                            <option value="urgent">
                                                🔴 Urgent (Kritis / Prioritas
                                                Utama)
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Tanggal Kick-off / Mulai
                                        </Label>
                                        <Input
                                            type="date"
                                            value={form.data.start_date}
                                            onChange={(e) =>
                                                form.setData(
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-11 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Target Tenggat Waktu (Deadline)
                                        </Label>
                                        <Input
                                            type="date"
                                            value={form.data.end_date}
                                            onChange={(e) =>
                                                form.setData(
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-11 rounded-xl"
                                        />
                                        {form.errors.end_date && (
                                            <p className="text-xs text-rose-500">
                                                {form.errors.end_date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 2: CETAK BIRU TEKNIS & SCOPE */}
                {selectedTab === 'blueprint' && (
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Layers className="size-5 text-cyan-500" />
                                    Cetak Biru Teknis & Arsitektur Solusi
                                </CardTitle>
                                <CardDescription>
                                    Definisikan sasaran teknis, batasan ruang
                                    lingkup, dan repositori pengembangan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 1. Sasaran Utama (Objectives) */}
                                <div className="space-y-2">
                                    <WordRichEditor
                                        value={form.data.objective}
                                        onChange={(val) => form.setData('objective', val)}
                                        label="Sasaran Utama & Key Results (Objectives)"
                                        placeholder="Contoh: Mempercepat waktu pemrosesan transaksi hingga 60%, menyediakan dasbor analitik real-time, memenuhi standar audit ISO-27001, serta menyederhanakan alur onboarding pengguna baru..."
                                        minHeight="220px"
                                        presetType="objective"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Gunakan tombol "Template Word" untuk menyusun struktur OKR dan matriks capaian standar secara otomatis.
                                    </p>
                                </div>

                                {/* 2. Ruang Lingkup Kerja (Scope of Work) */}
                                <div className="space-y-2">
                                    <WordRichEditor
                                        value={form.data.scope}
                                        onChange={(val) => form.setData('scope', val)}
                                        label="Ruang Lingkup Kerja (Scope of Work)"
                                        placeholder="Tuliskan modul yang termasuk (in-scope) seperti API Gateway, sistem autentikasi, serta batasan yang berada di luar kesepakatan (out-of-scope)..."
                                        minHeight="220px"
                                        presetType="scope"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Mendukung checklist tugas interaktif, tabel modul, dan batasan in-scope vs out-of-scope.
                                    </p>
                                </div>

                                {/* 3. Latar Belakang Proyek */}
                                <div className="space-y-2">
                                    <WordRichEditor
                                        value={form.data.background}
                                        onChange={(val) => form.setData('background', val)}
                                        label="Latar Belakang Proyek & Masalah Bisnis"
                                        placeholder="Konteks industri, arsitektur sistem sebelumnya (legacy), titik hambatan operasional, atau alasan strategis inisiasi proyek ini..."
                                        minHeight="200px"
                                        presetType="background"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Tuliskan narasi masalah bisnis dengan kutipan (quote), daftar poin hambatan, dan ekspektasi nilai solusi.
                                    </p>
                                </div>

                                {/* Tech Stack Selector */}
                                <div className="space-y-3 pt-2">
                                    <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <Code2 className="size-4 text-emerald-500" />
                                        Teknologi & Framework Utama (Tech Stack)
                                    </Label>

                                    {/* Active Tags */}
                                    <div className="flex min-h-[50px] flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                                        {form.data.tech_stack.length === 0 && (
                                            <span className="text-xs text-slate-400">
                                                Belum ada teknologi dipilih.
                                                Pilih rekomendasi di bawah atau
                                                ketik kustom.
                                            </span>
                                        )}
                                        {form.data.tech_stack.map((tech) => (
                                            <Badge
                                                key={tech}
                                                className="gap-1.5 border-violet-500/20 bg-violet-600/10 px-3 py-1 text-xs text-violet-700 dark:text-violet-300"
                                            >
                                                {tech}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeTechStack(tech)
                                                    }
                                                    className="ml-1 cursor-pointer font-bold hover:text-rose-500"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Custom Tag Input */}
                                    <div className="flex gap-2">
                                        <Input
                                            value={techInput}
                                            onChange={(e) =>
                                                setTechInput(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTechStack(techInput);
                                                    setTechInput('');
                                                }
                                            }}
                                            placeholder="Ketik teknologi kustom lalu tekan Enter..."
                                            className="h-10 rounded-xl text-xs"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                addTechStack(techInput);
                                                setTechInput('');
                                            }}
                                            variant="outline"
                                            className="h-10 rounded-xl px-4 text-xs font-semibold"
                                        >
                                            Tambah
                                        </Button>
                                    </div>

                                    {/* Quick Presets */}
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-semibold text-slate-400">
                                            Rekomendasi Cepat:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {COMMON_TECH_STACKS.map((stack) => (
                                                <button
                                                    key={stack}
                                                    type="button"
                                                    onClick={() =>
                                                        addTechStack(stack)
                                                    }
                                                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] transition-all ${
                                                        form.data.tech_stack.includes(
                                                            stack,
                                                        )
                                                            ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300'
                                                            : 'border-slate-200 bg-white/50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                                                    }`}
                                                >
                                                    + {stack}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Luaran & Deliverables */}
                                <div className="space-y-2">
                                    <WordRichEditor
                                        value={form.data.deliverables}
                                        onChange={(val) => form.setData('deliverables', val)}
                                        label="Luaran & Deliverables yang Diserahkan"
                                        placeholder="Contoh: Source code Git lengkap dengan unit testing, dokumen arsitektur dan ERD sistem, konfigurasi Docker compose, panduan deployment production, serta sesi knowledge transfer dan panduan admin..."
                                        minHeight="220px"
                                        presetType="deliverables"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Sertakan checklist serah terima item produk, format dokumen serah terima, dan matriks verifikasi luaran.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <GitBranch className="size-4 text-slate-500" />
                                            Tautan Repositori Git
                                        </Label>
                                        <Input
                                            value={form.data.repository_url}
                                            onChange={(e) =>
                                                form.setData(
                                                    'repository_url',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://github.com/organization/repo-name"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                            <Globe className="size-4 text-cyan-500" />
                                            Tautan Demo / Staging / Live
                                        </Label>
                                        <Input
                                            value={form.data.live_demo_url}
                                            onChange={(e) =>
                                                form.setData(
                                                    'live_demo_url',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://staging.domainproyek.com"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* 5. Catatan Teknis Tambahan */}
                                <div className="space-y-2">
                                    <WordRichEditor
                                        value={form.data.notes}
                                        onChange={(val) => form.setData('notes', val)}
                                        label="Catatan Teknis Tambahan / Instruksi Khusus"
                                        placeholder="Konvensi Git branch, parameter kredensial staging rahasia, instruksi pipeline CI/CD, atau prasyarat infrastruktur cloud khusus..."
                                        minHeight="200px"
                                        presetType="notes"
                                    />
                                    <p className="text-[11px] text-slate-400">
                                        Catatan konvensi repositori, environment variables penting, konfigurasi server staging, dan instruksi tim.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TAB 3: ALOKASI TIM DINAMIS */}
                {selectedTab === 'team' && (
                    <Card className="rounded-3xl border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
                        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Users className="size-5 text-indigo-500" />
                                    Alokasi Anggota Tim Proyek (100% Dinamis)
                                </CardTitle>
                                <CardDescription>
                                    Tentukan personil yang bertanggung jawab dan
                                    perannya dalam proyek ini secara bebas tanpa
                                    batasan enum.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                onClick={addMemberRow}
                                className="h-10 shrink-0 gap-2 rounded-xl bg-violet-600 px-4 text-white hover:bg-violet-700"
                            >
                                <Plus className="size-4" />
                                Tambah Personil Tim
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.data.members.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-200 p-6 py-12 text-center dark:border-slate-800">
                                    <UserCheck className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-700" />
                                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                                        Belum Ada Anggota Ditugaskan
                                    </h4>
                                    <p className="mx-auto mt-1 mb-4 max-w-md text-xs text-slate-500">
                                        Anda dapat menambahkan anggota tim
                                        sekarang atau menugaskannya nanti
                                        melalui tab Tim di dalam workspace
                                        proyek.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addMemberRow}
                                        variant="outline"
                                        className="gap-2 rounded-xl text-xs"
                                    >
                                        <Plus className="size-3.5" />
                                        Tugaskan Anggota Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.data.members.map((member, idx) => {
                                        const selectedU = availableUsers.find((u) => u.id === Number(member.user_id)) || availableUsers[0];
                                        return (
                                        <div
                                            key={idx}
                                            className="dark:bg-slate-850/90 flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xs sm:flex-row sm:items-center dark:border-slate-800"
                                        >
                                            {/* Circular Ornamental Framed Avatar */}
                                            <div className="relative flex items-center justify-center shrink-0">
                                                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-sm shadow-violet-500/30">
                                                    <div className="p-[1.5px] rounded-full bg-white dark:bg-slate-900">
                                                        <div className="size-10 rounded-full overflow-hidden bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                                            {selectedU?.avatar ? (
                                                                <img
                                                                    src={
                                                                        selectedU.avatar.startsWith('http')
                                                                            ? selectedU.avatar
                                                                            : `/storage/${selectedU.avatar}`
                                                                    }
                                                                    alt={selectedU.name}
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                selectedU?.name?.charAt(0).toUpperCase() || '?'
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Pilih User
                                                </Label>
                                                <select
                                                    value={member.user_id}
                                                    onChange={(e) =>
                                                        updateMemberRow(
                                                            idx,
                                                            'user_id',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                                                >
                                                    {availableUsers.map((u) => (
                                                        <option
                                                            key={u.id}
                                                            value={u.id}
                                                        >
                                                            {u.name} (
                                                            {u.role_title ||
                                                                'Anggota'}
                                                            ) • {u.email}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Peran Dalam Proyek (Dinamis)
                                                </Label>
                                                <Input
                                                    value={
                                                        member.role_in_project
                                                    }
                                                    onChange={(e) =>
                                                        updateMemberRow(
                                                            idx,
                                                            'role_in_project',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Lead Architect / UI Designer"
                                                    className="h-9 rounded-xl text-xs"
                                                    required
                                                />
                                            </div>

                                            <div className="w-full space-y-1 sm:w-32">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                                    Jam/Minggu
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="168"
                                                    value={
                                                        member.hours_per_week
                                                    }
                                                    onChange={(e) =>
                                                        updateMemberRow(
                                                            idx,
                                                            'hours_per_week',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="h-9 rounded-xl text-xs"
                                                />
                                            </div>

                                            <div className="sm:pt-4">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        removeMemberRow(idx)
                                                    }
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl text-slate-400 hover:text-rose-500"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ); })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* TAB 4: INISIALISASI SPRINT 1 */}
                {selectedTab === 'sprint' && (
                    <Card className="rounded-3xl border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Zap className="size-5 text-amber-500" />
                                    Inisialisasi Siklus Sprint Pertama
                                </CardTitle>
                                <label className="flex cursor-pointer items-center gap-2 select-none">
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.data.create_initial_sprint
                                        }
                                        onChange={(e) =>
                                            form.setData(
                                                'create_initial_sprint',
                                                e.target.checked,
                                            )
                                        }
                                        className="size-4 rounded text-violet-600 focus:ring-violet-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Buat Sprint 1 Otomatis
                                    </span>
                                </label>
                            </div>
                            <CardDescription>
                                Memulai siklus kerja pertama secara langsung
                                agar papan Kanban siap diisi tiket tugas begitu
                                proyek dibuat.
                            </CardDescription>
                        </CardHeader>
                        {form.data.create_initial_sprint && (
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider uppercase">
                                        Nama Sprint 1
                                    </Label>
                                    <Input
                                        value={form.data.initial_sprint_name}
                                        onChange={(e) =>
                                            form.setData(
                                                'initial_sprint_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Sprint 1 - Scaffolding & Setup"
                                        className="h-11 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider uppercase">
                                        Sasaran / Goal Sprint
                                    </Label>
                                    <textarea
                                        value={form.data.initial_sprint_goal}
                                        onChange={(e) =>
                                            form.setData(
                                                'initial_sprint_goal',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        placeholder="Apa target utama yang harus selesai pada sprint ini..."
                                        className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-900/80"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Tanggal Mulai Sprint
                                        </Label>
                                        <Input
                                            type="date"
                                            value={
                                                form.data
                                                    .initial_sprint_start_date
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'initial_sprint_start_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-11 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Tanggal Selesai Sprint
                                        </Label>
                                        <Input
                                            type="date"
                                            value={
                                                form.data
                                                    .initial_sprint_end_date
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'initial_sprint_end_date',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* 3. Sticky Bottom Action Deck */}
                <div className="sticky bottom-4 z-20 mt-8 w-full min-w-0">
                    <div className="flex flex-col-reverse items-stretch justify-between gap-3.5 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl sm:flex-row sm:items-center sm:p-4 dark:border-slate-800/90 dark:bg-slate-900/95 dark:shadow-black/50">
                        <div className="flex items-center justify-between gap-3 sm:justify-start">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="h-10 sm:h-11 gap-2 rounded-xl border-slate-300 bg-white text-slate-800 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
                            >
                                <Link href="/studio/pms/projects">
                                    <ArrowLeft className="size-4" />
                                    Batal & Kembali
                                </Link>
                            </Button>
                            <span className="truncate max-w-[170px] sm:max-w-xs text-xs font-medium text-slate-500 dark:text-slate-400">
                                {form.data.name ? (
                                    <span className="inline-flex items-center gap-1.5 truncate">
                                        <span className="size-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
                                        <span className="truncate text-slate-800 dark:text-slate-200 font-semibold">Draft: {form.data.name}</span>
                                    </span>
                                ) : (
                                    'Draft: Inisialisasi Proyek Baru'
                                )}
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 sm:gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => form.reset()}
                                className="h-10 sm:h-11 rounded-xl px-3 sm:px-4 text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                            >
                                Reset Isian
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-10 sm:h-11 flex-1 sm:flex-initial gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-4 sm:px-6 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-cyan-700 transition-all hover:shadow-violet-500/40 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="size-4" />
                                {form.processing
                                    ? 'Menyimpan & Menginisialisasi...'
                                    : 'Inisialisasi Proyek Lengkap'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
