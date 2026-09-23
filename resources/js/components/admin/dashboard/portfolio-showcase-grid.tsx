import React from 'react';
import { Link } from '@inertiajs/react';
import { Award, Briefcase, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';

interface PortfolioShowcaseGridProps {
    projects: Project[];
    totalProjects: number;
    totalCertificates: number;
}

export function PortfolioShowcaseGrid({
    projects,
    totalProjects,
    totalCertificates,
}: PortfolioShowcaseGridProps) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 sm:p-6 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60">
                        <Briefcase size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            Showcase Karya & Lisensi
                        </h3>
                    </div>
                </div>

                <Link
                    href="/admin/projects"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 inline-flex items-center gap-1 group"
                >
                    <span>Galeri Proyek</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {/* Recent Projects Previews */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Karya Terkini</span>
                    <span>{totalProjects} Total Proyek</span>
                </div>

                {projects.length === 0 ? (
                    <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                        Belum ada karya portofolio yang ditambahkan.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {projects.slice(0, 3).map((project) => (
                            <Link
                                key={project.id}
                                href={`/admin/projects/${project.id}/edit`}
                                className="group rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-violet-500/40 hover:shadow-xs transition-all block"
                            >
                                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-900">
                                    {project.image_url ? (
                                        <img
                                            src={project.image_url}
                                            alt={project.title}
                                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-white dark:bg-slate-900">
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                        {project.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
                                        {project.tags?.[0] || project.mockup_type || 'Web'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Official Certification Card (Clean spacing, not cramped) */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400 p-2 shrink-0">
                        <Award size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                Dicoding Verified
                            </span>
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {totalCertificates} Sertifikat Resmi Terbit
                        </p>
                    </div>
                </div>

                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs rounded-lg border-amber-300/80 bg-white hover:bg-white text-amber-800 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 font-semibold shrink-0"
                >
                    <Link href="/admin/certificates">Vault</Link>
                </Button>
            </div>
        </div>
    );
}
