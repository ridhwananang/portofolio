import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    Briefcase,
    Calculator,
    Code2,
    Globe,
    LayoutDashboard,
    Mail,
    ShoppingBag,
    UserCheck,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

// Studio Core Modules
const studioNavItems: NavItem[] = [
    {
        title: 'Dashboard Cockpit',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Order & Proyek Klien',
        href: '/admin/orders',
        icon: ShoppingBag,
    },
    {
        title: 'Kelola Layanan',
        href: '/admin/services',
        icon: Calculator,
    },
    {
        title: 'Pesan Masuk (Inbox)',
        href: '/admin/messages',
        icon: Mail,
    },
];

// Showcase & Assets
const contentNavItems: NavItem[] = [
    {
        title: 'Portofolio Proyek',
        href: '/admin/projects',
        icon: Briefcase,
    },
    {
        title: 'Tech Stacks Matrix',
        href: '/admin/tech-stacks',
        icon: Code2,
    },
    {
        title: 'Sertifikat & Lisensi',
        href: '/admin/certificates',
        icon: Award,
    },
    {
        title: 'Profil & Bio Portofolio',
        href: '/admin/profile',
        icon: UserCheck,
    },
];


// Quick Public Tools in Footer
const quickToolsItems: NavItem[] = [
    {
        title: 'Kalkulator Layanan',
        href: '/layanan',
        icon: Calculator,
    },
    {
        title: 'Web Portofolio Publik',
        href: '/',
        icon: Globe,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };
    const isAdmin = Boolean(auth?.user?.is_admin);

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-slate-200/80 dark:border-slate-800/80 [&_[data-sidebar=sidebar]]:!bg-transparent [&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:overflow-hidden"
        >
            {/* Tailored Organic Atmospheric & Topographic Sidebar Canvas */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
            >
                {/* 1. Base Gradient Surface */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7FD]/95 via-[#F6F8FC]/95 to-[#F0FDF9]/95 dark:from-[#0D1226]/95 dark:via-[#090D1C]/95 dark:to-[#070A16]/95 backdrop-blur-2xl" />

                {/* 2. Atmospheric Ambient Underglows (Top Violet, Bottom Cyan) */}
                <div className="absolute -top-16 -left-16 size-56 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),transparent_70%)] blur-2xl" />
                <div className="absolute bottom-12 -right-16 size-56 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.14),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18),transparent_70%)] blur-2xl" />

                {/* 3. Bespoke Vertical Topographic & Orbital SVG specifically for Sidebar */}
                <svg
                    className="absolute inset-0 h-full w-full opacity-35 dark:opacity-20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="sidebar-topo-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
                            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.15" />
                        </linearGradient>
                        <linearGradient id="sidebar-topo-2" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>

                    {/* Flowing Elevation Curves along Sidebar Height */}
                    <path
                        d="M-30,60 C70,180 130,100 240,240 C300,320 160,460 260,600 C320,700 140,840 220,980"
                        fill="none"
                        stroke="url(#sidebar-topo-1)"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M-40,120 C50,240 110,160 220,300 C280,380 140,520 240,660 C300,760 120,900 200,1040"
                        fill="none"
                        stroke="url(#sidebar-topo-1)"
                        strokeWidth="0.9"
                        strokeOpacity="0.75"
                    />
                    <path
                        d="M-50,180 C30,300 90,220 200,360 C260,440 120,580 220,720 C280,820 100,960 180,1100"
                        fill="none"
                        stroke="url(#sidebar-topo-2)"
                        strokeWidth="0.8"
                        strokeOpacity="0.5"
                    />

                    {/* Celestial Orbital Arcs (Top & Bottom Accents) */}
                    <circle
                        cx="15%"
                        cy="8%"
                        r="80"
                        fill="none"
                        stroke="url(#sidebar-topo-1)"
                        strokeWidth="0.8"
                        strokeDasharray="3 6"
                        className="opacity-60"
                    />
                    <circle
                        cx="15%"
                        cy="8%"
                        r="140"
                        fill="none"
                        stroke="url(#sidebar-topo-2)"
                        strokeWidth="0.7"
                        className="opacity-35"
                    />

                    <circle
                        cx="85%"
                        cy="82%"
                        r="90"
                        fill="none"
                        stroke="url(#sidebar-topo-2)"
                        strokeWidth="0.8"
                        strokeDasharray="4 8"
                        className="opacity-50"
                    />
                    <circle
                        cx="85%"
                        cy="82%"
                        r="160"
                        fill="none"
                        stroke="url(#sidebar-topo-1)"
                        strokeWidth="0.6"
                        className="opacity-30"
                    />
                </svg>

                {/* 4. Subtle Right-Border Shimmer Accent */}
                <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-violet-500/30 via-indigo-500/10 to-cyan-400/30" />
            </div>

            <SidebarHeader className="relative z-10 border-b border-sidebar-border/40 py-2.5 bg-white/30 dark:bg-white/[0.02] backdrop-blur-xs">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent focus-visible:ring-0">
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="relative z-10 py-2 space-y-1">
                {isAdmin ? (
                    <>
                        <NavMain items={studioNavItems} label="Studio Hub" />
                        <NavMain items={contentNavItems} label="Karya & Aset" />
                    </>
                ) : (
                    <NavMain items={quickToolsItems} label="Layanan Pembuatan Web" />
                )}
            </SidebarContent>

            <SidebarFooter className="relative z-10 border-t border-sidebar-border/40 pt-2 pb-3 bg-white/30 dark:bg-white/[0.02] backdrop-blur-xs">
                <div className="px-2 py-1 mb-1 hidden group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="flex items-center gap-2">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                            Payment Gateway
                        </span>
                        <span className="font-mono text-[9.5px] uppercase tracking-wider bg-emerald-500/15 px-1.5 py-0.5 rounded">
                            Active
                        </span>
                    </div>
                </div>
                <NavFooter items={quickToolsItems} className="mt-auto mb-1" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
