import { FolderGit2, ArrowUpRight, CheckCircle2, Layers, ChevronDown, ChevronUp, Cloud, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProjectItem {
    title: string;
    description: string;
    tags: string[];
    mockup_type: string;
    image: string;
    link?: string;
}

interface ProjectsProps {
    projects: ProjectItem[];
    loading: boolean;
}

export default function Projects({ projects, loading }: ProjectsProps) {
    const [activeProject, setActiveProject] = useState<number | null>(null);
    const ITEMS_PER_PAGE = 3;
    const [isExpanded, setIsExpanded] = useState(false);

    const safeProjects = Array.isArray(projects) ? projects : [];
    const visibleProjects = isExpanded ? safeProjects : safeProjects.slice(0, ITEMS_PER_PAGE);

    // Reset expand when projects count changes
    useEffect(() => {
        setIsExpanded(false);
    }, [safeProjects.length]);

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

        return imagePath;
    };

    return (
        <section id="karya" className="w-full">
            {/* Section Header */}
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 text-violet-600 shadow-2xs dark:border-white/10 dark:bg-slate-900 dark:text-violet-400">
                        <FolderGit2
                            size={22}
                            id="projects-title-icon"
                            strokeWidth={2.2}
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Proyek{' '}
                            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                Unggulan
                            </span>
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Studi kasus pengerjaan sistem aplikasi nyata berstandar produksi
                        </p>
                    </div>
                </div>

                {!loading && safeProjects.length > 0 && (
                    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 px-3.5 py-1.5 text-xs font-mono font-bold text-slate-650 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300 w-fit">
                        <span>{safeProjects.length} Proyek Terdaftar</span>
                    </div>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="glass-card flex animate-pulse flex-col items-stretch gap-5 rounded-[2.2rem] border border-slate-200/60 p-6 dark:border-slate-800/50"
                        >
                            <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800"></div>
                                </div>
                                <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Projects Grid Container (1 col mobile, 2 col tablet, 3 col desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleProjects.map((p, idx) => {
                            const isHovered = activeProject === idx;

                            return (
                                <div
                                    key={p.title}
                                    onMouseEnter={() => setActiveProject(idx)}
                                    onMouseLeave={() => setActiveProject(null)}
                                    className={`glass-card transform-gpu flex flex-col justify-between overflow-hidden rounded-[2.2rem] border p-6 select-none transition-all duration-300 hover:-translate-y-1.5 ${
                                        isHovered
                                            ? 'border-violet-500/50 bg-white/95 shadow-xl shadow-slate-200/60 dark:bg-slate-900/85 dark:shadow-black/40'
                                            : 'border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-slate-900/65'
                                    } group`}
                                >
                                    <div>
                                        {/* Realistic macOS Browser Window Mockup Frame */}
                                        <div className="relative mb-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 shadow-sm dark:border-white/10">
                                            {/* Browser Window Header Toolbar */}
                                            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-3.5 py-2">
                                                {/* 3-dot Window Controls */}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] opacity-80" />
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] opacity-80" />
                                                </div>

                                                {/* Simulated URL bar */}
                                                <div className="flex items-center justify-center rounded-md bg-slate-800/60 px-3 py-0.5 text-[10px] font-mono text-slate-400">
                                                    <span>cloud://preview.app</span>
                                                </div>

                                                <div className="w-8" />
                                            </div>

                                            {/* Screenshot display */}
                                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                                                <img
                                                    src={getImageUrl(p.image)}
                                                    alt={`${p.title} Screenshot`}
                                                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                            </div>
                                        </div>

                                        {/* Tech Badges Container */}
                                        <div className="mb-3.5 flex flex-wrap gap-1.5">
                                            {p.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-lg border border-slate-200/70 bg-slate-100/80 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-slate-650 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Project Title & Description */}
                                        <div>
                                            <h4 className="mb-2 flex items-center justify-between text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                                                <span>{p.title}</span>
                                                <ArrowUpRight
                                                    size={16}
                                                    className={`text-slate-400 transition-all duration-300 ${
                                                        isHovered
                                                            ? 'translate-x-0.5 -translate-y-0.5 text-violet-500'
                                                            : ''
                                                    }`}
                                                />
                                            </h4>
                                            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
                                                {p.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Project Architectural Meta Footer */}
                                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-3.5 text-xs dark:border-slate-800/70">
                                        <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                                            <CheckCircle2
                                                size={13}
                                                className="text-emerald-500"
                                            />
                                            Clean Arch
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                                            <Cloud
                                                size={13}
                                                className="text-sky-500"
                                            />
                                            S3 Bucket
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 text-[11px]">
                                            <Layers
                                                size={13}
                                                className="text-violet-500"
                                            />
                                            Inertia SPA
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeProjects.length > ITEMS_PER_PAGE && (
                        <div className="mt-10 flex justify-center w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isExpanded) {
                                        document.getElementById('karya')?.scrollIntoView({ behavior: 'smooth' });
                                        setTimeout(() => setIsExpanded(false), 100);
                                    } else {
                                        setIsExpanded(true);
                                    }
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition-all hover:border-violet-500 hover:text-violet-600 active:scale-95 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-violet-400 dark:hover:text-violet-400"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
