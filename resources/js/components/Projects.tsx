import { FolderGit2, ArrowUpRight, CheckCircle2, Layers, ChevronDown, ChevronUp, Cloud } from 'lucide-react';
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
    const ITEMS_PER_PAGE = 3;
    const [isExpanded, setIsExpanded] = useState(false);

    const safeProjects = Array.isArray(projects) ? projects : [];
    const visibleProjects = isExpanded ? safeProjects : safeProjects.slice(0, ITEMS_PER_PAGE);

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
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Proyek Unggulan
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Studi kasus pengerjaan sistem aplikasi nyata berstandar produksi
                    </p>
                </div>

                {!loading && safeProjects.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 w-fit">
                        <span>{safeProjects.length} Proyek Terdaftar</span>
                    </div>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="glass-card flex animate-pulse flex-col gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                        >
                            <div className="aspect-[16/10] w-full rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Projects Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleProjects.map((p) => {
                            return (
                                <div
                                    key={p.title}
                                    className="glass-card transform-gpu flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-4 sm:p-5 select-none transition-all duration-200 hover:border-zinc-300 hover:shadow-xs dark:border-white/10 dark:bg-[#0f1117] dark:hover:border-white/20 group"
                                >
                                    <div>
                                        {/* Browser Window Mockup Frame */}
                                        <div className="relative mb-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 dark:border-white/10">
                                            {/* Browser Window Header Toolbar */}
                                            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-[#FF5F56] opacity-80" />
                                                    <span className="h-2 w-2 rounded-full bg-[#FFBD2E] opacity-80" />
                                                    <span className="h-2 w-2 rounded-full bg-[#27C93F] opacity-80" />
                                                </div>

                                                <div className="flex items-center justify-center rounded bg-zinc-800/80 px-2 py-0.2 text-[9px] font-mono text-zinc-400">
                                                    <span>cloud://preview.app</span>
                                                </div>

                                                <div className="w-6" />
                                            </div>

                                            {/* Screenshot display */}
                                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                                                <img
                                                    src={getImageUrl(p.image)}
                                                    alt={`${p.title} Screenshot`}
                                                    className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>

                                        {/* Tech Badges Row */}
                                        <div className="mb-2.5 flex flex-wrap gap-1">
                                            {p.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[9.5px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Project Title & Description */}
                                        <div>
                                            <h4 className="mb-1.5 flex items-center justify-between text-base font-bold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
                                                <span>{p.title}</span>
                                                <ArrowUpRight
                                                    size={14}
                                                    className="text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-500"
                                                />
                                            </h4>
                                            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                {p.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Architectural Meta Footer */}
                                    <div className="mt-4 flex items-center gap-2.5 border-t border-zinc-100 pt-3 text-[10.5px] font-mono text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 size={11} className="text-emerald-500" />
                                            Clean Arch
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Cloud size={11} className="text-sky-500" />
                                            S3 Bucket
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Layers size={11} className="text-violet-500" />
                                            Inertia
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeProjects.length > ITEMS_PER_PAGE && (
                        <div className="mt-6 flex justify-center w-full">
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
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-all hover:bg-zinc-50 active:scale-98 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
