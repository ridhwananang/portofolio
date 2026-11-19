import type { TaskStatus } from '@/components/studio/pms/kanban-task-modal';

export interface KanbanColumnConfig {
    id: TaskStatus;
    title: string;
    shortTitle: string;
    topHairline: string;
    borderClass: string;
    dropHighlightClass: string;
    dotClass: string;
    dotPulse?: boolean;
    badgeClass: string;
    barClass: string;
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
    {
        id: 'todo',
        title: 'To Do',
        shortTitle: 'To Do',
        topHairline: 'from-transparent via-slate-400/60 to-transparent',
        borderClass: 'border-slate-200/90 dark:border-white/10',
        dropHighlightClass:
            'ring-2 ring-slate-400/50 border-slate-400 bg-slate-100/90 dark:bg-slate-900/90',
        dotClass: 'bg-slate-400',
        badgeClass:
            'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        barClass: 'bg-slate-400',
    },
    {
        id: 'in_progress',
        title: 'In Progress',
        shortTitle: 'Progress',
        topHairline: 'from-transparent via-indigo-500/75 to-transparent',
        borderClass: 'border-indigo-300/65 dark:border-indigo-500/25',
        dropHighlightClass:
            'ring-2 ring-indigo-500/55 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/55',
        dotClass: 'bg-indigo-500',
        dotPulse: true,
        badgeClass:
            'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
        barClass: 'bg-indigo-500',
    },
    {
        id: 'review',
        title: 'Review / QA',
        shortTitle: 'Review',
        topHairline: 'from-transparent via-amber-500/75 to-transparent',
        borderClass: 'border-amber-300/70 dark:border-amber-500/25',
        dropHighlightClass:
            'ring-2 ring-amber-500/55 border-amber-500 bg-amber-50/80 dark:bg-amber-950/55',
        dotClass: 'bg-amber-500',
        badgeClass:
            'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        barClass: 'bg-amber-500',
    },
    {
        id: 'done',
        title: 'Selesai',
        shortTitle: 'Selesai',
        topHairline: 'from-transparent via-emerald-500/75 to-transparent',
        borderClass: 'border-emerald-300/70 dark:border-emerald-500/25',
        dropHighlightClass:
            'ring-2 ring-emerald-500/55 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/55',
        dotClass: 'bg-emerald-500',
        badgeClass:
            'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        barClass: 'bg-emerald-500',
    },
];

export const KANBAN_STATUS_ORDER: TaskStatus[] = [
    'todo',
    'in_progress',
    'review',
    'done',
];

export function getXsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    const xsrfCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return xsrfCookie ? decodeURIComponent(xsrfCookie) : '';
}

export function formatDueBadge(dateStr?: string | null): {
    label: string;
    overdue: boolean;
    soon: boolean;
} | null {
    if (!dateStr) {
        return null;
    }

    const clean = dateStr.slice(0, 10);
    const parsed = new Date(`${clean}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
        (parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
        label: parsed.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        }),
        overdue: diffDays < 0,
        soon: diffDays >= 0 && diffDays <= 2,
    };
}

export function getPriorityAccentStrip(priority: string): string {
    switch (priority) {
        case 'urgent':
            return 'bg-gradient-to-b from-rose-500 to-pink-600';
        case 'high':
            return 'bg-gradient-to-b from-amber-400 to-orange-500';
        case 'medium':
            return 'bg-gradient-to-b from-sky-400 to-indigo-500';
        default:
            return 'bg-slate-300 dark:bg-slate-700';
    }
}
