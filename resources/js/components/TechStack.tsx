import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
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

    // Reset expand when techStacks count changes
    useEffect(() => {
        setIsExpanded(false);
    }, [techStacks.length]);

    const visibleTechStacks = isExpanded
        ? techStacks
        : techStacks.slice(0, initialCount);

    const renderIcon = (iconName: string) => {
        const IconComponent = iconsMap[iconName];

        if (!IconComponent) {
            return <Terminal className="h-8 w-8 text-slate-500" />;
        }

        const iconClass = 'h-8 w-8';

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
            {/* Title Header with custom subtle line decor */}
            <div className="mb-11 flex items-center gap-3.5">
                <div className="rounded-2xl border border-slate-200/50 bg-white p-2.5 text-violet-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-violet-400">
                    <Terminal
                        size={22}
                        id="tech-title-icon"
                        strokeWidth={2.2}
                    />
                </div>
                <div>
                    <h3 className="flex items-baseline text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Tech{' '}
                        <span className="ml-2 bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text font-mono font-extrabold text-transparent italic">
                            Stack
                        </span>
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Teknologi andalan yang didesain untuk keandalan &
                        kecepatan
                    </p>
                </div>
            </div>

            {loading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                        <div
                            key={n}
                            className="glass-card relative flex animate-pulse flex-col gap-4 overflow-hidden rounded-[1.8rem] border border-slate-200/50 p-6 dark:border-slate-800/40"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                                <div className="h-6 w-16 rounded-lg bg-slate-100 dark:bg-slate-900"></div>
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <AnimatePresence initial={false}>
                            {visibleTechStacks.map((t, idx) => {
                                const isHovered = hoveredIndex === idx;

                                // Brand-specific borders and glow colors
                                let hoverBorder =
                                    'hover:border-violet-500/40 dark:hover:border-violet-500/35';
                                let hoverGlow = 'from-violet-500/10 to-transparent';
                                let stripColor = 'from-blue-500 to-violet-500';

                                if (t.name.includes('Laravel')) {
                                    hoverBorder =
                                        'hover:border-red-500/40 dark:hover:border-red-500/30';
                                    hoverGlow =
                                        'from-red-500/10 to-transparent dark:from-red-500/5';
                                    stripColor = 'from-red-500 to-rose-500';
                                } else if (t.name.includes('PHP')) {
                                    hoverBorder =
                                        'hover:border-indigo-500/40 dark:hover:border-indigo-500/30';
                                    hoverGlow =
                                        'from-indigo-500/10 to-transparent dark:from-indigo-500/5';
                                    stripColor = 'from-indigo-500 to-blue-500';
                                } else if (t.name.includes('React')) {
                                    hoverBorder =
                                        'hover:border-sky-400/50 dark:hover:border-sky-500/30';
                                    hoverGlow =
                                        'from-sky-400/10 to-transparent dark:from-sky-400/5';
                                    stripColor = 'from-sky-400 to-blue-500';
                                } else if (t.name.includes('JavaScript')) {
                                    hoverBorder =
                                        'hover:border-amber-400/40 dark:hover:border-amber-500/30';
                                    hoverGlow =
                                        'from-amber-400/10 to-transparent dark:from-amber-500/5';
                                    stripColor = 'from-amber-400 to-yellow-500';
                                } else if (t.name.includes('SQL')) {
                                    hoverBorder =
                                        'hover:border-blue-500/40 dark:hover:border-blue-500/30';
                                    hoverGlow =
                                        'from-blue-500/10 to-transparent dark:from-blue-500/5';
                                    stripColor = 'from-blue-500 to-teal-500';
                                } else if (t.name.includes('MongoDB')) {
                                    hoverBorder =
                                        'hover:border-emerald-500/45 dark:hover:border-emerald-500/30';
                                    hoverGlow =
                                        'from-emerald-500/10 to-transparent dark:from-emerald-500/5';
                                    stripColor = 'from-emerald-500 to-green-500';
                                } else if (t.name.includes('HTML5')) {
                                    hoverBorder =
                                        'hover:border-orange-500/40 dark:hover:border-orange-500/30';
                                    hoverGlow =
                                        'from-orange-500/10 to-transparent dark:from-orange-500/5';
                                    stripColor = 'from-orange-550 to-red-500';
                                } else if (t.name.includes('CSS')) {
                                    hoverBorder =
                                        'hover:border-blue-600/40 dark:hover:border-blue-600/30';
                                    hoverGlow =
                                        'from-blue-600/10 to-transparent dark:from-blue-600/5';
                                    stripColor = 'from-blue-600 to-indigo-600';
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
                                        className={`glass-card relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-[1.8rem] border p-6 select-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                                            isHovered
                                                ? `${hoverBorder} bg-white/90 shadow-xl shadow-slate-100/50 dark:bg-slate-900/80 dark:shadow-none`
                                                : 'border-slate-200/70 bg-white/70 dark:border-slate-800/70 dark:bg-slate-900/50'
                                        } group`}
                                    >
                                        {/* Background glows on hover */}
                                        <div
                                            className={`absolute top-0 right-0 h-28 w-28 rounded-full bg-gradient-to-l opacity-0 transition-opacity duration-300 group-hover:opacity-15 ${hoverGlow}`}
                                        ></div>

                                        {/* Icon Container with custom brand logo and Category badge */}
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="flex items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3.5 shadow-xs transition-transform duration-300 group-hover:scale-105 dark:border-slate-800/80 dark:bg-slate-950/70"
                                            >
                                                {renderIcon(t.icon_name)}
                                            </div>

                                            {/* Category tag */}
                                            <span className="rounded-lg border border-slate-200/50 bg-slate-100/80 px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                                                {t.badge}
                                            </span>
                                        </div>

                                        {/* Typography Details */}
                                        <div>
                                            <h4 className="mb-1.5 text-lg font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                                                {t.name}
                                            </h4>
                                            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                {t.description}
                                            </p>
                                        </div>

                                        {/* Decorative hover indicator strip */}
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

                    {/* Toggle Button */}
                    {!loading && techStacks.length > initialCount && (
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
                                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-violet-500 hover:text-violet-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:text-violet-400 cursor-pointer active:scale-95"
                            >
                                <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}</span>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
