export interface StatusVisualMeta {
    label: string;
    badgeClass: string;
    dotClass: string;
}

export const PROJECT_STATUS_META: Record<string, StatusVisualMeta> = {
    planning: {
        label: 'Planning',
        badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25',
        dotClass: 'bg-sky-500',
    },
    in_progress: {
        label: 'In Progress',
        badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/25',
        dotClass: 'bg-indigo-500',
    },
    review: {
        label: 'Review',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/25',
        dotClass: 'bg-amber-500',
    },
    completed: {
        label: 'Completed',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/25',
        dotClass: 'bg-emerald-500',
    },
    on_hold: {
        label: 'On Hold',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/25',
        dotClass: 'bg-slate-400',
    },
};

export const TASK_STATUS_META: Record<'todo' | 'in_progress' | 'review' | 'done', StatusVisualMeta> = {
    todo: {
        label: 'To Do',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/25 hover:bg-slate-500/20',
        dotClass: 'bg-slate-400',
    },
    in_progress: {
        label: 'In Progress',
        badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
        dotClass: 'bg-indigo-500',
    },
    review: {
        label: 'Review QA',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
        dotClass: 'bg-amber-500',
    },
    done: {
        label: 'Selesai',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
        dotClass: 'bg-emerald-500',
    },
};

export const PRIORITY_META: Record<string, { label: string; badgeClass: string }> = {
    urgent: {
        label: 'Urgent',
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    },
    high: {
        label: 'High',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    },
    medium: {
        label: 'Medium',
        badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25',
    },
    low: {
        label: 'Low',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    },
};

export const SPRINT_STATUS_META: Record<string, { label: string; badgeClass: string }> = {
    active: {
        label: 'Aktif',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    },
    planned: {
        label: 'Terjadwal',
        badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    },
    completed: {
        label: 'Selesai',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    },
};

export function formatCurrencyIdr(value: number | string): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

const SHORT_MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatShortDateId(dateStr?: string | null): string {
    if (!dateStr) {
return '';
}

    const clean = String(dateStr).split('T')[0];
    const parts = clean.split('-');

    if (parts.length !== 3) {
return clean;
}

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (Number.isNaN(year) || month < 1 || month > 12 || Number.isNaN(day)) {
return clean;
}

    return `${String(day).padStart(2, '0')} ${SHORT_MONTHS_ID[month - 1]} ${year}`;
}

export function formatDateRangeId(start?: string | null, end?: string | null): string {
    if (!start && !end) {
return 'Jadwal belum diatur';
}

    if (start && !end) {
return `Mulai ${formatShortDateId(start)}`;
}

    if (!start && end) {
return `Hingga ${formatShortDateId(end)}`;
}

    return `${formatShortDateId(start)} — ${formatShortDateId(end)}`;
}

export function resolveAvatarUrl(avatar?: string | null): string | undefined {
    if (!avatar) {
return undefined;
}

    if (avatar.startsWith('http') || avatar.startsWith('/')) {
        return avatar;
    }

    return `/storage/${avatar}`;
}

export function getInitials(name?: string | null): string {
    if (!name) {
return 'TM';
}

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
return parts[0].slice(0, 2).toUpperCase();
}

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface DaysRemainingBadge {
    label: string;
    toneClass: string;
}

export function formatDaysRemainingBadge(daysLeft?: number | null, overduePrefix = 'Lewat'): DaysRemainingBadge {
    if (daysLeft === null || daysLeft === undefined) {
        return {
            label: 'Tanpa tenggat',
            toneClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }

    const rounded = Math.round(daysLeft);

    if (rounded < 0) {
        return {
            label: `${overduePrefix} ${Math.abs(rounded)} hari`,
            toneClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
        };
    }

    if (rounded === 0) {
        return {
            label: 'Hari ini',
            toneClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
        };
    }

    if (rounded === 1) {
        return {
            label: 'Besok (1 hari)',
            toneClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
        };
    }

    if (rounded <= 5) {
        return {
            label: `${rounded} hari lagi`,
            toneClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
        };
    }

    return {
        label: `${rounded} hari tersisa`,
        toneClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/25',
    };
}
