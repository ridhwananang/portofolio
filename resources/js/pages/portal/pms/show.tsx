import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Eye,
    EyeOff,
    FileText,
    KeyRound,
    ListTodo,
    Moon,
    Paperclip,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sun,
    User,
    Users,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { PortalGanttTimeline } from '@/components/portal/pms/portal-gantt-timeline';
import {
    PortalAttachmentsModule,
    PortalBlueprintModule,
    PortalReportsModule,
    PortalSprintsModule,
    PortalTasksModule,
    PortalTeamModule,
} from '@/components/portal/pms/portal-modules';
import type {
    ClientMetrics,
    ClientProject,
    PortalTabKey,
} from '@/components/portal/pms/portal-types';
import {
    CircularProgressRing,
    formatDate,
    getPriorityMeta,
    getScheduleHealth,
    getStatusMeta,
    renderFormattedText,
} from '@/components/portal/pms/portal-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppearance } from '@/hooks/use-appearance';
import type { PmsTimelineItem } from '@/types/pms';

interface Props {
    is_deactivated?: boolean;
    requires_pin?: boolean;
    is_verified?: boolean;
    token: string;
    timelineData?: PmsTimelineItem[];
    project_summary?: {
        name: string;
        code: string;
        client: string;
    };
    project?: ClientProject;
    metrics?: ClientMetrics;
}

const VALID_TABS: PortalTabKey[] = [
    'blueprint',
    'sprints',
    'tasks',
    'reports',
    'team',
    'attachments',
    'timeline',
];

function getInitialTab(): PortalTabKey {
    if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace('#', '') as PortalTabKey;

        if (VALID_TABS.includes(hash)) {
            return hash;
        }
    }

    return 'sprints';
}

