import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Calendar,
    Check,
    Clock,
    Code2,
    FileCode,
    GitBranch,
    Globe,
    Layers,
    Plus,
    Rocket,
    RotateCcw,
    Save,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WordRichEditor } from '@/components/ui/word-rich-editor';
import AppLayout from '@/layouts/app-layout';

interface AvailableUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role_title?: string;
    is_admin?: boolean;
}

interface EligibleOrder {
    id: number;
    tracking_code: string;
    client_name: string;
    project_type: string;
    total_amount: number | string;
    status: string;
    selected_features?: string[];
    client_brief?: unknown;
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

type CreateTabKey = 'info' | 'blueprint' | 'team' | 'sprint';

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

const BUDGET_PRESETS = [
    { label: 'Internal (Rp 0)', value: '0' },
    { label: 'Rp 5 Jt', value: '5000000' },
    { label: 'Rp 15 Jt', value: '15000000' },
    { label: 'Rp 25 Jt', value: '25000000' },
    { label: 'Rp 50 Jt', value: '50000000' },
];

const STATUS_OPTIONS = [
    {
        value: 'planning',
        label: 'Planning',
        sub: 'Perencanaan awal',
        dot: 'bg-slate-400',
        activeCls:
            'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30',
    },
    {
        value: 'in_progress',
        label: 'In Progress',
        sub: 'Langsung dikerjakan',
        dot: 'bg-sky-500',
        activeCls:
            'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30',
    },
    {
        value: 'review',
        label: 'Review / QA',
        sub: 'Uji kelayakan',
        dot: 'bg-amber-500',
        activeCls:
            'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30',
    },
    {
        value: 'completed',
        label: 'Completed',
        sub: 'Sudah selesai',
        dot: 'bg-emerald-500',
        activeCls:
            'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30',
    },
    {
        value: 'on_hold',
        label: 'On Hold',
        sub: 'Ditunda sementara',
        dot: 'bg-rose-500',
        activeCls:
            'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30',
    },
] as const;

const PRIORITY_OPTIONS = [
    {
        value: 'low',
        label: 'Low',
        sub: 'Santai',
        dot: 'bg-emerald-500',
        activeCls:
            'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
        value: 'medium',
        label: 'Medium',
        sub: 'Normal',
        dot: 'bg-amber-400',
        activeCls:
            'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    {
        value: 'high',
        label: 'High',
        sub: 'Tinggi',
        dot: 'bg-orange-500',
        activeCls:
            'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    },
    {
        value: 'urgent',
        label: 'Urgent',
        sub: 'Kritis',
        dot: 'bg-rose-500',
        activeCls:
            'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    },
] as const;

const COMMON_MEMBER_ROLES = [
    'Lead Architect',
    'Fullstack Developer',
    'Frontend Specialist',
    'Backend Engineer',
    'UI/UX Designer',
    'QA Tester',
];

function computeDaySpan(start?: string, end?: string): number | null {
    if (!start || !end) {
        return null;
    }

    const s = new Date(`${start}T00:00:00`);
    const e = new Date(`${end}T00:00:00`);
    const diff = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;

    return diff > 0 ? diff : null;
}

export default function PmsProjectCreate({
    availableUsers,
    eligibleOrders,
    proposedCode,
}: Props) {
    const [techInput, setTechInput] = useState('');
    const [selectedTab, setSelectedTab] = useState<CreateTabKey>('info');

    // Pure initial date calculation for React Compiler compliance
    const [initialDates] = useState(() => {
        const now = new Date();
        const twoWeeks = new Date(now.getTime() + 14 * 86400000);

        return {
            today: now.toISOString().split('T')[0],
            twoWeeks: twoWeeks.toISOString().split('T')[0],
        };
    });

    const form = useForm({
        name: '',
        code: proposedCode || '',
        client: '',
        description: '',
        budget: '',
        status: 'planning',
        priority: 'medium',
        start_date: initialDates.today,
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
        initial_sprint_start_date: initialDates.today,
        initial_sprint_end_date: initialDates.twoWeeks,
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
        value: string | number,
    ) => {
        const updated = [...form.data.members];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('members', updated);
    };

    const handleOrderSelect = (orderId: string) => {
        form.setData('project_order_id', orderId);

        if (!orderId) {
            return;
        }

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
                    (typeof order.client_brief === 'object' &&
                    order.client_brief !== null
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

        // Guard hidden-tab required fields before posting
        if (
            !form.data.name.trim() ||
            !form.data.code.trim() ||
            !form.data.client.trim()
        ) {
            setSelectedTab('info');
            toast.error(
                'Nama Proyek, Kode Proyek, dan Nama Klien wajib diisi di Langkah 1.',
            );

            return;
        }

        form.post('/studio/pms/projects', {
            onSuccess: () => {
                toast.success('Proyek PMS lengkap berhasil diinisialisasi!');
            },
            onError: (err) => {
                const keys = Object.keys(err);

                if (
                    keys.some(
                        (k) => k === 'repository_url' || k === 'live_demo_url',
                    )
                ) {
                    setSelectedTab('blueprint');
                } else if (keys.some((k) => k.startsWith('members'))) {
                    setSelectedTab('team');
                } else {
                    setSelectedTab('info');
                }

                const firstErr = Object.values(err)[0] as string;
                toast.error(firstErr || 'Mohon lengkapi seluruh isian wajib.');
            },
        });
    };

    const projectDurationDays = useMemo(
        () => computeDaySpan(form.data.start_date, form.data.end_date),
        [form.data.start_date, form.data.end_date],
    );

    const sprintDurationDays = useMemo(
        () =>
            computeDaySpan(
                form.data.initial_sprint_start_date,
                form.data.initial_sprint_end_date,
            ),
        [
            form.data.initial_sprint_start_date,
            form.data.initial_sprint_end_date,
        ],
    );

    const infoReady =
        Boolean(form.data.name.trim()) &&
        Boolean(form.data.code.trim()) &&
        Boolean(form.data.client.trim());
    const blueprintReady =
        Boolean(form.data.objective.trim()) ||
        Boolean(form.data.scope.trim()) ||
        Boolean(form.data.deliverables.trim());
    const teamReady = form.data.members.length > 0;
    const sprintReady =
        !form.data.create_initial_sprint ||
        Boolean(form.data.initial_sprint_name.trim());

    const steps: {
        key: CreateTabKey;
        num: number;
        title: string;
        icon: React.ReactNode;
        ready: boolean;
        badge?: string | number;
    }[] = [
        {
            key: 'info',
            num: 1,
            title: 'Informasi & Anggaran',
            icon: <Briefcase className="size-4" />,
            ready: infoReady,
        },
        {
            key: 'blueprint',
            num: 2,
            title: 'Cetak Biru & Scope',
            icon: <Layers className="size-4" />,
            ready: blueprintReady,
        },
        {
            key: 'team',
            num: 3,
            title: 'Alokasi Tim',
            icon: <Users className="size-4" />,
            ready: teamReady,
            badge: form.data.members.length,
        },
        {
            key: 'sprint',
            num: 4,
            title: 'Inisialisasi Sprint 1',
            icon: <Zap className="size-4" />,
            ready: sprintReady,
        },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === selectedTab);
    const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
    const nextStep =
        currentStepIndex < steps.length - 1
            ? steps[currentStepIndex + 1]
            : null;

    const switchTabSmooth = (tab: CreateTabKey) => {
        setSelectedTab(tab);

        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const resolveMemberAvatar = (u?: AvailableUser) => {
        if (u?.avatar) {
            if (u.avatar.startsWith('http') || u.avatar.startsWith('/')) {
                return u.avatar;
            }

            return `/storage/${u.avatar}`;
        }

        if (u?.is_admin || u?.email === 'ridhwananang@gmail.com') {
            return '/images/me.webp';
        }

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'User')}&background=6366f1&color=ffffff&bold=true`;
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
                noValidate
                className="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-4 sm:px-6 lg:px-8"
            >
                {/* 1. LUXURY HERO BANNER */}
                <div className="luxury-card relative overflow-hidden rounded-3xl p-6 md:p-8">
                    <div className="specular-top" />
                    <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-cyan-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2.5">
                            <Link
                                href="/studio/pms/projects"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
                            >
                                <ArrowLeft className="size-3.5" />
                                Kembali ke Daftar Proyek
                            </Link>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                                    <Sparkles className="size-3.5 text-violet-500" />
                                    Dedicated Project Provisioning Studio
                                </span>
                                <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                    {form.data.code || 'AUTO-CODE'}
                                </span>
                            </div>
                            <h1 className="font-[family-name:var(--font-brand)] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                                Inisialisasi Proyek Lengkap &amp; Terstruktur
                            </h1>
                            <p className="max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                Konfigurasikan identitas proyek, rencana
                                anggaran, cetak biru teknis ala dokumen Word,
                                alokasi tim dinamis, dan siklus Sprint 1 dalam
                                satu alur wizard terpadu.
                            </p>
                        </div>

                        {/* Live Step Readiness Mini Widget */}
                        <div className="shrink-0 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 md:w-60 dark:border-slate-800 dark:bg-[#080f20]/90">
                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                Kesiapan Inisialisasi
                            </span>
                            <div className="mt-1.5 flex items-baseline justify-between">
                                <strong className="font-[family-name:var(--font-brand)] text-lg font-extrabold text-slate-900 tabular-nums dark:text-white">
                                    {steps.filter((s) => s.ready).length} / 4
                                    Bagian
                                </strong>
                                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                    {infoReady
                                        ? 'Siap Simpan'
                                        : 'Isi Info Wajib'}
                                </span>
                            </div>
                            <div className="mt-2 flex gap-1">
                                {steps.map((st) => (
                                    <div
                                        key={st.key}
                                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                                            st.ready
                                                ? 'bg-gradient-to-r from-violet-600 to-emerald-500'
                                                : 'bg-slate-200 dark:bg-slate-800'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. INTERACTIVE 4-STEP WIZARD STEPPER */}
                <nav
                    aria-label="Tahapan Inisialisasi Proyek"
                    className="luxury-card flex scrollbar-none items-center gap-1.5 overflow-x-auto rounded-2xl p-1.5"
                >
                    {steps.map((step) => {
                        const isActive = selectedTab === step.key;

                        return (
                            <button
                                key={step.key}
                                type="button"
                                onClick={() => setSelectedTab(step.key)}
                                className={`flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all sm:text-sm ${
                                    isActive
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25'
                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white'
                                }`}
                            >
                                <span
                                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                                        isActive
                                            ? 'bg-white/25 text-white'
                                            : step.ready
                                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                              : 'bg-slate-200/80 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {step.ready && !isActive ? (
                                        <Check className="size-3" />
                                    ) : (
                                        step.num
                                    )}
                                </span>
                                {step.icon}
                                <span>{step.title}</span>
                                {step.badge !== undefined && (
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none tabular-nums ${
                                            isActive
                                                ? 'bg-white/25 text-white'
                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        {step.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* ========================================================= */}
                {/* TAB 1: INFORMASI & ANGGARAN                               */}
                {/* ========================================================= */}
                {selectedTab === 'info' && (
                    <div className="animate-in space-y-6 duration-200 fade-in-0">
                        {eligibleOrders.length > 0 && (
                            <div className="luxury-card relative overflow-hidden rounded-3xl border-violet-500/30 p-6">
                                <div className="specular-top" />
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
                                        <Rocket className="size-4" />
                                        Bridge Pesanan Klien Publik (Opsional)
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Pilih pesanan portal layanan yang sudah
                                        dikonfirmasi untuk mengisi detail proyek
                                        otomatis.
                                    </p>
                                    <select
                                        value={form.data.project_order_id}
                                        onChange={(e) =>
                                            handleOrderSelect(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-[#0c152a] dark:text-slate-100"
                                    >
                                        <option value="">
                                            -- Proyek Baru Mandiri (Tanpa Order
                                            Portal) --
                                        </option>
                                        {eligibleOrders.map((ord) => (
                                            <option key={ord.id} value={ord.id}>
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
                            </div>
                        )}

                        {/* Identitas Proyek */}
                        <div className="luxury-card relative space-y-6 rounded-3xl p-6 sm:p-7">
                            <div className="specular-top" />
                            <div>
                                <h2 className="flex items-center gap-2.5 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                                    <span className="flex size-8 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                        <Briefcase className="size-4" />
                                    </span>
                                    Identitas Utama Proyek
                                </h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Informasi umum, kode registrasi, identitas
                                    klien pemesan, estimasi anggaran, serta
                                    ringkasan eksekutif.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-bold tracking-wider uppercase">
                                        Nama Proyek{' '}
                                        <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Contoh: IkhsanTani POS & Inventory System"
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
                                    />
                                    {form.errors.name && (
                                        <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                                            <AlertCircle className="size-3.5" />
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider uppercase">
                                        Kode Unik Proyek{' '}
                                        <span className="text-rose-500">*</span>
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
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 font-mono font-bold uppercase dark:border-slate-800 dark:bg-[#080f20]"
                                    />
                                    {form.errors.code && (
                                        <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                                            <AlertCircle className="size-3.5" />
                                            {form.errors.code}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold tracking-wider uppercase">
                                        Nama Klien / Lembaga / Perusahaan{' '}
                                        <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        value={form.data.client}
                                        onChange={(e) =>
                                            form.setData(
                                                'client',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Toko Obat Tanaman Ikhsan Tani"
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
                                    />
                                    {form.errors.client && (
                                        <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                                            <AlertCircle className="size-3.5" />
                                            {form.errors.client}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Estimasi Anggaran (IDR)
                                        </Label>
                                        {form.data.budget && (
                                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(
                                                    form.data.budget,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            Rp
                                        </span>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={form.data.budget}
                                            onChange={(e) =>
                                                form.setData(
                                                    'budget',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/70 pl-10 tabular-nums dark:border-slate-800 dark:bg-[#080f20]"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {BUDGET_PRESETS.map((bp) => (
                                            <button
                                                key={bp.label}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'budget',
                                                        bp.value,
                                                    )
                                                }
                                                className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[10.5px] font-semibold transition-colors ${
                                                    form.data.budget ===
                                                    bp.value
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-400'
                                                }`}
                                            >
                                                {bp.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <FileCode className="size-4 text-violet-500" />
                                        Ringkasan Eksekutif &amp; Deskripsi
                                        Singkat
                                    </Label>
                                    <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                                        {form.data.description.length} karakter
                                        •{' '}
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
                                    rows={7}
                                    placeholder="Tuliskan gambaran umum solusi yang dibangun, latar belakang kebutuhan klien, serta nilai bisnis utama..."
                                    className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm leading-relaxed text-slate-900 transition-all outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-100"
                                />
                                <p className="text-[11px] text-slate-400">
                                    Tip: Gunakan <code>**kata tebal**</code>{' '}
                                    untuk menyorot kata kunci penting (otomatis
                                    diformat rapi di Portal Klien).
                                </p>
                            </div>
                        </div>

                        {/* Status, Prioritas & Linimasa */}
                        <div className="luxury-card relative space-y-6 rounded-3xl p-6 sm:p-7">
                            <div className="specular-top" />
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="flex items-center gap-2.5 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <Clock className="size-4" />
                                        </span>
                                        Status, Prioritas &amp; Jadwal Proyek
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Pilih fase awal, tingkat urgensi, serta
                                        tanggal mulai &amp; target rilis proyek.
                                    </p>
                                </div>
                                {projectDurationDays && (
                                    <Badge className="border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
                                        Durasi Target: {projectDurationDays}{' '}
                                        Hari Kalender
                                    </Badge>
                                )}
                            </div>

                            {/* Visual Status Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Status Proyek Awal
                                </Label>
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                                    {STATUS_OPTIONS.map((opt) => {
                                        const active =
                                            form.data.status === opt.value;

                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'status',
                                                        opt.value,
                                                    )
                                                }
                                                className={`cursor-pointer rounded-2xl border p-3 text-left transition-all ${
                                                    active
                                                        ? opt.activeCls
                                                        : 'border-slate-200/90 bg-slate-50/70 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`size-2 rounded-full ${opt.dot}`}
                                                    />
                                                    <span className="text-xs font-bold">
                                                        {opt.label}
                                                    </span>
                                                </div>
                                                <span className="mt-1 block text-[10.5px] opacity-75">
                                                    {opt.sub}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Visual Priority Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Tingkat Prioritas
                                </Label>
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                    {PRIORITY_OPTIONS.map((opt) => {
                                        const active =
                                            form.data.priority === opt.value;

                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'priority',
                                                        opt.value,
                                                    )
                                                }
                                                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition-all ${
                                                    active
                                                        ? opt.activeCls
                                                        : 'border-slate-200/90 bg-slate-50/70 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`size-2.5 rounded-full ${opt.dot}`}
                                                    />
                                                    <span className="text-xs font-bold">
                                                        {opt.label}
                                                    </span>
                                                </div>
                                                <span className="text-[10.5px] opacity-75">
                                                    {opt.sub}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Schedule Dates */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <Calendar className="size-3.5 text-violet-500" />
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
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <Calendar className="size-3.5 text-sky-500" />
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
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
                                    />
                                    {form.errors.end_date && (
                                        <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                                            <AlertCircle className="size-3.5" />
                                            {form.errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: CETAK BIRU TEKNIS & SCOPE                          */}
                {/* ========================================================= */}
                {selectedTab === 'blueprint' && (
                    <div className="animate-in space-y-6 duration-200 fade-in-0">
                        <div className="luxury-card relative space-y-7 rounded-3xl p-6 sm:p-7">
                            <div className="specular-top" />
                            <div>
                                <h2 className="flex items-center gap-2.5 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                                    <span className="flex size-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                        <Layers className="size-4" />
                                    </span>
                                    Cetak Biru Teknis &amp; Arsitektur Solusi
                                </h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Gunakan bilah{' '}
                                    <strong>Sisipkan Cepat</strong> di setiap
                                    editor untuk membuat blok pernyataan, daftar
                                    poin/checklist, maupun tabel dinamis secara
                                    instan.
                                </p>
                            </div>

                            {/* Repository & Live Demo URLs */}
                            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 md:grid-cols-2 dark:border-slate-800 dark:bg-[#080f20]/70">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                        <GitBranch className="size-4 text-violet-500" />
                                        Tautan Repositori Git (Internal)
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
                                        className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                                    />
                                    {form.errors.repository_url && (
                                        <p className="text-xs text-rose-500">
                                            {form.errors.repository_url}
                                        </p>
                                    )}
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
                                        className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                                    />
                                    {form.errors.live_demo_url && (
                                        <p className="text-xs text-rose-500">
                                            {form.errors.live_demo_url}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 1. Objective */}
                            <div className="space-y-2">
                                <WordRichEditor
                                    value={form.data.objective}
                                    onChange={(val) =>
                                        form.setData('objective', val)
                                    }
                                    label="1. Sasaran Utama & Key Results (Objectives)"
                                    placeholder="Tuliskan sasaran strategis, key results, atau gunakan Sisipkan Cepat..."
                                    minHeight="210px"
                                    presetType="objective"
                                />
                            </div>

                            {/* 2. Scope */}
                            <div className="space-y-2">
                                <WordRichEditor
                                    value={form.data.scope}
                                    onChange={(val) =>
                                        form.setData('scope', val)
                                    }
                                    label="2. Ruang Lingkup Kerja (Scope of Work)"
                                    placeholder="Rincikan modul In-Scope, batasan Out-of-Scope, dan asumsi teknis..."
                                    minHeight="210px"
                                    presetType="scope"
                                />
                            </div>

                            {/* 3. Background */}
                            <div className="space-y-2">
                                <WordRichEditor
                                    value={form.data.background}
                                    onChange={(val) =>
                                        form.setData('background', val)
                                    }
                                    label="3. Latar Belakang Proyek & Masalah Bisnis"
                                    placeholder="Jelaskan konteks permasalahan saat ini, pain points, dan ekspektasi solusi..."
                                    minHeight="190px"
                                    presetType="background"
                                />
                            </div>

                            {/* Tech Stack Selector */}
                            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-[#080f20]/70">
                                <Label className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                                    <Code2 className="size-4 text-emerald-500" />
                                    Teknologi &amp; Framework Utama (
                                    {form.data.tech_stack.length})
                                </Label>

                                <div className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    {form.data.tech_stack.length === 0 && (
                                        <span className="text-xs text-slate-400">
                                            Belum ada teknologi dipilih. Klik
                                            preset di bawah atau ketik kustom.
                                        </span>
                                    )}
                                    {form.data.tech_stack.map((tech) => (
                                        <Badge
                                            key={tech}
                                            className="gap-1.5 border-violet-500/20 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300"
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
                                        className="h-10 rounded-xl bg-white text-xs dark:bg-slate-900"
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

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {COMMON_TECH_STACKS.map((stack) => (
                                        <button
                                            key={stack}
                                            type="button"
                                            onClick={() => addTechStack(stack)}
                                            className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                                                form.data.tech_stack.includes(
                                                    stack,
                                                )
                                                    ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                                            }`}
                                        >
                                            + {stack}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Deliverables */}
                            <div className="space-y-2">
                                <WordRichEditor
                                    value={form.data.deliverables}
                                    onChange={(val) =>
                                        form.setData('deliverables', val)
                                    }
                                    label="4. Luaran & Deliverables yang Diserahkan"
                                    placeholder="Daftar paket hasil akhir yang diserahkan kepada klien..."
                                    minHeight="210px"
                                    presetType="deliverables"
                                />
                            </div>

                            {/* 5. Internal Technical Notes */}
                            <div className="space-y-2">
                                <WordRichEditor
                                    value={form.data.notes}
                                    onChange={(val) =>
                                        form.setData('notes', val)
                                    }
                                    label="5. Catatan Teknis Internal Tim"
                                    placeholder="Konvensi branch, parameter server staging, serta catatan khusus untuk tim teknis..."
                                    minHeight="190px"
                                    presetType="notes"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: ALOKASI TIM DINAMIS                                */}
                {/* ========================================================= */}
                {selectedTab === 'team' && (
                    <div className="animate-in space-y-6 duration-200 fade-in-0">
                        <div className="luxury-card relative space-y-6 rounded-3xl p-6 sm:p-7">
                            <div className="specular-top" />
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2.5 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <Users className="size-4" />
                                        </span>
                                        Alokasi Anggota Tim Proyek
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Tugaskan personil beserta peran khusus
                                        dalam proyek ini secara fleksibel.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={addMemberRow}
                                    className="h-10 shrink-0 cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-sm"
                                >
                                    <Plus className="size-4" />
                                    Tambah Personil Tim
                                </Button>
                            </div>

                            {form.data.members.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 py-14 text-center dark:border-slate-800 dark:bg-[#080f20]/40">
                                    <UserCheck className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-700" />
                                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                                        Belum Ada Anggota Ditugaskan
                                    </h3>
                                    <p className="mx-auto mt-1 mb-5 max-w-md text-xs text-slate-500 dark:text-slate-400">
                                        Anda dapat menugaskan tim sekarang atau
                                        mengaturnya nanti melalui tab Tim &amp;
                                        Anggota di dalam workspace proyek.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addMemberRow}
                                        variant="outline"
                                        className="cursor-pointer gap-2 rounded-xl text-xs font-semibold"
                                    >
                                        <Plus className="size-3.5" />
                                        Tugaskan Anggota Pertama
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.data.members.map((member, idx) => {
                                        const selectedU =
                                            availableUsers.find(
                                                (u) =>
                                                    u.id ===
                                                    Number(member.user_id),
                                            ) || availableUsers[0];

                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 shadow-2xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-[#080f20]"
                                            >
                                                <div className="relative flex shrink-0 items-center justify-center">
                                                    <div className="relative rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[2px] shadow-sm">
                                                        <div className="rounded-full bg-white p-[1.5px] dark:bg-[#080f20]">
                                                            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                                                                <img
                                                                    src={resolveMemberAvatar(
                                                                        selectedU,
                                                                    )}
                                                                    alt={
                                                                        selectedU?.name ||
                                                                        'Avatar'
                                                                    }
                                                                    className="size-full object-cover"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        (
                                                                            e.currentTarget as HTMLImageElement
                                                                        ).src =
                                                                            '/images/me.webp';
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                                        Pilih Personil
                                                    </Label>
                                                    <select
                                                        value={member.user_id}
                                                        onChange={(e) =>
                                                            updateMemberRow(
                                                                idx,
                                                                'user_id',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                                    >
                                                        {availableUsers.map(
                                                            (u) => (
                                                                <option
                                                                    key={u.id}
                                                                    value={u.id}
                                                                >
                                                                    {u.name} (
                                                                    {u.role_title ||
                                                                        'Anggota'}
                                                                    ) •{' '}
                                                                    {u.email}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                                        Peran Dalam Proyek
                                                    </Label>
                                                    <Input
                                                        list={`role-presets-${idx}`}
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
                                                        placeholder="Contoh: Lead Architect"
                                                        className="h-9 rounded-xl bg-white text-xs dark:bg-slate-900"
                                                    />
                                                    <datalist
                                                        id={`role-presets-${idx}`}
                                                    >
                                                        {COMMON_MEMBER_ROLES.map(
                                                            (r) => (
                                                                <option
                                                                    key={r}
                                                                    value={r}
                                                                />
                                                            ),
                                                        )}
                                                    </datalist>
                                                </div>

                                                <div className="w-full space-y-1 sm:w-28">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase">
                                                        Jam / Minggu
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
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="h-9 rounded-xl bg-white text-xs dark:bg-slate-900"
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
                                                        className="cursor-pointer rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 4: INISIALISASI SPRINT 1                              */}
                {/* ========================================================= */}
                {selectedTab === 'sprint' && (
                    <div className="animate-in space-y-6 duration-200 fade-in-0">
                        <div className="luxury-card relative space-y-6 rounded-3xl p-6 sm:p-7">
                            <div className="specular-top" />
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="flex items-center gap-2.5 font-[family-name:var(--font-brand)] text-lg font-bold text-slate-900 dark:text-white">
                                        <span className="flex size-8 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
                                            <Zap className="size-4" />
                                        </span>
                                        Inisialisasi Siklus Sprint Pertama
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Memulai fase kerja pertama agar papan
                                        Kanban &amp; Timeline Gantt siap
                                        digunakan begitu proyek disimpan.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {sprintDurationDays &&
                                        form.data.create_initial_sprint && (
                                            <Badge className="border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                                                {sprintDurationDays} Hari
                                            </Badge>
                                        )}
                                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 select-none dark:border-slate-800 dark:bg-[#080f20]">
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
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Buat Sprint 1 Otomatis
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {form.data.create_initial_sprint ? (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Nama Sprint 1
                                        </Label>
                                        <Input
                                            value={
                                                form.data.initial_sprint_name
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'initial_sprint_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Sprint 1 - Foundation & Core Architecture"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold tracking-wider uppercase">
                                            Sasaran / Goal Sprint
                                        </Label>
                                        <textarea
                                            value={
                                                form.data.initial_sprint_goal
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'initial_sprint_goal',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="Target utama yang harus tercapai pada akhir Sprint 1..."
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-[#080f20] dark:text-slate-100"
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
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
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
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#080f20]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#080f20]/40 dark:text-slate-400">
                                    Sprint 1 dilewati saat inisialisasi. Anda
                                    tetap dapat membuat siklus sprint kapan saja
                                    setelah proyek terbentuk.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. UNIFIED STICKY GLASS ACTION DOCK */}
                <div className="sticky bottom-2 z-20 mt-2 w-full min-w-0">
                    <div className="glass-panel flex flex-col gap-3 rounded-2xl p-3 shadow-xl shadow-slate-900/10 md:flex-row md:items-center md:justify-between md:px-4 md:py-3 dark:shadow-black/60">
                        {/* Left: Cancel + Step & Draft Context */}
                        <div className="flex items-center justify-between gap-3 md:justify-start">
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="h-9.5 cursor-pointer gap-1.5 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <Link href="/studio/pms/projects">
                                    <ArrowLeft className="size-3.5" />
                                    <span>Batal</span>
                                </Link>
                            </Button>

                            <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-800" />

                            <div className="flex min-w-0 items-center gap-2 text-xs">
                                <span className="shrink-0 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10.5px] font-bold text-violet-700 dark:text-violet-300">
                                    Langkah {currentStepIndex + 1}/
                                    {steps.length}
                                </span>
                                <span className="max-w-[160px] truncate font-medium text-slate-500 sm:max-w-[220px] dark:text-slate-400">
                                    {form.data.name ? (
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {form.data.name}
                                        </span>
                                    ) : (
                                        'Draft Proyek Baru'
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Right: Reset, Prev/Next Wizard, & Primary Submit */}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => form.reset()}
                                title="Kosongkan ulang seluruh form"
                                className="h-9.5 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                <RotateCcw className="size-3.5" />
                                <span className="hidden sm:inline">Reset</span>
                            </Button>

                            {prevStep && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        switchTabSmooth(prevStep.key)
                                    }
                                    className="h-9.5 cursor-pointer gap-1.5 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <ArrowLeft className="size-3.5" />
                                    <span className="hidden sm:inline">
                                        Sebelumnya
                                    </span>
                                </Button>
                            )}

                            {nextStep && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        switchTabSmooth(nextStep.key)
                                    }
                                    className="h-9.5 cursor-pointer gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                >
                                    <span>Lanjut</span>
                                    <ArrowRight className="size-3.5" />
                                </Button>
                            )}

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-9.5 flex-1 cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-4 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-cyan-700 hover:shadow-violet-500/40 active:scale-[0.99] disabled:opacity-50 sm:flex-initial sm:px-5"
                            >
                                <Save className="size-3.5" />
                                <span>
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : 'Inisialisasi Proyek'}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
