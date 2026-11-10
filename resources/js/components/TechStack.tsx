import { Terminal, ChevronDown, ChevronUp, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { SiLaravel, SiPhp, SiReact, SiJavascript, SiMysql, SiMongodb, SiHtml5, SiCss } from 'react-icons/si';

const iconsMap: Record<string, React.ComponentType<any>> = {
    SiLaravel,
    SiPhp,
    SiReact,
    SiJavascript,
    SiMysql,
    SiMongodb,
    SiHtml5,
    SiCss,
};

const techHighlights: Record<string, string[]> = {
    Laravel: ['Eloquent ORM', 'Queues & Events', 'REST APIs', 'S3 Storage'],
    PHP: ['PHP 8.4+', 'OOP & SOLID', 'PSR-12 Standards'],
    React: ['React 19', 'TypeScript', 'Inertia.js SPA', 'Custom Hooks'],
    JavaScript: ['ESNext', 'Asynchronous / Promises', 'DOM & APIs'],
    MySQL: ['Schema Design', 'Indexing & Optimization', 'Transactions'],
    MongoDB: ['NoSQL Documents', 'Aggregation Pipelines'],
    HTML5: ['Semantic Layouts', 'SEO & Accessibility'],
    CSS: ['Tailwind CSS v4', 'Responsive Design', 'Fluid Animations'],
};

interface TechStackItem {
    id?: number;
    name: string;
    description: string;
    badge: string;
    color: string;
    text_color: string;
    accent: string;
    icon_name: string;
}

interface TechStackProps {
    techStacks: TechStackItem[];
    loading: boolean;
    initialCount?: number;
}

export default function TechStack({
    techStacks,
    loading,
    initialCount = 8,
}: TechStackProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
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

    const safeTechStacks = Array.isArray(techStacks) ? techStacks : [];

    useEffect(() => {
        setIsExpanded(false);
    }, [safeTechStacks.length]);

    const effectiveLimit = isMobile ? 3 : initialCount;

    const visibleTechStacks = isExpanded
        ? safeTechStacks
        : safeTechStacks.slice(0, effectiveLimit);

    const renderIcon = (iconName: string) => {
        const IconComponent = iconsMap[iconName];

        if (!IconComponent) {
            return <Terminal className="h-5 w-5 text-zinc-400" />;
        }

        const iconClass = 'h-5 w-5 transition-transform duration-300 group-hover:scale-110';

        if (iconName === 'SiLaravel') return <IconComponent className={`${iconClass} text-[#FF2D20]`} />;
        if (iconName === 'SiPhp') return <IconComponent className={`${iconClass} text-[#777BB4]`} />;
        if (iconName === 'SiReact') return <IconComponent className={`${iconClass} text-[#61DAFB]`} />;
        if (iconName === 'SiJavascript') return <IconComponent className={`${iconClass} text-[#F7DF1E]`} />;
        if (iconName === 'SiMysql') return <IconComponent className={`${iconClass} text-[#4479A1]`} />;
        if (iconName === 'SiMongodb') return <IconComponent className={`${iconClass} text-[#47A248]`} />;
        if (iconName === 'SiHtml5') return <IconComponent className={`${iconClass} text-[#E34F26]`} />;
        if (iconName === 'SiCss') return <IconComponent className={`${iconClass} text-[#1572B6]`} />;

        return <IconComponent className={iconClass} />;
    };

    return (
        <section className="w-full">
            {/* Section Header */}
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Tech Stack
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Peralatan dan framework utama yang digunakan dalam pengembangan sistem produksi
                    </p>
                </div>

                {!loading && safeTechStacks.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-mono font-bold text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300 shadow-2xs w-fit">
                        <Sparkles size={11} className="text-amber-500 dark:text-amber-400" />
                        <span>{safeTechStacks.length} Core Tools</span>
                    </span>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div
                            key={n}
                            className="luxury-card relative flex animate-pulse flex-col gap-2.5 rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="size-9 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                                <div className="h-4 w-14 rounded bg-zinc-100 dark:bg-zinc-850"></div>
                            </div>
                            <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-850"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Compact 4-Column Grid */}
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                        <AnimatePresence initial={false}>
                            {visibleTechStacks.map((t, idx) => {
                                let matchedHighlights: string[] = [];

                                if (t.name.includes('Laravel')) {
                                    matchedHighlights = techHighlights.Laravel;
                                } else if (t.name.includes('PHP')) {
                                    matchedHighlights = techHighlights.PHP;
                                } else if (t.name.includes('React')) {
                                    matchedHighlights = techHighlights.React;
                                } else if (t.name.includes('JavaScript')) {
                                    matchedHighlights = techHighlights.JavaScript;
                                } else if (t.name.includes('MySQL')) {
                                    matchedHighlights = techHighlights.MySQL;
                                } else if (t.name.includes('MongoDB')) {
                                    matchedHighlights = techHighlights.MongoDB;
                                } else if (t.name.includes('HTML')) {
                                    matchedHighlights = techHighlights.HTML5;
                                } else if (t.name.includes('CSS')) {
                                    matchedHighlights = techHighlights.CSS;
                                }

                                return (
                                    <motion.div
                                        key={t.name}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="h-full"
                                    >
                                        <div
                                            onMouseEnter={() => setHoveredIndex(idx)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            className="luxury-card luxury-card-interactive transform-gpu relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-4.5 select-none group"
                                        >
                                            {/* Specular Top Rim */}
                                            <div className="specular-top" />

                                            <div>
                                                {/* Card Header Dock */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex size-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-blue-400/15 dark:bg-[#091126] shadow-xs">
                                                        {renderIcon(t.icon_name)}
                                                    </div>

                                                    <span className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[9.5px] font-mono font-bold tracking-wider text-zinc-500 uppercase dark:border-blue-400/15 dark:bg-[#091126] dark:text-amber-300/80">
                                                        {t.badge}
                                                    </span>
                                                </div>

                                                {/* Tech Name */}
                                                <h4 className="text-sm font-bold text-zinc-900 transition-colors group-hover:text-amber-500 dark:text-white dark:group-hover:text-amber-300 leading-tight">
                                                    {t.name}
                                                </h4>

                                                {/* Description */}
                                                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                                    {t.description}
                                                </p>
                                            </div>

                                            {/* Capability Micro-Chips */}
                                            {matchedHighlights.length > 0 && (
                                                <div className="mt-3.5 flex flex-wrap gap-1 pt-2.5 border-t border-zinc-200/70 dark:border-blue-400/15">
                                                    {matchedHighlights.slice(0, 3).map((highlight) => (
                                                        <span
                                                            key={highlight}
                                                            className="rounded-md border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-600 dark:border-blue-400/15 dark:bg-[#0c162f]/80 dark:text-blue-200/90"
                                                        >
                                                            {highlight}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Expand/Collapse Toggle if more items */}
                    {safeTechStacks.length > effectiveLimit && (
                        <div className="mt-6 flex justify-center w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isExpanded) {
                                        document.getElementById('tech-stack')?.scrollIntoView({ behavior: 'smooth' });
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
