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
    initialCount = 4,
}: TechStackProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const safeTechStacks = Array.isArray(techStacks) ? techStacks : [];

    useEffect(() => {
        setIsExpanded(false);
    }, [safeTechStacks.length]);

    const visibleTechStacks = isExpanded
        ? safeTechStacks
        : safeTechStacks.slice(0, initialCount);

    const renderIcon = (iconName: string) => {
        const IconComponent = iconsMap[iconName];

        if (!IconComponent) {
            return <Terminal className="h-6 w-6 text-zinc-400" />;
        }

        const iconClass = 'h-6 w-6 transition-transform duration-300 group-hover:scale-110';

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
        <section className="w-full py-1">
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Tech Stack
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Peralatan dan framework utama yang digunakan dalam pengembangan sistem produksi
                    </p>
                </div>

                {!loading && safeTechStacks.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3 py-1 text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
                        <Sparkles size={11} className="text-violet-500" />
                        <span>{safeTechStacks.length} Core Tools</span>
                    </span>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                            key={n}
                            className="luxury-card relative flex animate-pulse flex-col gap-3 rounded-xl p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="size-10 rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
                                <div className="h-5 w-16 rounded bg-zinc-100 dark:bg-zinc-850"></div>
                            </div>
                            <div className="h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Grid Configuration */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AnimatePresence initial={false}>
                            {visibleTechStacks.map((t, idx) => {
                                const isHovered = hoveredIndex === idx;

                                let hoverBorder = 'hover:border-violet-500/50 dark:hover:border-violet-500/40';
                                let hoverGlow = 'from-violet-500/10 to-transparent';
                                let iconBg = 'border-violet-500/20 bg-violet-500/5';
                                let matchedHighlights: string[] = [];

                                if (t.name.includes('Laravel')) {
                                    hoverBorder = 'hover:border-red-500/50 dark:hover:border-red-500/40';
                                    hoverGlow = 'from-red-500/10 to-transparent';
                                    iconBg = 'border-red-500/20 bg-red-500/5 shadow-[0_2px_12px_rgba(255,45,32,0.15)]';
                                    matchedHighlights = techHighlights.Laravel;
                                } else if (t.name.includes('PHP')) {
                                    hoverBorder = 'hover:border-indigo-500/50 dark:hover:border-indigo-500/40';
                                    hoverGlow = 'from-indigo-500/10 to-transparent';
                                    iconBg = 'border-indigo-500/20 bg-indigo-500/5 shadow-[0_2px_12px_rgba(119,123,180,0.15)]';
                                    matchedHighlights = techHighlights.PHP;
                                } else if (t.name.includes('React')) {
                                    hoverBorder = 'hover:border-sky-400/50 dark:hover:border-sky-500/40';
                                    hoverGlow = 'from-sky-400/10 to-transparent';
                                    iconBg = 'border-sky-400/20 bg-sky-500/5 shadow-[0_2px_12px_rgba(97,218,251,0.15)]';
                                    matchedHighlights = techHighlights.React;
                                } else if (t.name.includes('JavaScript')) {
                                    hoverBorder = 'hover:border-amber-400/50 dark:hover:border-amber-500/40';
                                    hoverGlow = 'from-amber-400/10 to-transparent';
                                    iconBg = 'border-amber-400/20 bg-amber-500/5 shadow-[0_2px_12px_rgba(247,223,30,0.15)]';
                                    matchedHighlights = techHighlights.JavaScript;
                                } else if (t.name.includes('SQL')) {
                                    hoverBorder = 'hover:border-blue-500/50 dark:hover:border-blue-500/40';
                                    hoverGlow = 'from-blue-500/10 to-transparent';
                                    iconBg = 'border-blue-500/20 bg-blue-500/5 shadow-[0_2px_12px_rgba(68,121,161,0.15)]';
                                    matchedHighlights = techHighlights.MySQL;
                                } else if (t.name.includes('MongoDB')) {
                                    hoverBorder = 'hover:border-emerald-500/50 dark:hover:border-emerald-500/40';
                                    hoverGlow = 'from-emerald-500/10 to-transparent';
                                    iconBg = 'border-emerald-500/20 bg-emerald-500/5 shadow-[0_2px_12px_rgba(71,162,72,0.15)]';
                                    matchedHighlights = techHighlights.MongoDB;
                                } else if (t.name.includes('HTML5')) {
                                    hoverBorder = 'hover:border-orange-500/50 dark:hover:border-orange-500/40';
                                    hoverGlow = 'from-orange-500/10 to-transparent';
                                    iconBg = 'border-orange-500/20 bg-orange-500/5 shadow-[0_2px_12px_rgba(227,79,38,0.15)]';
                                    matchedHighlights = techHighlights.HTML5;
                                } else if (t.name.includes('CSS')) {
                                    hoverBorder = 'hover:border-blue-600/50 dark:hover:border-blue-600/40';
                                    hoverGlow = 'from-blue-600/10 to-transparent';
                                    iconBg = 'border-blue-600/20 bg-blue-600/5 shadow-[0_2px_12px_rgba(21,114,182,0.15)]';
                                    matchedHighlights = techHighlights.CSS;
                                }

                                return (
                                    <motion.div
                                        key={t.id ?? `${t.name}-${idx}`}
                                        initial={idx >= initialCount ? { opacity: 0, y: 12 } : false}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: idx >= initialCount ? (idx - initialCount) * 0.04 : 0,
                                            ease: 'easeOut',
                                        }}
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={`luxury-card transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl p-5 select-none transition-all duration-300 hover:-translate-y-1 ${hoverBorder} group`}
                                    >
                                        {/* Top Specular Rim Light */}
                                        <div className="specular-top" />

                                        {/* Ambient brand glow on hover */}
                                        <div
                                            className={`pointer-events-none absolute top-0 right-0 size-32 rounded-full bg-gradient-to-l opacity-0 transition-opacity duration-300 group-hover:opacity-20 ${hoverGlow}`}
                                        />

                                        <div className="relative z-10">
                                            {/* Top Icon & Category Row */}
                                            <div className="flex items-center justify-between mb-3.5">
                                                <div
                                                    className={`flex size-11 items-center justify-center rounded-xl border p-2 shadow-inner transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
                                                >
                                                    {renderIcon(t.icon_name)}
                                                </div>

                                                <span className="rounded-md border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-white/[0.04] px-2.5 py-1 text-[9.5px] font-mono font-bold tracking-wider text-zinc-600 dark:text-zinc-300 uppercase shadow-2xs">
                                                    {t.badge}
                                                </span>
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white mb-1 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                                                    {t.name}
                                                </h4>
                                                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-normal">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Highlights pills */}
                                        {matchedHighlights && matchedHighlights.length > 0 && (
                                            <div className="relative z-10 mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-zinc-200/70 dark:border-white/[0.07]">
                                                {matchedHighlights.map((hl) => (
                                                    <span
                                                        key={hl}
                                                        className="rounded-md border border-zinc-200/70 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.03] px-2 py-0.5 text-[9.5px] font-mono font-medium text-zinc-600 dark:text-zinc-300 shadow-2xs"
                                                    >
                                                        {hl}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Expand/Collapse Toggle Button */}
                    {!loading && safeTechStacks.length > initialCount && (
                        <div className="mt-7 flex justify-center">
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
                                className="luxury-btn-secondary flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200"
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
