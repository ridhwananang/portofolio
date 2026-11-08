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
    const ITEMS_PER_PAGE = 6;
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
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Proyek Unggulan
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Studi kasus pengerjaan sistem aplikasi nyata berstandar produksi
                    </p>
                </div>

                {!loading && safeProjects.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-xs font-mono font-bold text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 shadow-2xs w-fit">
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
                            className="luxury-card flex animate-pulse flex-col gap-3 rounded-xl p-4"
                        >
                            <div className="aspect-[16/10] w-full rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-850"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Projects Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleProjects.map((p) => {
                            return (
                                <div
                                    key={p.title}
                                    className="luxury-card luxury-card-interactive transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-4.5 select-none transition-all duration-300 group"
                                >
                                    {/* Top Specular Rim */}
                                    <div className="specular-top" />

                                    <div>
                                        {/* Realistic Titanium Window Mockup Frame */}
                                        <div className="relative mb-3.5 overflow-hidden rounded-lg border border-zinc-200/90 dark:border-white/10 bg-black/80 shadow-sm">
                                            {/* Window Header Toolbar */}
                                            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/[0.07] bg-zinc-100/90 dark:bg-[#10141f] px-3 py-1.5 backdrop-blur-md">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="size-2 rounded-full bg-[#FF5F56]" />
                                                    <span className="size-2 rounded-full bg-[#FFBD2E]" />
                                                    <span className="size-2 rounded-full bg-[#27C93F]" />
                                                </div>

                                                <div className="flex items-center gap-1 rounded border border-zinc-200/80 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.04] px-2 py-0.5 text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400">
                                                    <Cloud size={9} />
                                                    <span>cloud.production.app</span>
                                                </div>

                                                <div className="w-8" />
                                            </div>

                                            {/* Window Canvas / Image */}
                                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                                                <img
                                                    src={getImageUrl(p.image)}
                                                    alt={p.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                                                    loading="lazy"
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                                            </div>
                                        </div>

                                        {/* Project Title & Action Arrow */}
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-bold text-zinc-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400 transition-colors leading-tight">
                                                {p.title}
                                            </h4>

                                            <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 group-hover:border-violet-500/50 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors flex-shrink-0">
                                                <ArrowUpRight size={13} />
                                            </div>
                                        </div>

                                        {/* Project Description */}
                                        <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                            {p.description}
                                        </p>
                                    </div>

                                    {/* Tech Tags */}
                                    {p.tags && p.tags.length > 0 && (
                                        <div className="mt-3.5 flex flex-wrap gap-1 pt-2.5 border-t border-zinc-200/70 dark:border-white/[0.06]">
                                            {p.tags.slice(0, 3).map((tag, tagIndex) => (
                                                <span
                                                    key={tagIndex}
                                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-600 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-zinc-300"
                                                >
                                                    <span className="size-1 rounded-full bg-emerald-500" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {p.tags.length > 3 && (
                                                <span className="rounded-md border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-zinc-500">
                                                    +{p.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
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
                                className="luxury-btn-secondary flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
