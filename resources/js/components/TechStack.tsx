import { Terminal } from 'lucide-react';
import { useState } from 'react';
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
}

export default function TechStack({ techStacks, loading }: TechStackProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        <section id="tech-stack" className="w-full py-2">
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
                /* Grid Configuration */
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {techStacks.map((t, idx) => {
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
                            <div
                                key={t.name}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`glass-card relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-[1.8rem] border p-6 select-none ${
                                    isHovered
                                        ? `${hoverBorder} shadow-lg shadow-slate-100/50 dark:shadow-none`
                                        : 'border-slate-200/50 dark:border-slate-800/40'
                                } group`}
                            >
                                {/* Background glows on hover */}
                                <div
                                    className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-l opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${hoverGlow}`}
                                ></div>

                                {/* Icon Container with custom brand logo and Category badge */}
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex items-center justify-center rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/60`}
                                    >
                                        {renderIcon(t.icon_name)}
                                    </div>

                                    {/* Category tag */}
                                    <span className="rounded-lg bg-slate-100/70 px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase dark:bg-slate-800/80 dark:text-slate-400">
                                        {t.badge}
                                    </span>
                                </div>

                                {/* Typography Details */}
                                <div>
                                    <h4 className="mb-2 text-lg font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                                        {t.name}
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        {t.description}
                                    </p>
                                </div>

                                {/* Decorative hover indicator strip */}
                                <div
                                    className={`absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r ${stripColor} transition-transform duration-300 ${
                                        isHovered ? 'scale-x-100' : 'scale-x-0'
                                    }`}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
