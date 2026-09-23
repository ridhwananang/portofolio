import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
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
    Sparkles,
    Command,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommandPalette } from '@/components/admin/command-palette';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const [commandOpen, setCommandOpen] = useState(false);
    const { toggleSidebar } = useSidebar();

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
            <header className="sticky top-3 z-30 mx-3 sm:mx-6 lg:mx-8 mt-3 relative p-[1px] rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-400 shadow-[0_0_18px_rgba(124,58,237,0.18)] dark:shadow-[0_0_24px_rgba(6,182,212,0.25)] transition-all duration-300 group">
                {/* Ambient Glowing Aura */}
                <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-400 opacity-25 dark:opacity-45 blur-[2px] group-hover:opacity-40 dark:group-hover:opacity-65 transition-opacity duration-300" />

                {/* Inner Header Surface */}
                <div className="relative w-full px-3 sm:px-5 py-2 sm:py-2.5 rounded-[calc(1rem-1px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl flex items-center justify-between gap-3">
                    {/* Left: Clean Menu / Sidebar Toggle & Full Breadcrumbs Trail */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="size-8 sm:size-9 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-violet-500/40 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                                aria-label="Toggle Sidebar"
                            >
                                <Menu className="size-4 sm:size-4.5 transition-transform duration-200" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Toggle Sidebar (Ctrl+B)</span>
                        </TooltipContent>
                    </Tooltip>

                    <div className="h-4 w-px bg-slate-200/70 dark:bg-slate-800 hidden sm:block shrink-0" />

                    {/* Responsive Breadcrumbs Trail */}
                    <div className="min-w-0 flex-1">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Right: Studio Action Hub (Search, Quick Actions, Theme Toggle Switch, Web) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Search Bar on large desktops (xl and above) */}
                    <div className="hidden xl:flex items-center w-48 2xl:w-60">
                        <button
                            type="button"
                            onClick={() => setCommandOpen(true)}
                            className="w-full flex items-center justify-between px-3 py-1.5 rounded-2xl border border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40 hover:border-violet-500/40 hover:bg-white dark:hover:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 transition-all duration-300 shadow-xs group cursor-pointer"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Search className="size-3.5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shrink-0" />
                                <span className="truncate">Cari fitur...</span>
                            </div>
                            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs shrink-0 ml-1.5">
                                <Command className="size-2.5" />K
                            </kbd>
                        </button>
                    </div>

                    {/* Compact Search Trigger (visible on screens < xl) */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => setCommandOpen(true)}
                                className="xl:hidden size-8 sm:size-9 rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
                                aria-label="Buka Command Palette (Ctrl+K)"
                            >
                                <Search className="size-3.5 sm:size-4 text-slate-500" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Cari Fitur (Ctrl+K)</span>
                        </TooltipContent>
                    </Tooltip>

                    {/* Quick Create Dropdown with Public Page Gradient */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                className="h-8 sm:h-9 gap-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 px-2.5 sm:px-3.5 text-xs cursor-pointer shrink-0"
                            >
                                <Plus className="size-3.5" />
                                <span className="hidden sm:inline">Buat</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl p-1.5">
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                                Aksi Cepat Studio
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                                onClick={() => router.visit('/admin/projects/create')}
                                className="cursor-pointer gap-2.5 rounded-xl text-xs py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Briefcase className="size-4 text-violet-500" />
                                <span>Tambah Proyek</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.visit('/admin/certificates/create')}
                                className="cursor-pointer gap-2.5 rounded-xl text-xs py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Award className="size-4 text-amber-500" />
                                <span>Tambah Sertifikat</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => router.visit('/admin/tech-stacks')}
                                className="cursor-pointer gap-2.5 rounded-xl text-xs py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Layers className="size-4 text-cyan-500" />
                                <span>Kelola Tech Stack</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                                onClick={() => router.visit('/admin/orders')}
                                className="cursor-pointer gap-2.5 rounded-xl text-xs py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <ShoppingBag className="size-4 text-emerald-500" />
                                <span>Kelola Pesanan & Rekber</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Interactive Sliding Capsule Theme Toggle Switch */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={`relative h-8 sm:h-9 w-15 sm:w-16 rounded-full p-1 cursor-pointer transition-all duration-300 border flex items-center justify-between shadow-inner select-none shrink-0 group ${
                                    isDark
                                        ? 'bg-slate-900/90 border-indigo-500/40 shadow-black/50 hover:border-indigo-400/60'
                                        : 'bg-gradient-to-r from-amber-100/90 via-orange-50/90 to-amber-100/90 border-amber-300/60 shadow-amber-900/5 hover:border-amber-400/80'
                                }`}
                                aria-label="Toggle tema gelap/terang"
                            >
                                {/* Background Track Icons */}
                                <div className="w-full flex items-center justify-between px-1 pointer-events-none">
                                    <Sun
                                        size={12}
                                        className={`transition-all duration-300 ${
                                            !isDark
                                                ? 'text-amber-500 opacity-100 scale-110'
                                                : 'text-slate-500 opacity-30 scale-90'
                                        }`}
                                    />
                                    <Moon
                                        size={11}
                                        className={`transition-all duration-300 ${
                                            isDark
                                                ? 'text-indigo-400 opacity-100 scale-110'
                                                : 'text-slate-400 opacity-30 scale-90'
                                        }`}
                                    />
                                </div>

                                {/* Sliding Glowing Knob */}
                                <span
                                    className={`absolute top-1 sm:top-1.5 size-6 rounded-full flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${
                                        isDark
                                            ? 'translate-x-7 sm:translate-x-8 bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-indigo-500/40 ring-1 ring-indigo-400/40'
                                            : 'translate-x-0 bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 shadow-amber-500/30 ring-1 ring-amber-300/70'
                                    }`}
                                >
                                    {isDark ? (
                                        <Moon size={11} className="rotate-0 group-hover:-rotate-12 transition-transform" />
                                    ) : (
                                        <Sun size={12} className="rotate-0 group-hover:rotate-45 transition-transform" />
                                    )}
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>{isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}</span>
                        </TooltipContent>
                    </Tooltip>

                    {/* View Public Portfolio Shortcut */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={home()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 sm:h-9 gap-1.5 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-300 shadow-xs px-2.5 sm:px-3 inline-flex items-center group cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
                            >
                                <Globe className="size-3.5 text-violet-500 group-hover:rotate-12 transition-transform shrink-0" />
                                <span className="hidden 2xl:inline">Web Publik</span>
                                <ExternalLink className="size-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors hidden 2xl:inline shrink-0" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Buka Portofolio Publik di Tab Baru</span>
                        </TooltipContent>
                    </Tooltip>
                </div>
                </div>
            </header>

            {/* Global Command Palette Modal */}
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </>
    );
}
