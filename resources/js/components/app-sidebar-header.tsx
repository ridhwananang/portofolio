import { Link, router, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    Globe,
    Moon,
    Sun,
    Search,
    Plus,
    Briefcase,
    Layers,
    Award,
    ShoppingBag,
    Menu,
    Command,
    FolderKanban,
    CheckSquare,
    CalendarDays,
    Zap,
    ChevronDown,
    ArrowUpRight,
    Sparkles,
    History,
    Radio,
    ShieldCheck,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { CommandPalette } from '@/components/admin/command-palette';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import type { Auth, BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = Boolean(auth?.user?.is_admin);
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mounted, setMounted] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const { toggleSidebar } = useSidebar();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Ensure SSR and initial client hydration match identically by deferring dark state until mounted
    const isDark = mounted ? resolvedAppearance === 'dark' : false;

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    // Keyboard shortcut for Command Palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCommandOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div className="sticky top-0 z-40 w-full pt-2.5 pb-2 px-3 sm:px-6 lg:px-8 bg-[#F6F8FC]/80 dark:bg-[#0B1120]/80 backdrop-blur-md transition-colors">
                <header className="relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)] transition-all duration-300">
                    {/* Subtle Luxury Specular Top Highlight */}
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 dark:via-cyan-400/30 to-transparent" />

                    {/* Inner Header Surface */}
                    <div className="w-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
                        {/* Left: Clean Menu / Sidebar Toggle & Full Breadcrumbs Trail */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={toggleSidebar}
                                        className="size-8.5 sm:size-9 rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-slate-950/70 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-violet-500/40 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
                                        aria-label="Toggle Sidebar"
                                    >
                                        <Menu className="size-4 sm:size-4.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    <span>Toggle Sidebar (Ctrl+B)</span>
                                </TooltipContent>
                            </Tooltip>

                            <div className="h-4.5 w-px bg-slate-200/80 dark:bg-slate-800 hidden sm:block shrink-0" />

                            {/* Responsive Breadcrumbs Trail */}
                            <div className="min-w-0 flex-1">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>

                        {/* Right: Studio Action Hub (Search, 2 Quick Access Features, Theme Switch) */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                            {/* Command Palette Search - Desktop Bar */}
                            <div className="hidden xl:flex items-center w-48 2xl:w-60">
                                <button
                                    type="button"
                                    onClick={() => setCommandOpen(true)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-white/[0.08] dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900/90 hover:border-violet-500/40 text-xs text-slate-500 dark:text-slate-400 transition-all duration-200 shadow-2xs group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <Search className="size-3.5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shrink-0" />
                                        <span className="truncate">Cari fitur & aksi...</span>
                                    </div>
                                    <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs shrink-0 ml-1.5">
                                        <Command className="size-2.5" />K
                                    </kbd>
                                </button>
                            </div>

                            {/* Compact Search Trigger (screens < xl) */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setCommandOpen(true)}
                                        className="xl:hidden size-8.5 sm:size-9 rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-slate-950/70 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
                                        aria-label="Buka Command Palette (Ctrl+K)"
                                    >
                                        <Search className="size-3.5 sm:size-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    <span>Cari Fitur (Ctrl+K)</span>
                                </TooltipContent>
                            </Tooltip>

                            {/* ========================================================
                                QUICK ACCESS FEATURE 1: AKSI CEPAT / AKSED CEPAT HUB
                                ======================================================== */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="relative h-8.5 sm:h-9 gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 dark:from-violet-500 dark:via-indigo-500 dark:to-purple-500 font-bold text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/35 border border-white/15 active:scale-[0.98] transition-all duration-200 px-2.5 sm:px-3.5 text-xs cursor-pointer shrink-0 group"
                                    >
                                        <span className="relative flex size-2 shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-300 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full size-2 bg-white"></span>
                                        </span>
                                        {isAdmin ? (
                                            <>
                                                <Plus className="size-3.5 group-hover:rotate-90 transition-transform duration-200 shrink-0" />
                                                <span className="hidden xs:inline">Aksi Cepat</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="size-3.5 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                                                <span className="hidden xs:inline">Akses Cepat</span>
                                            </>
                                        )}
                                        <ChevronDown className="size-3 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-72 sm:w-80 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0E1628]/95 backdrop-blur-2xl shadow-2xl p-2 animate-in fade-in-0 zoom-in-95"
                                >
                                    {/* Header Banner */}
                                    <div className="px-2.5 py-2 mb-1 rounded-xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent border border-violet-500/15 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
                                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                                {isAdmin ? 'Pusat Aksi Cepat Studio' : 'Pusat Akses Cepat Workspace'}
                                            </span>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-[9px] font-mono font-bold uppercase py-0 px-1.5 border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5"
                                        >
                                            {isAdmin ? 'Admin Hub' : 'Member Desk'}
                                        </Badge>
                                    </div>

                                    {isAdmin ? (
                                        <div className="space-y-0.5">
                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/projects/create')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <Briefcase className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Inisialisasi Proyek PMS</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Buat workspace proyek baru & tim
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/projects')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <ShieldCheck className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Portal Pantau Klien</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Akses rahasia & laporan email klien
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/projects/create')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <Briefcase className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Tambah Karya Portofolio</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Publikasikan showcase karya publik
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/certificates/create')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <Award className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Tambah Sertifikat & Lisensi</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Input lisensi & kredensial terverifikasi
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/tech-stacks')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <Layers className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Kelola Tech Stack Matrix</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Atur keahlian teknis & mastery tools
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="my-1 border-slate-200/80 dark:border-white/10" />

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/orders')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <ShoppingBag className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Pesanan & Rekber Klien</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Escrow payment & konfirmasi order
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        </div>
                                    ) : (
                                        <div className="space-y-0.5">
                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/tasks')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <CheckSquare className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Papan Kanban & Tugas</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Kelola jobdesk, status, & checklist
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/sprints')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <Zap className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Siklus Sprint</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Pantau target cadence & timeline
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/projects')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <FolderKanban className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Proyek Saya</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Workspace aktif & repositori proyek
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/timeline')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <CalendarDays className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Interactive Timeline</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Visualisasi roadmap & roadmap Gantt
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="my-1 border-slate-200/80 dark:border-white/10" />

                                            <DropdownMenuItem
                                                onClick={() => router.visit('/studio/pms/activity-logs')}
                                                className="cursor-pointer gap-3 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 group transition-all"
                                            >
                                                <div className="size-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                    <History className="size-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                                        <span>Audit & Log Aktivitas</span>
                                                        <ArrowUpRight className="size-3 text-slate-400 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        Riwayat perubahan status & task tim
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* ========================================================
                                INTERACTIVE SLIDING CAPSULE THEME TOGGLE SWITCH
                                ======================================================== */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        suppressHydrationWarning
                                        onClick={toggleTheme}
                                        className={`relative h-8.5 sm:h-9 w-15 sm:w-16 rounded-full p-1 cursor-pointer transition-all duration-300 border flex items-center justify-between select-none shrink-0 group ${
                                            isDark
                                                ? 'bg-slate-950/80 border-indigo-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] hover:border-indigo-400/50'
                                                : 'bg-amber-50/80 border-amber-300/70 shadow-[inset_0_2px_4px_rgba(245,158,11,0.08)] hover:border-amber-400/80'
                                        }`}
                                        aria-label="Toggle tema gelap/terang"
                                    >
                                        {/* Background Track Icons */}
                                        <div className="w-full flex items-center justify-between px-1.5 pointer-events-none select-none">
                                            <Sun
                                                size={12}
                                                className={`transition-all duration-300 ${
                                                    !isDark
                                                        ? 'text-amber-500 opacity-100 scale-105'
                                                        : 'text-slate-500 opacity-35 scale-90'
                                                }`}
                                            />
                                            <Moon
                                                size={11}
                                                className={`transition-all duration-300 ${
                                                    isDark
                                                        ? 'text-indigo-400 opacity-100 scale-105'
                                                        : 'text-slate-400 opacity-35 scale-90'
                                                }`}
                                            />
                                        </div>

                                        {/* Sliding Glowing Knob */}
                                        <span
                                            suppressHydrationWarning
                                            className={`absolute top-1 sm:top-1 size-6.5 rounded-full flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${
                                                isDark
                                                    ? 'translate-x-6.5 sm:translate-x-7.5 bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-indigo-500/30 ring-1 ring-indigo-400/30'
                                                    : 'translate-x-0 bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 shadow-amber-500/25 ring-1 ring-amber-300/80'
                                            }`}
                                        >
                                            {isDark ? (
                                                <Moon size={11} className="rotate-0 group-hover:-rotate-12 transition-transform duration-200" />
                                            ) : (
                                                <Sun size={12} className="rotate-0 group-hover:rotate-45 transition-transform duration-200" />
                                            )}
                                        </span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    <span>{isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}</span>
                                </TooltipContent>
                            </Tooltip>

                            {/* ========================================================
                                QUICK ACCESS FEATURE 2: LIVE PUBLIC WEB PORTAL LAUNCHER
                                ======================================================== */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={home()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-8.5 sm:h-9 gap-1.5 sm:gap-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-900 hover:border-violet-500/40 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 shadow-2xs hover:shadow-xs px-2.5 sm:px-3 inline-flex items-center group cursor-pointer active:scale-[0.98] shrink-0"
                                    >
                                        {/* Glowing Live Signal indicator */}
                                        <span className="relative flex size-2 shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                                        </span>
                                        <Globe className="size-3.5 text-violet-600 dark:text-violet-400 group-hover:rotate-45 transition-transform duration-300 shrink-0" />
                                        <span className="hidden sm:inline font-semibold">Web Publik</span>
                                        <ExternalLink className="size-3 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all hidden sm:inline shrink-0" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs py-1.5 px-3">
                                    <div className="font-bold flex items-center gap-1.5">
                                        <Globe className="size-3 text-emerald-500" />
                                        <span>Web Portofolio Publik</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Buka portal live di tab baru (klien & publik)</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </header>
            </div>

            {/* Global Command Palette Modal */}
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </>
    );
}
