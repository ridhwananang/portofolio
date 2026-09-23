import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell
            variant="sidebar"
            className="bg-[#F6F8FC] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative selection:bg-violet-500/30 selection:text-violet-900 dark:selection:text-violet-200"
        >
            {/* Organic Topographic Contours & Orbital Rings Canvas (NOT BOXY / NO SQUARES!) */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
                {/* 1. Deep Atmospheric Gradient Underglows */}
                <div className="absolute -top-40 right-0 h-[650px] w-[650px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25),transparent_70%)] blur-[120px] pointer-events-none" />
                <div className="absolute -top-20 left-10 h-[550px] w-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.20),transparent_70%)] blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 h-[600px] w-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.16),transparent_70%)] blur-[140px] pointer-events-none" />

                {/* 2. Organic Topographic Contour Waves SVG */}
                <svg
                    className="absolute inset-0 h-full w-full opacity-40 dark:opacity-25"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="topo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#14B8A6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="topo-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>

                    {/* Flowing Topographic Elevation Waves */}
                    <path
                        d="M-200,180 C200,60 500,280 900,160 C1300,40 1600,240 2000,120"
                        fill="none"
                        stroke="url(#topo-grad-1)"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M-200,260 C250,140 550,340 950,220 C1350,100 1650,300 2000,180"
                        fill="none"
                        stroke="url(#topo-grad-1)"
                        strokeWidth="1.2"
                        strokeOpacity="0.8"
                    />
                    <path
                        d="M-200,340 C300,220 600,400 1000,280 C1400,160 1700,360 2000,240"
                        fill="none"
                        stroke="url(#topo-grad-1)"
                        strokeWidth="1"
                        strokeOpacity="0.6"
                    />
                    <path
                        d="M-200,420 C350,300 650,460 1050,340 C1450,220 1750,420 2000,300"
                        fill="none"
                        stroke="url(#topo-grad-2)"
                        strokeWidth="1"
                        strokeOpacity="0.5"
                    />
                    <path
                        d="M-200,500 C400,380 700,520 1100,400 C1500,280 1800,480 2000,360"
                        fill="none"
                        stroke="url(#topo-grad-2)"
                        strokeWidth="0.8"
                        strokeOpacity="0.4"
                    />
                    <path
                        d="M-200,580 C450,460 750,580 1150,460 C1550,340 1850,540 2000,420"
                        fill="none"
                        stroke="url(#topo-grad-2)"
                        strokeWidth="0.8"
                        strokeOpacity="0.3"
                    />

                    {/* 3. Celestial Orbital Rings (Concentric Circles & Dashed Arcs) */}
                    <circle
                        cx="85%"
                        cy="18%"
                        r="280"
                        fill="none"
                        stroke="url(#topo-grad-1)"
                        strokeWidth="1"
                        strokeDasharray="4 8"
                        className="opacity-60"
                    />
                    <circle
                        cx="85%"
                        cy="18%"
                        r="420"
                        fill="none"
                        stroke="url(#topo-grad-2)"
                        strokeWidth="1"
                        className="opacity-40"
                    />
                    <circle
                        cx="85%"
                        cy="18%"
                        r="580"
                        fill="none"
                        stroke="url(#topo-grad-1)"
                        strokeWidth="0.8"
                        strokeDasharray="8 12"
                        className="opacity-30"
                    />

                    {/* Secondary Left Orbital Accent */}
                    <circle
                        cx="10%"
                        cy="65%"
                        r="320"
                        fill="none"
                        stroke="url(#topo-grad-2)"
                        strokeWidth="0.8"
                        strokeDasharray="5 10"
                        className="opacity-35"
                    />
                    <circle
                        cx="10%"
                        cy="65%"
                        r="480"
                        fill="none"
                        stroke="url(#topo-grad-1)"
                        strokeWidth="0.6"
                        className="opacity-25"
                    />
                </svg>
            </div>

            <AppSidebar />
            <AppContent variant="sidebar" className="relative z-10 overflow-x-hidden pb-12">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="mt-2">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
