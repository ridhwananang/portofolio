import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun, CheckCircle2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const options: {
        value: Appearance;
        icon: LucideIcon;
        label: string;
        description: string;
        preview: React.ReactNode;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            label: 'Mode Terang',
            description: 'Tampilan cerah dengan kontras tinggi di siang hari.',
            preview: (
                <div className="w-full h-24 rounded-xl bg-[#F4F6FA] border border-slate-200 p-2.5 space-y-2 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="h-2 w-12 rounded-full bg-slate-300" />
                        <div className="size-2 rounded-full bg-violet-500" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-2 w-3/4 rounded-full bg-slate-300" />
                        <div className="h-1.5 w-1/2 rounded-full bg-slate-200" />
                    </div>
                    <div className="flex gap-1.5">
                        <div className="h-4 flex-1 rounded-md bg-white border border-slate-200 shadow-2xs" />
                        <div className="h-4 flex-1 rounded-md bg-white border border-slate-200 shadow-2xs" />
                    </div>
                </div>
            ),
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Mode Gelap',
            description: 'Tampilan redup yang nyaman untuk bekerja di malam hari.',
            preview: (
                <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800 p-2.5 space-y-2 flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="h-2 w-12 rounded-full bg-slate-700" />
                        <div className="size-2 rounded-full bg-violet-400" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-2 w-3/4 rounded-full bg-slate-700" />
                        <div className="h-1.5 w-1/2 rounded-full bg-slate-800" />
                    </div>
                    <div className="flex gap-1.5">
                        <div className="h-4 flex-1 rounded-md bg-slate-900 border border-slate-800 shadow-2xs" />
                        <div className="h-4 flex-1 rounded-md bg-slate-900 border border-slate-800 shadow-2xs" />
                    </div>
                </div>
            ),
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'Sistem Otomatis',
            description: 'Menyesuaikan otomatis dengan preferensi tema OS Anda.',
            preview: (
                <div className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex shadow-xs">
                    <div className="w-1/2 h-full bg-[#F4F6FA] p-2 flex flex-col justify-between border-r border-slate-200">
                        <div className="h-2 w-8 rounded-full bg-slate-300" />
                        <div className="h-2 w-full rounded-full bg-slate-300" />
                        <div className="h-3 w-full rounded-md bg-white border border-slate-200" />
                    </div>
                    <div className="w-1/2 h-full bg-slate-950 p-2 flex flex-col justify-between">
                        <div className="h-2 w-8 rounded-full bg-slate-700 self-end" />
                        <div className="h-2 w-full rounded-full bg-slate-700" />
                        <div className="h-3 w-full rounded-md bg-slate-900 border border-slate-800" />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div
            className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}
            {...props}
        >
            {options.map(({ value, icon: Icon, label, description, preview }) => {
                const isActive = appearance === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'group text-left p-4 rounded-[1.6rem] border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4',
                            isActive
                                ? 'border-violet-500 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/10'
                                : 'border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 hover:border-violet-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
                        )}
                    >
                        {preview}

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon
                                        className={cn(
                                            'size-4 transition-colors',
                                            isActive
                                                ? 'text-violet-600 dark:text-violet-400'
                                                : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'text-xs sm:text-sm font-bold transition-colors',
                                            isActive
                                                ? 'text-violet-700 dark:text-violet-300 font-extrabold'
                                                : 'text-slate-800 dark:text-slate-200'
                                        )}
                                    >
                                        {label}
                                    </span>
                                </div>
                                {isActive && (
                                    <CheckCircle2 className="size-4 text-violet-600 dark:text-violet-400 shrink-0" />
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
