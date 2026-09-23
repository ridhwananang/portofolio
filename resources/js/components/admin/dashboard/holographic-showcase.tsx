import React from 'react';
import { Link } from '@inertiajs/react';
import { Award, Briefcase, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';

interface HolographicShowcaseProps {
    projects: Project[];
    totalProjects: number;
    totalCertificates: number;
}

export function HolographicShowcase({
    projects,
    totalProjects,
    totalCertificates,
}: HolographicShowcaseProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 backdrop-blur-2xl shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50 space-y-5">
            {/* Precision Crosshair Corner Ornaments */}
            <div className="pointer-events-none absolute top-2 left-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>
            <div className="pointer-events-none absolute top-2 right-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>
            <div className="pointer-events-none absolute bottom-2 left-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>
            <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">
                +
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                        // 02
                    </span>
                    <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                        Holographic Showcase
                    </h3>
                </div>

                <Link
                    href="/admin/projects"
                    className="text-xs font-mono font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 inline-flex items-center gap-1 group"
                >
                    <span>EXPLORE ({totalProjects})</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {/* Projects Showcase Mini-Grid */}
            <div className="space-y-3">
                {projects.length === 0 ? (
                    <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                        [ NO_PROJECTS_REGISTERED ]
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {projects.slice(0, 3).map((project) => (
                            <Link
                                key={project.id}
                                href={`/admin/projects/${project.id}/edit`}
                                className="group relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 hover:border-violet-500/50 hover:shadow-md transition-all block"
                            >
                                <div className="aspect-[16/10] w-full overflow-hidden">
                                    {project.image_url ? (
                                        <img
                                            src={project.image_url}
                                            alt={project.title}
                                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                            NO_MEDIA
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                        {project.title}
                                    </p>
                                    <p className="text-[9.5px] font-mono text-slate-400 uppercase truncate mt-0.5">
                                        {project.tags?.[0] || project.mockup_type || 'APPLICATION'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Golden Holographic Verification Seal */}
            <div className="relative overflow-hidden rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-4 dark:border-amber-700/60 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-amber-900/20 dark:to-transparent flex items-center justify-between gap-3">
                {/* Gold Glow inside seal */}
                <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-amber-400/15 blur-xl" />

                <div className="flex items-center gap-3 min-w-0 relative z-10">
                    <div className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-amber-950 shadow-md shadow-amber-500/20 shrink-0">
                        <Award size={22} className="stroke-[2.5]" />
                        <Sparkles size={11} className="absolute -top-1 -right-1 text-amber-200 animate-pulse" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black tracking-wide text-slate-900 dark:text-white truncate font-mono">
                                DICODING VERIFIED
                            </span>
                            <CheckCircle2 size={12} className="text-amber-500 shrink-0" />
                        </div>
                        <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 truncate mt-0.5">
                            {totalCertificates} Sertifikat Lisensi Terakreditasi
                        </p>
                    </div>
                </div>

                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-mono font-bold rounded-lg border-amber-400/80 bg-white/90 hover:bg-white text-amber-900 dark:border-amber-600 dark:bg-slate-900 dark:text-amber-300 shrink-0 relative z-10 cursor-pointer"
                >
                    <Link href="/admin/certificates">VAULT →</Link>
                </Button>
            </div>
        </div>
    );
}
