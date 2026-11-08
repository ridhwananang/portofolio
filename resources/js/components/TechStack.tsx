import { Terminal, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
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
            return <Terminal className="h-5 w-5 text-zinc-500" />;
        }

        const iconClass = 'h-5 w-5';

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
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Tech Stack
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Peralatan dan framework utama yang digunakan dalam produksi
                    </p>
                </div>

                {!loading && safeTechStacks.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-mono text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
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
                            className="glass-card relative flex animate-pulse flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                                <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-850"></div>
                            </div>
                            <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Grid Configuration */}
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        <AnimatePresence initial={false}>
                            {visibleTechStacks.map((t, idx) => {
                                let matchedHighlights: string[] = [];

                                if (t.name.includes('Laravel')) matchedHighlights = techHighlights.Laravel;
                                else if (t.name.includes('PHP')) matchedHighlights = techHighlights.PHP;
                                else if (t.name.includes('React')) matchedHighlights = techHighlights.React;
                                else if (t.name.includes('JavaScript')) matchedHighlights = techHighlights.JavaScript;
                                else if (t.name.includes('SQL')) matchedHighlights = techHighlights.MySQL;
                                else if (t.name.includes('MongoDB')) matchedHighlights = techHighlights.MongoDB;
                                else if (t.name.includes('HTML5')) matchedHighlights = techHighlights.HTML5;
                                else if (t.name.includes('CSS')) matchedHighlights = techHighlights.CSS;

                                return (
                                    <motion.div
                                        key={t.id ?? `${t.name}-${idx}`}
                                        initial={idx >= initialCount ? { opacity: 0, y: 12 } : false}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{
                                            duration: 0.2,
                                            delay: idx >= initialCount ? (idx - initialCount) * 0.04 : 0,
                                            ease: 'easeOut',
                                        }}
                                        className="glass-card transform-gpu relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-4 sm:p-5 select-none transition-all duration-200 hover:border-zinc-300 hover:shadow-xs dark:border-white/10 dark:bg-[#0f1117] dark:hover:border-white/20 group"
                                    >
                                        <div>
                                            {/* Top Icon & Category Row */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs">
                                                    {renderIcon(t.icon_name)}
                                                </div>

                                                <span className="rounded px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 dark:text-zinc-400">
                                                    {t.badge}
                                                </span>
                                            </div>

                                            {/* Title & Description */}
                                            <div>
                                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                                                    {t.name}
                                                </h4>
                                                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Highlights pills */}
                                        {matchedHighlights && matchedHighlights.length > 0 && (
                                            <div className="mt-3.5 flex flex-wrap gap-1 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                                                {matchedHighlights.map((hl) => (
                                                    <span
                                                        key={hl}
                                                        className="rounded px-1.5 py-0.5 text-[9.5px] font-mono text-zinc-600 bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900/60 dark:border-zinc-800/60 dark:text-zinc-400"
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
                        <div className="mt-6 flex justify-center">
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
