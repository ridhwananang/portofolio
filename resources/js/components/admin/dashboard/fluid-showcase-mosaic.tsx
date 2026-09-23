import React from 'react';
import { Link } from '@inertiajs/react';
import { Award, ArrowUpRight, CheckCircle2, Code2, Globe, Layers, Laptop, Sparkles, ShieldCheck } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';

interface FluidShowcaseMosaicProps {
    projects: Project[];
    totalProjects: number;
    totalCertificates: number;
}

const TECH_COVERS = [
    {
        gradient: 'from-slate-950 via-indigo-950 to-slate-900',
        glow: 'bg-indigo-500/20',
        icon: Code2,
        accent: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
    {
        gradient: 'from-slate-950 via-violet-950 to-slate-900',
        glow: 'bg-violet-500/20',
        icon: Laptop,
        accent: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    },
    {
        gradient: 'from-slate-950 via-cyan-950 to-slate-900',
        glow: 'bg-cyan-500/20',
        icon: Globe,
        accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
        gradient: 'from-slate-950 via-emerald-950 to-slate-900',
        glow: 'bg-emerald-500/20',
        icon: Layers,
        accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
];

function getTechCover(id: number) {
    return TECH_COVERS[id % TECH_COVERS.length];
}

export function FluidShowcaseMosaic({
    projects,
    totalProjects,
    totalCertificates,
}: FluidShowcaseMosaicProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Showcase Karya & Lisensi</span>
                            <span className="text-xs font-medium text-slate-400">
                                ({totalProjects} Proyek)
                            </span>
                        </h3>
                    </div>
                </div>

                <Link
                    href="/admin/projects"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 inline-flex items-center gap-1 group py-1 px-2.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                >
                    <span>Semua Proyek</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {/* Organic Project Mosaic */}
            {projects.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
                    <Laptop size={24} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <span>[ BELUM ADA KARYA PROYEK ]</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {projects.slice(0, 3).map((project, idx) => {
                        const cover = getTechCover(project.id || idx);
                        const CoverIcon = cover.icon;
                        const imageUrl = project.image_url || project.image;

                        return (
                            <Link
                                key={project.id}
                                href={`/admin/projects/${project.id}/edit`}
                                className="group relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-xs hover:shadow-xl hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 block"
                            >
                                {/* Cover Media (Always displays image if available) */}
                                <div className="aspect-[16/10] w-full overflow-hidden relative bg-slate-950">
                                    {imageUrl ? (
                                        <>
                                            <img
                                                src={imageUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                            />
                                            {/* Subtle gradient vignette */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity" />

                                            {/* Floating Tag & Action */}
                                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                                                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold tracking-wider uppercase bg-slate-950/80 text-white/90 backdrop-blur-md border border-white/10 shadow-xs">
                                                    {project.tags?.[0] || project.mockup_type || 'Fullstack'}
                                                </span>
                                                <div className="size-6 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:text-white transition-colors border border-white/10 shadow-xs">
                                                    <ArrowUpRight size={12} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            className={`w-full h-full bg-gradient-to-br ${cover.gradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                                        >
                                            {/* Glowing orb background */}
                                            <div
                                                className={`absolute -top-8 -right-8 size-28 rounded-full ${cover.glow} blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                                            />

                                            {/* Top Tag Pill */}
                                            <div className="flex items-center justify-between relative z-10">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold tracking-wider uppercase border ${cover.accent}`}
                                                >
                                                    {project.tags?.[0] || project.mockup_type || 'Fullstack'}
                                                </span>
                                                <div className="size-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                                                    <ArrowUpRight size={12} />
                                                </div>
                                            </div>

                                            {/* Center Icon & Tech Pattern */}
                                            <div className="flex items-center justify-center my-auto relative z-10">
                                                <div className="size-11 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center text-white/80 group-hover:scale-110 group-hover:text-white transition-all shadow-inner">
                                                    <CoverIcon size={20} />
                                                </div>
                                            </div>

                                            {/* Bottom Code Watermark */}
                                            <div className="text-[9px] font-mono text-slate-500/60 truncate relative z-10">
                                                // app.{project.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.dev
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Details */}
                                <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/60">
                                    <div className="flex items-start justify-between gap-1.5">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                            {project.title}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[10.5px] text-slate-400 capitalize truncate">
                                            {project.tags?.slice(0, 2).join(' • ') || project.mockup_type || 'Web Application'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Royal Golden Verification Seal for Dicoding */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-full p-4 sm:px-5 sm:py-3.5 border border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-amber-400/60 transition-all">
                {/* Holographic light beam */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative">
                        <div className="size-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-amber-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 ring-2 ring-amber-300/40">
                            <Award size={18} className="stroke-[2.5]" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[8px] font-black ring-1 ring-white dark:ring-slate-900">
                            ✓
                        </span>
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                                Dicoding Verified Credentials
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                OFFICIAL
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {totalCertificates} Sertifikat Kompetensi Industri Terbit & Tervalidasi
                        </p>
                    </div>
                </div>

                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-bold rounded-full border-amber-400/80 bg-white/90 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-amber-900 dark:border-amber-500/60 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-slate-950 shrink-0 shadow-xs transition-all w-full sm:w-auto"
                >
                    <Link href="/admin/certificates" className="inline-flex items-center justify-center gap-1.5">
                        <ShieldCheck size={13} />
                        <span>Akses Vault</span>
                        <ArrowUpRight size={12} />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