export default function PmsClientPortalShow({
    is_deactivated = false,
    requires_pin = false,
    is_verified = false,
    token,
    timelineData = [],
    project_summary,
    project,
    metrics,
}: Props) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const toggleTheme = () => updateAppearance(isDark ? 'light' : 'dark');

    const [activeTab, setActiveTabState] =
        useState<PortalTabKey>(getInitialTab);
    const [selectedSprintFilter, setSelectedSprintFilter] = useState<
        number | 'all'
    >('all');
    const [copiedSummary, setCopiedSummary] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [showPinValue, setShowPinValue] = useState(false);

    const setActiveTab = (tab: PortalTabKey) => {
        setActiveTabState(tab);

        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${tab}`);
        }
    };

    const handleOpenSprintTasks = (sprintId: number) => {
        setSelectedSprintFilter(sprintId);
        setActiveTab('tasks');
    };

    const pinForm = useForm({
        pin: '',
    });

    const handleVerifyPin = (e: React.FormEvent) => {
        e.preventDefault();
        pinForm.post(`/portal/${token}/verify-pin`, {
            preserveScroll: true,
            onError: () => {
                toast.error('PIN akses tidak valid. Silakan coba lagi.');
            },
            onSuccess: () => {
                toast.success(
                    'PIN terverifikasi! Selamat datang di Ruang Pantau Proyek.',
                );
            },
        });
    };

    const copyProjectProgress = () => {
        if (!project || !metrics) {
            return;
        }

        const text = `📊 LAPORAN PROGRES PROYEK (${project.name})
Kode Proyek   : ${project.code}
Klien         : ${project.client}
Status        : ${project.status.toUpperCase()}
Total Progres : ${project.progress_percentage}% (${metrics.done_tasks}/${metrics.total_tasks} Tugas Selesai)
Subtask Lolos : ${metrics.done_subtasks}/${metrics.total_subtasks} (${metrics.subtask_percentage}%)
Target Rilis  : ${formatDate(project.end_date)}
Tautan Portal : ${window.location.href}

Dikelola secara profesional oleh Ridhwan Studio.`;

        navigator.clipboard.writeText(text);
        setCopiedSummary(true);
        toast.success('Ringkasan progres berhasil disalin!');
        setTimeout(() => setCopiedSummary(false), 2500);
    };

    /* ---------------------------------------------------------------------- */
    /* CASE 1: DEACTIVATED PORTAL                                             */
    /* ---------------------------------------------------------------------- */
    if (is_deactivated) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] p-4 text-slate-800 transition-colors duration-200 dark:bg-[#050814] dark:text-slate-100">
                <Head title="Akses Portal Dinonaktifkan - Ridhwan Studio" />

                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
                    <div className="absolute -top-32 left-1/3 size-[28rem] rounded-full bg-amber-500/10 blur-[130px]" />
                    <div className="absolute right-1/4 bottom-0 size-[24rem] rounded-full bg-violet-500/10 blur-[130px]" />
                </div>

                <div className="fixed top-4 right-4 z-20">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        aria-label={
                            isDark
                                ? 'Ganti ke Tema Terang'
                                : 'Ganti ke Tema Gelap'
                        }
                        className="size-9 cursor-pointer rounded-xl border-slate-200 bg-white/80 p-0 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80"
                    >
                        {isDark ? (
                            <Sun className="size-4 text-amber-400" />
                        ) : (
                            <Moon className="size-4 text-slate-600" />
                        )}
                    </Button>
                </div>

                <div className="luxury-card relative z-10 w-full max-w-md space-y-5 rounded-3xl p-7 text-center sm:p-9">
                    <div className="specular-top" />
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-inner">
                        <ShieldAlert className="size-8" />
                    </div>
                    <div className="space-y-2">
                        {project_summary && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {project_summary.code} • {project_summary.name}
                            </span>
                        )}
                        <h1 className="pt-1 font-[family-name:var(--font-brand)] text-xl font-extrabold text-slate-900 dark:text-white">
                            Akses Portal Dinonaktifkan
                        </h1>
                        <p className="text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                            Tautan ruang pantau proyek ini sedang dinonaktifkan
                            sementara oleh manajer proyek untuk pembaruan atau
                            peninjauan internal.
                        </p>
                    </div>
                    <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
                        <Button
                            asChild
                            className="h-10.5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:from-violet-700 hover:to-indigo-700"
                        >
                            <a href="mailto:contact@ridhwananang.id">
                                Hubungi Ridhwan Studio
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* CASE 2: REQUIRES PIN VERIFICATION                                      */
    /* ---------------------------------------------------------------------- */
    if (requires_pin && !is_verified) {
        return (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] p-4 text-slate-800 transition-colors duration-200 dark:bg-[#050814] dark:text-slate-100">
                <Head
                    title={`Verifikasi PIN Akses - ${project_summary?.name ?? 'Portal Proyek'}`}
                />

                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
                    <div className="absolute -top-32 left-1/3 size-[30rem] rounded-full bg-violet-500/12 blur-[140px] dark:bg-violet-600/15" />
                    <div className="absolute -right-24 bottom-0 size-[28rem] rounded-full bg-amber-500/8 blur-[140px] dark:bg-sky-500/10" />
                </div>

                <div className="fixed top-4 right-4 z-20">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        aria-label={
                            isDark
                                ? 'Ganti ke Tema Terang'
                                : 'Ganti ke Tema Gelap'
                        }
                        className="size-9 cursor-pointer rounded-xl border-slate-200 bg-white/80 p-0 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80"
                    >
                        {isDark ? (
                            <Sun className="size-4 text-amber-400" />
                        ) : (
                            <Moon className="size-4 text-slate-600" />
                        )}
                    </Button>
                </div>

                <div className="luxury-card relative z-10 w-full max-w-md space-y-6 rounded-3xl p-7 sm:p-9">
                    <div className="specular-top" />

                    <div className="space-y-2.5 text-center">
                        <div className="mx-auto flex size-15 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-violet-500 text-white shadow-lg shadow-violet-600/25">
                            <KeyRound className="size-7" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10.5px] font-bold text-violet-700 dark:text-violet-300">
                            <ShieldCheck className="size-3.5 text-violet-500" />
                            Portal Pantau Proyek
                        </div>
                        <h1 className="pt-1 font-[family-name:var(--font-brand)] text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
                            Masukkan PIN Akses
                        </h1>
                        <p className="px-1 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                            Masukkan PIN keamanan untuk membuka ruang pantau
                            proyek{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                                &ldquo;{project_summary?.name}&rdquo;
                            </strong>
                            .
                        </p>
                        {project_summary && (
                            <div className="flex items-center justify-center gap-2 pt-1 text-[10.5px] text-slate-400">
                                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                                    {project_summary.code}
                                </span>
                                <span>•</span>
                                <span>{project_summary.client}</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleVerifyPin} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="portal-pin-input"
                                className="block text-center text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                            >
                                PIN Keamanan Klien
                            </label>
                            <div className="relative">
                                <Input
                                    id="portal-pin-input"
                                    type={showPinValue ? 'text' : 'password'}
                                    autoFocus
                                    required
                                    maxLength={20}
                                    placeholder="••••••"
                                    value={pinForm.data.pin}
                                    onChange={(e) =>
                                        pinForm.setData('pin', e.target.value)
                                    }
                                    className="h-12.5 rounded-2xl border-slate-200 bg-slate-50 px-10 text-center font-mono text-xl tracking-[0.35em] text-slate-900 dark:border-slate-800 dark:bg-[#070c1b] dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPinValue(!showPinValue)
                                    }
                                    aria-label={
                                        showPinValue
                                            ? 'Sembunyikan PIN'
                                            : 'Tampilkan PIN'
                                    }
                                    className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPinValue ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                            {pinForm.errors.pin && (
                                <div className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                                    <AlertCircle className="size-3.5 shrink-0" />
                                    <span>{pinForm.errors.pin}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={pinForm.processing || !pinForm.data.pin}
                            className="h-11.5 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-700 hover:to-indigo-700"
                        >
                            {pinForm.processing
                                ? 'Memverifikasi Akses...'
                                : 'Buka Ruang Pantau Proyek'}
                        </Button>
                    </form>

                    <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 dark:border-slate-800/80">
                        <Shield className="size-3.5 text-violet-500" />
                        <span>Dilindungi Perjanjian Kerahasiaan (NDA)</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!project || !metrics) {
        return null;
    }

    const projectStatus = getStatusMeta(project.status);
    const projectPriority = getPriorityMeta(project.priority);
    const scheduleHealth = getScheduleHealth(project.end_date, project.status);
    const hasTechStack =
        Array.isArray(project.detail?.tech_stack) &&
        project.detail.tech_stack.length > 0;

    const healthToneClasses: Record<string, string> = {
        emerald:
            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
        sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
        amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
        rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
        slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/25',
    };

    const totalAttachmentsCount = project.attachments?.length ?? 0;
    const totalMembersCount = project.members?.length ?? 0;

    // 1-to-1 Alignment with Studio PMS (studio/pms/projects/show) + Interactive Gantt
    const tabs: {
        key: PortalTabKey;
        label: string;
        icon: React.ReactNode;
        badge?: string | number | null;
    }[] = [
        {
            key: 'blueprint',
            label: 'Cetak Biru Teknis',
            icon: <FileText className="size-3.5" />,
            badge: null,
        },
        {
            key: 'sprints',
            label: 'Sprint Cycles',
            icon: <Zap className="size-3.5" />,
            badge: project.sprints.length,
        },
        {
            key: 'tasks',
            label: 'Daftar Tugas',
            icon: <ListTodo className="size-3.5" />,
            badge: project.tasks.length,
        },
        {
            key: 'reports',
            label: 'Laporan Progres',
            icon: <BarChart3 className="size-3.5" />,
            badge: `${project.progress_percentage}%`,
        },
        {
            key: 'team',
            label: 'Tim & Anggota',
            icon: <Users className="size-3.5" />,
            badge: totalMembersCount,
        },
        {
            key: 'attachments',
            label: 'Lampiran',
            icon: <Paperclip className="size-3.5" />,
            badge: totalAttachmentsCount,
        },
        {
            key: 'timeline',
            label: 'Timeline Gantt',
            icon: <CalendarDays className="size-3.5" />,
            badge: 'Live',
        },
    ];

    /* ---------------------------------------------------------------------- */
    /* CASE 3: AUTHENTICATED CLIENT PORTAL VAULT                              */
    /* ---------------------------------------------------------------------- */
    return (
        <div className="flex min-h-screen flex-col bg-[#f6f8fc] text-slate-800 antialiased transition-colors duration-200 selection:bg-violet-500/20 dark:bg-[#050814] dark:text-slate-100">
            <Head
                title={`Ruang Pantau Proyek: ${project.name} - Ridhwan Studio`}
            />

            {/* Ambient Luxury Background Glows */}
            <div className="no-print pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
                <div className="absolute -top-40 left-1/4 size-[34rem] rounded-full bg-violet-500/10 blur-[140px] dark:bg-violet-600/12" />
                <div className="absolute top-1/3 -right-24 size-[30rem] rounded-full bg-sky-500/10 blur-[140px] dark:bg-indigo-600/10" />
                <div className="absolute bottom-0 left-10 hidden size-[24rem] rounded-full bg-amber-500/[0.04] blur-[140px] dark:block" />
            </div>

            {/* STANDALONE GLASS TOP NAVBAR (NO ADMIN SIDEBAR) */}
            <header className="glass-panel no-print sticky top-0 z-50 border-x-0 border-t-0">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <img
                            src="/images/anang-logo.png"
                            alt="Ridhwan Studio Logo"
                            className="size-9 shrink-0 object-contain [filter:drop-shadow(0_3px_8px_rgba(0,164,253,0.38))_drop-shadow(0_1px_3px_rgba(123,38,251,0.25))] dark:[filter:drop-shadow(0_0_12px_rgba(0,164,253,0.55))_drop-shadow(0_0_22px_rgba(123,38,251,0.35))]"
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-[family-name:var(--font-brand)] text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    Ridhwan Studio
                                </span>
                                <span className="hidden rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 md:inline-flex dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-300">
                                    {project.code}
                                </span>
                            </div>
                            <span className="block truncate text-[10.5px] text-slate-500 dark:text-slate-400">
                                Portal Pantau Proyek Klien
                            </span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleTheme}
                            aria-label={
                                isDark
                                    ? 'Ganti ke Tema Terang'
                                    : 'Ganti ke Tema Gelap'
                            }
                            title={
                                isDark
                                    ? 'Ganti ke Tema Terang'
                                    : 'Ganti ke Tema Gelap'
                            }
                            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border-slate-200 bg-white px-2.5 text-slate-700 hover:border-violet-500/40 sm:px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        >
                            {isDark ? (
                                <>
                                    <Sun className="size-3.5 text-amber-400" />
                                    <span className="hidden text-[11px] font-semibold sm:inline">
                                        Terang
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Moon className="size-3.5 text-violet-600" />
                                    <span className="hidden text-[11px] font-semibold sm:inline">
                                        Gelap
                                    </span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* MAIN PRINTABLE VAULT WORKSPACE */}
            <main
                id="portal-print-sheet"
                className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8"
            >
                <div className="mb-4 hidden items-center justify-between border-b border-slate-300 pb-4 print:flex">
                    <div>
                        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            Ridhwan Studio • Laporan Status Proyek Klien
                        </p>
                        <h2 className="text-lg font-black text-slate-900">
                            {project.name} ({project.code})
                        </h2>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                        <p>Klien: {project.client}</p>
                        <p>Dicetak: {formatDate(new Date().toISOString())}</p>
                    </div>
                </div>

                {/* 1. LUXURY EXECUTIVE HERO CARD */}
                <section className="luxury-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
                    <div className="specular-top" />
                    <div className="no-print pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent blur-2xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
                                    {project.code}
                                </span>
                                <Badge
                                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${projectStatus.className}`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${projectStatus.dotColor} mr-1.5`}
                                    />
                                    {projectStatus.label}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${projectPriority.className}`}
                                >
                                    {projectPriority.label}
                                </Badge>
                                <span className="pl-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Klien:{' '}
                                    <strong className="text-slate-800 dark:text-slate-100">
                                        {project.client}
                                    </strong>
                                </span>
                            </div>

                            <h1 className="font-[family-name:var(--font-brand)] text-2xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] dark:text-white">
                                {project.name}
                            </h1>

                            {project.description && (
                                <div className="max-w-3xl space-y-2">
                                    <p
                                        className={`text-xs leading-relaxed whitespace-pre-line text-slate-600 sm:text-sm dark:text-slate-300/90 ${
                                            isDescExpanded ? '' : 'line-clamp-3'
                                        }`}
                                    >
                                        {renderFormattedText(
                                            project.description,
                                        )}
                                    </p>
                                    {project.description.length > 140 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDescExpanded(
                                                    !isDescExpanded,
                                                )
                                            }
                                            className="no-print inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                                        >
                                            {isDescExpanded ? (
                                                <>
                                                    Ringkas deskripsi
                                                    <ChevronUp className="size-3.5" />
                                                </>
                                            ) : (
                                                <>
                                                    Baca deskripsi lengkap
                                                    <ChevronDown className="size-3.5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {hasTechStack && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="mr-1 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                                        Teknologi:
                                    </span>
                                    {project.detail?.tech_stack
                                        ?.slice(0, 6)
                                        .map((tech, i) => (
                                            <span
                                                key={i}
                                                className="rounded-md border border-slate-200/70 bg-slate-100/90 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-slate-700 dark:border-slate-700/70 dark:bg-slate-800/80 dark:text-slate-300"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    {(project.detail?.tech_stack?.length ?? 0) >
                                        6 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab('blueprint')
                                            }
                                            className="no-print cursor-pointer px-1 text-[10.5px] font-bold text-violet-600 hover:underline dark:text-violet-400"
                                        >
                                            +
                                            {(project.detail?.tech_stack
                                                ?.length ?? 0) - 6}{' '}
                                            lainnya
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Schedule & Lead Row */}
                            <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                                {project.creator_name && (
                                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-slate-50 px-2.5 py-1 dark:border-slate-800 dark:bg-slate-900/70">
                                        <User className="size-3.5 text-indigo-500" />
                                        <span>
                                            Lead:{' '}
                                            <strong className="text-slate-800 dark:text-slate-200">
                                                {project.creator_name}
                                            </strong>
                                        </span>
                                    </div>
                                )}

                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-slate-50 px-2.5 py-1 dark:border-slate-800 dark:bg-slate-900/70">
                                    <Calendar className="size-3.5 text-violet-500" />
                                    <span>
                                        Mulai:{' '}
                                        <strong className="text-slate-800 dark:text-slate-200">
                                            {formatDate(project.start_date)}
                                        </strong>
                                    </span>
                                </div>

                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-slate-50 px-2.5 py-1 dark:border-slate-800 dark:bg-slate-900/70">
                                    <CalendarDays className="size-3.5 text-sky-500" />
                                    <span>
                                        Target Rilis:{' '}
                                        <strong className="text-slate-800 dark:text-slate-200">
                                            {formatDate(project.end_date)}
                                        </strong>
                                    </span>
                                </div>

                                <Badge
                                    variant="outline"
                                    className={`rounded-xl px-2.5 py-1 text-[10.5px] font-bold ${
                                        healthToneClasses[scheduleHealth.tone]
                                    }`}
                                >
                                    {scheduleHealth.label}
                                </Badge>

                                <div className="no-print flex items-center gap-2 sm:ml-auto">
                                    {project.detail?.live_demo_url && (
                                        <a
                                            href={project.detail.live_demo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-sky-600 hover:underline dark:text-sky-400"
                                        >
                                            Live Demo
                                            <ExternalLink className="size-3" />
                                        </a>
                                    )}
                                    {activeTab !== 'timeline' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab('timeline')
                                            }
                                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-600 transition-colors hover:bg-violet-500/15 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                                        >
                                            Timeline Gantt
                                            <ArrowRight className="size-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Wing: Luxury Progress Gauge */}
                        <div className="shrink-0 space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 lg:w-80 dark:border-slate-800/90 dark:bg-[#080f20]/90">
                            <div className="flex items-center gap-4">
                                <CircularProgressRing
                                    percentage={project.progress_percentage}
                                />
                                <div className="min-w-0 space-y-1">
                                    <span className="block text-[10.5px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                        Kemajuan Proyek
                                    </span>
                                    <p className="font-[family-name:var(--font-brand)] text-sm leading-snug font-bold text-slate-900 dark:text-white">
                                        {project.progress_percentage >= 100
                                            ? 'Proyek Rampung 100%'
                                            : project.progress_percentage >= 70
                                              ? 'Memasuki Tahap Akhir'
                                              : 'Berjalan Sesuai Jadwal'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('reports')}
                                        className="no-print inline-flex cursor-pointer items-center gap-0.5 text-[11px] font-bold text-violet-600 hover:underline dark:text-violet-400"
                                    >
                                        Lihat rincian laporan
                                        <ArrowRight className="size-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200/70 pt-2 dark:border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('tasks')}
                                    className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-2.5 text-left transition-colors hover:border-violet-500/40 dark:border-slate-800 dark:bg-[#0c152a]"
                                >
                                    <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                        Tugas Rampung
                                    </span>
                                    <strong className="mt-0.5 block text-xs font-extrabold text-slate-800 tabular-nums group-hover:text-violet-600 dark:text-slate-100 dark:group-hover:text-violet-400">
                                        {metrics.done_tasks} /{' '}
                                        {metrics.total_tasks} Tiket
                                    </strong>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('reports')}
                                    className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-2.5 text-left transition-colors hover:border-emerald-500/40 dark:border-slate-800 dark:bg-[#0c152a]"
                                >
                                    <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                        Subtask QA
                                    </span>
                                    <strong className="mt-0.5 block text-xs font-extrabold text-slate-800 tabular-nums group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                                        {metrics.done_subtasks} /{' '}
                                        {metrics.total_subtasks} Cek
                                    </strong>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. WORKSPACE NAVIGATION DOCK (MATCHING STUDIO PMS TABS) */}
                <nav
                    role="tablist"
                    aria-label="Navigasi Portal Klien"
                    className="luxury-card no-print flex scrollbar-none items-center gap-1.5 overflow-x-auto rounded-2xl p-1.5 sm:p-2"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                role="tab"
                                type="button"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all sm:px-4 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md ring-1 shadow-violet-600/25 ring-violet-400/40'
                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-violet-600 dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.badge !== undefined &&
                                    tab.badge !== null && (
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold tabular-nums ${
                                                isActive
                                                    ? 'bg-white/25 text-white'
                                                    : 'border border-slate-200/80 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                            }`}
                                        >
                                            {tab.badge}
                                        </span>
                                    )}
                            </button>
                        );
                    })}
                </nav>

                {/* 3. ACTIVE MODULE VIEW */}
                <div className="animate-in duration-200 fade-in-0">
                    {activeTab === 'blueprint' && (
                        <PortalBlueprintModule
                            project={project}
                            onOpenAttachments={() => setActiveTab('attachments')}
                        />
                    )}
                    {activeTab === 'sprints' && (
                        <PortalSprintsModule
                            project={project}
                            onOpenSprintTasks={handleOpenSprintTasks}
                        />
                    )}
                    {activeTab === 'tasks' && (
                        <PortalTasksModule
                            project={project}
                            selectedSprintFilter={selectedSprintFilter}
                            onChangeSprintFilter={setSelectedSprintFilter}
                        />
                    )}
                    {activeTab === 'reports' && (
                        <PortalReportsModule
                            project={project}
                            metrics={metrics}
                            onCopySummary={copyProjectProgress}
                            copiedSummary={copiedSummary}
                        />
                    )}
                    {activeTab === 'team' && (
                        <PortalTeamModule project={project} />
                    )}
                    {activeTab === 'attachments' && (
                        <PortalAttachmentsModule project={project} />
                    )}
                    {activeTab === 'timeline' && (
                        <PortalGanttTimeline
                            project={project}
                            timelineData={timelineData}
                        />
                    )}
                </div>
            </main>

            {/* NDA FOOTER */}
            <footer className="no-print mt-14 border-t border-slate-200/80 bg-white/70 py-7 text-center text-xs text-slate-500 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#050814]/80">
                <div className="mx-auto max-w-7xl space-y-1.5 px-4">
                    <p className="flex items-center justify-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Shield className="size-3.5 text-violet-500" />
                        Portal Pantau Proyek Klien • Dilindungi Perjanjian
                        Kerahasiaan (NDA)
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} Ridhwan Studio. Hak Cipta
                        Dilindungi Undang-Undang.
                    </p>
                </div>
            </footer>
        </div>
    );
}
