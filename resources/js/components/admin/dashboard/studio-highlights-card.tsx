import React from 'react';
import { Link } from '@inertiajs/react';
import { Award, Briefcase, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';

interface StudioHighlightsCardProps {
    projects: Project[];
    totalProjects: number;
    totalCertificates: number;
}

export function StudioHighlightsCard({
    projects,
    totalProjects,
    totalCertificates,
}: StudioHighlightsCardProps) {
    return (
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 sm:p-7 backdrop-blur-xl shadow-xs dark:border-slate-800/80 dark:bg-slate-900/60 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60">
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            Karya & Kredensial Studio
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pratinjau portofolio terkini dan status lisensi resmi
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/projects"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 group"
                >
                    <span>Galeri Proyek</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            </div>

            {/* Recent Projects Preview Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Proyek Terbaru</span>
                    <span className="text-slate-400 font-normal">{totalProjects} total karya</span>
                </div>

                {projects.length === 0 ? (
                    <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        Belum ada proyek yang ditambahkan.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {projects.slice(0, 3).map((project) => (
                            <Link
                                key={project.id}
                                href={`/admin/projects/${project.id}/edit`}
                                className="group relative rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-violet-500/40 block"
                            >
                                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-900">
                                    {project.image_url ? (
                                        <img
                                            src={project.image_url}
                                            alt={project.title}
                                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                            No Preview
                                        </div>
                                    )}
                                </div>
                                <div className="p-2.5 bg-white dark:bg-slate-900">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {project.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500 capitalize truncate mt-0.5">
                                        {project.tags?.[0] || project.mockup_type || 'Web Application'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Official Certification Card */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400 p-2.5 shrink-0">
                        <Award size={20} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                Dicoding Indonesia Verified
                            </span>
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                            {totalCertificates} Sertifikat Lisensi Keahlian Terbit
                        </p>
                    </div>
                </div>

                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs rounded-xl border-amber-300/80 bg-white/80 hover:bg-white text-amber-800 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 font-semibold shrink-0"
                >
                    <Link href="/admin/certificates">Buka Vault</Link>
                </Button>
            </div>
        </div>
    );
}
