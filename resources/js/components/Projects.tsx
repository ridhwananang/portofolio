import { FolderGit2, ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';
import { useState } from 'react';

interface ProjectItem {
    title: string;
    description: string;
    tags: string[];
    mockup_type: string;
    image: string;
}

interface ProjectsProps {
    projects: ProjectItem[];
    loading: boolean;
}

export default function Projects({ projects, loading }: ProjectsProps) {
    const [activeProject, setActiveProject] = useState<number | null>(null);

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) {
            return '/images/finverra.png';
        }

        if (
            imagePath.startsWith('/') ||
            imagePath.startsWith('http://') ||
            imagePath.startsWith('https://')
        ) {
            return imagePath;
        }

        return `/storage/${imagePath}`;
    };

    return (
        <section id="karya" className="w-full">
            {/* Section Header */}
            <div className="mb-11 flex items-center gap-3.5">
                <div className="hidden sm:flex rounded-2xl border border-slate-200/50 bg-white p-2.5 text-violet-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-violet-400">
                    <FolderGit2
                        size={22}
                        id="projects-title-icon"
                        strokeWidth={2.2}
                    />
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Proyek{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                            Unggulan
                        </span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Studi kasus pengerjaan proyek nyata berskala
                        siap-produksi
                    </p>
                </div>
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="flex flex-wrap gap-6">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="glass-card flex min-w-[250px] flex-1 animate-pulse flex-col items-stretch gap-6 rounded-[2rem] border border-slate-200/50 p-6 md:max-w-[calc(33.333%-16px)] dark:border-slate-800/40"
                        >
                            <div className="relative aspect-[2/1] w-full rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <div className="h-5 w-12 rounded bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="h-5 w-12 rounded bg-slate-100 dark:bg-slate-800"></div>
                                </div>
                                <div className="bg-slate-250 h-6 w-1/2 rounded dark:bg-slate-800"></div>
                                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Main projects flex container (3 items per row on desktop) */
                <div className="flex flex-wrap gap-6">
                    {projects.map((p, idx) => {
                        const isHovered = activeProject === idx;

                        return (
                            <div
                                key={p.title}
                                onMouseEnter={() => setActiveProject(idx)}
                                onMouseLeave={() => setActiveProject(null)}
                                className={`glass-card flex min-w-[250px] flex-1 flex-col items-stretch gap-6 rounded-[2rem] border p-6 select-none md:max-w-[calc(33.333%-16px)] ${
                                    isHovered
                                        ? 'border-violet-500/50 shadow-xl shadow-slate-100/40 dark:shadow-none'
                                        : 'border-slate-200/50 dark:border-slate-800/40'
                                } group`}
                            >
                                {/* Screen Mockup Sandbox Container (Fits full width, 2:1 aspect ratio) */}
                                <div className="relative aspect-[2/1] w-full flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200/40 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                                    <div className="relative flex h-full w-full flex-col justify-start overflow-hidden bg-slate-950">
                                        <div className="relative w-full flex-grow overflow-hidden bg-slate-900">
                                            <img
                                                src={getImageUrl(p.image)}
                                                alt={`${p.title} Screenshot`}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Content details details Container */}
                                <div className="flex flex-1 flex-col justify-between py-1">
                                    {/* Tech Badges Container */}
                                    <div className="mb-3.5 flex flex-wrap gap-1.5">
                                        {p.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="dark:bg-slate-850 rounded-md border border-slate-200/30 bg-slate-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-slate-500 dark:border-slate-700/30 dark:text-slate-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Name & Explanations */}
                                    <div>
                                        <h4 className="mb-2.5 flex items-center gap-1.5 text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                                            {p.title}
                                            <ArrowUpRight
                                                size={15}
                                                className={`text-slate-400 transition-all ${
                                                    isHovered
                                                        ? 'translate-x-0.5 -translate-y-0.5 text-violet-500'
                                                        : ''
                                                }`}
                                            />
                                        </h4>
                                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                            {p.description}
                                        </p>
                                    </div>

                                    {/* Project Links / Integration Meta */}
                                    <div className="text-slate-450 mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs dark:border-slate-800/85">
                                        <span className="text-slate-650 flex items-center gap-1.5 font-semibold dark:text-slate-400">
                                            <CheckCircle2
                                                size={13}
                                                className="text-emerald-500"
                                            />
                                            Clean Architecture
                                        </span>
                                        <span>•</span>
                                        <span className="text-slate-650 flex items-center gap-1.5 font-semibold dark:text-slate-400">
                                            <Layers
                                                size={13}
                                                strokeWidth={2.4}
                                            />
                                            Inertia.js Ready
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
