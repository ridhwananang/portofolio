import { FolderGit2, ArrowUpRight, CheckCircle2, Layers, ChevronDown, ChevronUp, Cloud, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import ProjectPreviewModal from './ProjectPreviewModal';

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
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
        };
        updateMatch(mediaQuery);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', updateMatch);
            return () => mediaQuery.removeEventListener('change', updateMatch);
        } else {
            mediaQuery.addListener(updateMatch);
            return () => mediaQuery.removeListener(updateMatch);
        }
    }, []);

    const safeProjects = Array.isArray(projects) ? projects : [];
    const effectiveLimit = isMobile ? 3 : ITEMS_PER_PAGE;
    const visibleProjects = isExpanded ? safeProjects : safeProjects.slice(0, effectiveLimit);

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
                    <div className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-mono font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300 shadow-2xs w-fit">
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
                            <div className="aspect-[2/1] w-full rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-850"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Projects Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence initial={false}>
                            {visibleProjects.map((p, idx) => {
                                return (
                                    <motion.div
                                        key={p.title}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="h-full"
                                    >
                                        <div
                                            className="luxury-card luxury-card-interactive transform-gpu relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-4.5 select-none transition-all duration-300 group"
                                        >
                                            {/* Top Specular Rim */}
                                            <div className="specular-top" />

                                            <div>
                                                {/* Realistic Titanium Window Mockup Frame */}
                                                <div
                                                    onClick={() => setSelectedProject(p)}
                                                    className="relative mb-3.5 overflow-hidden rounded-lg border border-zinc-200/90 bg-zinc-100 dark:border-blue-400/15 dark:bg-[#091126] shadow-sm cursor-pointer group/mockup"
                                                    title="Klik untuk melihat layar penuh"
                                                >
                                                    {/* Window Header Toolbar */}
                                                    <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-100 px-3 py-1.5 dark:border-blue-400/15 dark:bg-[#091126]">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="size-2 rounded-full bg-[#FF5F56]" />
                                                            <span className="size-2 rounded-full bg-[#FFBD2E]" />
                                                            <span className="size-2 rounded-full bg-[#27C93F]" />
                                                        </div>

                                                        <div className="flex items-center gap-1 rounded border border-zinc-200/80 bg-white/80 px-2 py-0.5 text-[8.5px] font-mono text-zinc-600 dark:border-blue-400/15 dark:bg-[#0c162f]/80 dark:text-amber-300/85">
                                                            <Cloud size={9} className="text-amber-500 dark:text-amber-400" />
                                                            <span>cloud.production.app</span>
                                                        </div>

                                                        <div className="flex items-center gap-1 text-[8.5px] font-mono text-zinc-400 dark:text-zinc-500 group-hover/mockup:text-amber-500 transition-colors">
                                                            <Maximize2 size={10} />
                                                        </div>
                                                    </div>

                                                    {/* Window Canvas / Image (2:1 full view ratio matching 1890x945 resolution) */}
                                                    <div className="relative aspect-[2/1] w-full overflow-hidden bg-zinc-100 dark:bg-[#091126]">
                                                        <img
                                                            src={getImageUrl(p.image)}
                                                            alt={p.title}
                                                            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover/mockup:scale-102"
                                                            loading="lazy"
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40 dark:from-black/40" />

                                                        {/* Hover Overlay: Buka Layar Penuh */}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-2xs transition-opacity duration-200 group-hover/mockup:opacity-100">
                                                            <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-[#080e21]/90 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-xl">
                                                                <Maximize2 size={12} className="text-amber-400" />
                                                                <span>Lihat Layar Penuh</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Project Title & Action Arrow */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4
                                                        onClick={() => setSelectedProject(p)}
                                                        className="text-sm font-bold text-zinc-900 group-hover:text-amber-500 dark:text-white dark:group-hover:text-amber-300 transition-colors leading-tight cursor-pointer"
                                                    >
                                                        {p.title}
                                                    </h4>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedProject(p)}
                                                        className="cursor-pointer flex size-6 items-center justify-center rounded-md border border-zinc-200/80 dark:border-blue-400/15 bg-zinc-50 dark:bg-[#091126] text-zinc-500 dark:text-zinc-400 group-hover:border-amber-400/50 group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors flex-shrink-0"
                                                        title="Lihat Detail Proyek"
                                                    >
                                                        <ArrowUpRight size={13} />
                                                    </button>
                                                </div>

                                                {/* Project Description */}
                                                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                                    {p.description}
                                                </p>
                                            </div>

                                            {/* Tech Tags */}
                                            {p.tags && p.tags.length > 0 && (
                                                <div className="mt-3.5 flex flex-wrap gap-1 pt-2.5 border-t border-zinc-200/70 dark:border-blue-400/15">
                                                    {p.tags.slice(0, 3).map((tag, tagIndex) => (
                                                        <span
                                                            key={tagIndex}
                                                            className="inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-600 dark:border-blue-400/15 dark:bg-[#0c162f]/80 dark:text-blue-200/90"
                                                        >
                                                            <span className="size-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {p.tags.length > 3 && (
                                                        <span className="rounded-md border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 dark:border-blue-400/15 dark:bg-[#0c162f]/80 dark:text-zinc-400">
                                                            +{p.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Expand/Collapse Button */}
                    {!loading && safeProjects.length > effectiveLimit && (
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

            {/* High-Resolution Full-Screen Project Lightbox Modal */}
            <ProjectPreviewModal
                isOpen={Boolean(selectedProject)}
                onClose={() => setSelectedProject(null)}
                project={selectedProject}
            />
        </section>
    );
}
