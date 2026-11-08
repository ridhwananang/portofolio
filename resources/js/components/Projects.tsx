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
            <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Proyek Unggulan
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Studi kasus pengerjaan sistem aplikasi nyata berstandar produksi
                    </p>
                </div>

                {!loading && safeProjects.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-1 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs w-fit">
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
                            className="luxury-card flex animate-pulse flex-col gap-4 rounded-xl p-5"
                        >
                            <div className="aspect-[16/10] w-full rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Projects Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleProjects.map((p) => {
                            return (
                                <div
                                    key={p.title}
                                    className="luxury-card transform-gpu flex flex-col justify-between overflow-hidden rounded-xl p-5 sm:p-6 select-none transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-zinc-300 dark:hover:border-white/20 group"
                                >
                                    {/* Top Specular Rim Light */}
                                    <div className="specular-top" />

                                    <div>
                                        {/* Realistic Titanium Window Mockup Frame */}
                                        <div className="relative mb-4 overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-950 dark:border-white/10 shadow-md">
                                            {/* Window Header Toolbar */}
                                            <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-black/60 px-3.5 py-2 backdrop-blur-md">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="size-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_6px_rgba(255,95,86,0.6)]" />
                                                    <span className="size-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_6px_rgba(255,189,46,0.6)]" />
                                                    <span className="size-2.5 rounded-full bg-[#27C93F] shadow-[0_0_6px_rgba(39,201,63,0.6)]" />
                                                </div>

                                                <div className="flex items-center justify-center rounded-md border border-zinc-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.03] px-2.5 py-0.5 text-[9.5px] font-mono text-zinc-500 dark:text-zinc-400">
                                                    <span>cloud://preview.app</span>
                                                </div>

                                                <div className="w-8" />
                                            </div>

                                            {/* Screenshot display */}
                                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                                                <img
                                                    src={getImageUrl(p.image)}
                                                    alt={`${p.title} Screenshot`}
                                                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                {/* Ambient Glass Sheen */}
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 opacity-80" />
                                            </div>
                                        </div>

                                        {/* Tech Badges Row */}
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {p.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-md border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-100/70 dark:bg-white/[0.03] px-2.5 py-0.5 text-[9.5px] font-mono font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Project Title & Description */}
                                        <div>
                                            <h4 className="mb-1.5 flex items-center justify-between text-base sm:text-lg font-black text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                                                <span>{p.title}</span>
                                                <div className="flex size-7 items-center justify-center rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-colors">
                                                    <ArrowUpRight
                                                        size={14}
                                                        className="text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-500"
                                                    />
                                                </div>
                                            </h4>
                                            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-normal">
                                                {p.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Architectural Meta Footer */}
                                    <div className="mt-5 flex items-center gap-3 border-t border-zinc-200/70 dark:border-white/[0.07] pt-3.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                            Clean Arch
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Cloud size={12} className="text-sky-500" />
                                            S3 Bucket
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Layers size={12} className="text-violet-500" />
                                            Inertia
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeProjects.length > ITEMS_PER_PAGE && (
                        <div className="mt-8 flex justify-center w-full">
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
                                className="luxury-btn-secondary flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200"
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
