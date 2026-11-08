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

// Key tech highlights to showcase deep technical mastery
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

    // Reset expand when techStacks count changes
    useEffect(() => {
        setIsExpanded(false);
    }, [safeTechStacks.length]);

    const visibleTechStacks = isExpanded
        ? safeTechStacks
        : safeTechStacks.slice(0, initialCount);

    const renderIcon = (iconName: string) => {
        const IconComponent = iconsMap[iconName];

        if (!IconComponent) {
            return <Terminal className="h-7 w-7 text-slate-500" />;
        }

        const iconClass = 'h-7 w-7 transition-transform duration-300 group-hover:scale-110';

        if (iconName === 'SiLaravel') {
            return <IconComponent className={`${iconClass} text-[#FF2D20]`} />;
        }

        if (iconName === 'SiPhp') {
            return <IconComponent className={`${iconClass} text-[#777BB4]`} />;
        }

        if (iconName === 'SiReact') {
            return (
                <IconComponent
                    className={`${iconClass} animate-spin-slow text-[#61DAFB]`}
                />
            );
        }

        if (iconName === 'SiJavascript') {
            return (
                <IconComponent
                    className={`${iconClass} rounded bg-black text-[#F7DF1E]`}
                />
            );
        }

        if (iconName === 'SiMysql') {
            return <IconComponent className={`${iconClass} text-[#4479A1]`} />;
        }

        if (iconName === 'SiMongodb') {
            return <IconComponent className={`${iconClass} text-[#47A248]`} />;
        }

        if (iconName === 'SiHtml5') {
            return <IconComponent className={`${iconClass} text-[#E34F26]`} />;
        }

        if (iconName === 'SiCss') {
            return <IconComponent className={`${iconClass} text-[#1572B6]`} />;
        }

        return <IconComponent className={iconClass} />;
    };

    return (
        <section className="w-full py-2">
            {/* Title Header with modern section badge */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 text-violet-600 shadow-2xs dark:border-white/10 dark:bg-slate-900 dark:text-violet-400">
                        <Cpu size={22} id="tech-title-icon" strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Tech{' '}
                                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                                    Stack
                                </span>
                            </h3>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Peralatan dan framework utama yang digunakan dalam produksi
                        </p>
                    </div>
                </div>

                {!loading && safeTechStacks.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 text-[11px] font-mono font-bold text-slate-600 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300">
                        <Sparkles size={12} className="text-violet-500" />
                        {safeTechStacks.length} Core Tools
                    </span>
                )}
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                            key={n}
                            className="glass-card relative flex animate-pulse flex-col gap-4 overflow-hidden rounded-[2rem] border border-slate-200/60 p-6 dark:border-slate-800/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-6 w-20 rounded-lg bg-slate-100 dark:bg-slate-900"></div>
                            </div>
                            <div>
                                <div className="mb-2 h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                                <div className="mt-1.5 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Grid Configuration */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <AnimatePresence initial={false}>
                            {visibleTechStacks.map((t, idx) => {
                                const isHovered = hoveredIndex === idx;

                                // Brand-specific borders and glow colors
                                let hoverBorder = 'hover:border-violet-500/50 dark:hover:border-violet-500/40';
                                let hoverGlow = 'from-violet-500/10 to-transparent';
                                let stripColor = 'from-blue-500 to-violet-500';
                                let matchedHighlights: string[] = [];

                                if (t.name.includes('Laravel')) {
                                    hoverBorder = 'hover:border-red-500/50 dark:hover:border-red-500/40';
                                    hoverGlow = 'from-red-500/10 to-transparent';
                                    stripColor = 'from-red-500 to-rose-500';
                                    matchedHighlights = techHighlights.Laravel;
                                } else if (t.name.includes('PHP')) {
                                    hoverBorder = 'hover:border-indigo-500/50 dark:hover:border-indigo-500/40';
                                    hoverGlow = 'from-indigo-500/10 to-transparent';
                                    stripColor = 'from-indigo-500 to-blue-500';
                                    matchedHighlights = techHighlights.PHP;
                                } else if (t.name.includes('React')) {
                                    hoverBorder = 'hover:border-sky-400/50 dark:hover:border-sky-500/40';
                                    hoverGlow = 'from-sky-400/10 to-transparent';
                                    stripColor = 'from-sky-400 to-blue-500';
                                    matchedHighlights = techHighlights.React;
                                } else if (t.name.includes('JavaScript')) {
                                    hoverBorder = 'hover:border-amber-400/50 dark:hover:border-amber-500/40';
                                    hoverGlow = 'from-amber-400/10 to-transparent';
                                    stripColor = 'from-amber-400 to-yellow-500';
                                    matchedHighlights = techHighlights.JavaScript;
                                } else if (t.name.includes('SQL')) {
                                    hoverBorder = 'hover:border-blue-500/50 dark:hover:border-blue-500/40';
                                    hoverGlow = 'from-blue-500/10 to-transparent';
                                    stripColor = 'from-blue-500 to-teal-500';
                                    matchedHighlights = techHighlights.MySQL;
                                } else if (t.name.includes('MongoDB')) {
                                    hoverBorder = 'hover:border-emerald-500/50 dark:hover:border-emerald-500/40';
                                    hoverGlow = 'from-emerald-500/10 to-transparent';
                                    stripColor = 'from-emerald-500 to-green-500';
                                    matchedHighlights = techHighlights.MongoDB;
                                } else if (t.name.includes('HTML5')) {
                                    hoverBorder = 'hover:border-orange-500/50 dark:hover:border-orange-500/40';
                                    hoverGlow = 'from-orange-500/10 to-transparent';
                                    stripColor = 'from-orange-500 to-red-500';
                                    matchedHighlights = techHighlights.HTML5;
                                } else if (t.name.includes('CSS')) {
                                    hoverBorder = 'hover:border-blue-600/50 dark:hover:border-blue-600/40';
                                    hoverGlow = 'from-blue-600/10 to-transparent';
                                    stripColor = 'from-blue-600 to-indigo-600';
                                    matchedHighlights = techHighlights.CSS;
                                }

                                return (
                                    <motion.div
                                        key={t.id ?? `${t.name}-${idx}`}
                                        initial={idx >= initialCount ? { opacity: 0, y: 16 } : false}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: idx >= initialCount ? (idx - initialCount) * 0.05 : 0,
                                            ease: 'easeOut',
                                        }}
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={`glass-card transform-gpu relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] border p-6 select-none transition-all duration-300 hover:-translate-y-1 ${
                                            isHovered
                                                ? `${hoverBorder} bg-white/90 shadow-xl shadow-slate-200/50 dark:bg-slate-900/80 dark:shadow-black/30`
                                                : 'border-slate-200/80 bg-white/75 dark:border-white/10 dark:bg-slate-900/60'
                                        } group`}
                                    >
                                        {/* Ambient brand glow on hover */}
                                        <div
                                            className={`pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-l opacity-0 transition-opacity duration-300 group-hover:opacity-20 ${hoverGlow}`}
                                        ></div>

                                        <div>
                                            {/* Top Icon & Category Row */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 shadow-2xs transition-all duration-300 group-hover:shadow-md dark:border-white/10 dark:bg-slate-950/70">
                                                    {renderIcon(t.icon_name)}
                                                </div>

                                                <span className="rounded-lg border border-slate-200/70 bg-slate-100/80 px-2.5 py-1 text-[10px] font-mono font-extrabold tracking-widest text-slate-600 uppercase dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-300">
                                                    {t.badge}
                                                </span>
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h4 className="mb-1.5 text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                                                    {t.name}
                                                </h4>
                                                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tech key highlights pills */}
                                        {matchedHighlights && matchedHighlights.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800/70">
                                                {matchedHighlights.map((hl) => (
                                                    <span
                                                        key={hl}
                                                        className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[9.5px] font-semibold text-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
                                                    >
                                                        {hl}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Bottom active indicator line */}
                                        <div
                                            className={`absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r ${stripColor} transition-transform duration-300 ${
                                                isHovered ? 'scale-x-100' : 'scale-x-0'
                                            }`}
                                        ></div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Expand/Collapse Toggle Button */}
                    {!loading && safeTechStacks.length > initialCount && (
                        <div className="mt-8 flex justify-center">
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
