import React, { useId } from 'react';
import type { ClientAttachment } from './portal-types';

/**
 * Safely parses a date string (YYYY-MM-DD or ISO) into a local midnight Date
 * to prevent UTC vs local timezone off-by-one day shifts in calendars and Gantt math.
 */
export function parseLocalDate(dateString?: string | null): Date {
    const now = new Date();
    const fallback = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!dateString) {
        return fallback;
    }

    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-').map(Number);

    if (parts.length === 3 && !parts.some((n) => Number.isNaN(n))) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    const parsed = new Date(dateString);

    if (Number.isNaN(parsed.getTime())) {
        return fallback;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Formats a date string into local Indonesian calendar format (e.g. "9 Nov 2026").
 */
export function formatDate(dateString?: string | null): string {
    if (!dateString) {
        return '-';
    }

    try {
        const d = parseLocalDate(dateString);

        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

/**
 * Formats a Date object as YYYY-MM-DD in local time.
 */
export function toLocalDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

/**
 * Formats byte size into human-readable string.
 */
export function formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) {
        return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(
        sizes.length - 1,
        Math.floor(Math.log(bytes) / Math.log(k)),
    );

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Computes inclusive calendar day duration between two dates.
 */
export function getDayDuration(
    startStr?: string | null,
    endStr?: string | null,
): number {
    if (!startStr || !endStr) {
        return 1;
    }

    const start = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);
    const diff = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(1, diff + 1);
}

/**
 * Computes human-friendly schedule countdown / health badge metadata.
 */
export function getScheduleHealth(
    endDateStr?: string | null,
    status?: string,
): {
    label: string;
    tone: 'emerald' | 'sky' | 'amber' | 'rose' | 'slate';
} {
    if (status === 'completed' || status === 'done') {
        return { label: 'Selesai', tone: 'emerald' };
    }

    if (!endDateStr) {
        return { label: 'Fleksibel', tone: 'slate' };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = parseLocalDate(endDateStr);
    const diffDays = Math.round(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays > 7) {
        return { label: `${diffDays} Hari Tersisa`, tone: 'sky' };
    }

    if (diffDays > 0) {
        return { label: `${diffDays} Hari Lagi`, tone: 'amber' };
    }

    if (diffDays === 0) {
        return { label: 'Target Hari Ini', tone: 'amber' };
    }

    return { label: `Penyesuaian ${Math.abs(diffDays)} Hari`, tone: 'rose' };
}

export function getSprintStatusMeta(status: string): {
    label: string;
    className: string;
    dotColor: string;
    accentBorder: string;
} {
    switch (status) {
        case 'completed':
            return {
                label: 'Selesai (Completed)',
                className:
                    'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
                dotColor: 'bg-blue-500',
                accentBorder: 'from-blue-500 to-indigo-500',
            };
        case 'active':
            return {
                label: 'Sedang Berjalan (Active)',
                className:
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
                dotColor: 'bg-emerald-500',
                accentBorder: 'from-emerald-500 to-teal-400',
            };
        case 'planned':
        default:
            return {
                label: 'Direncanakan (Planned)',
                className:
                    'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/25 dark:border-slate-700',
                dotColor: 'bg-slate-400',
                accentBorder: 'from-slate-400 to-slate-500',
            };
    }
}

export function resolveAvatarUrl(
    avatar?: string | null,
    name?: string | null,
): string {
    if (avatar) {
        if (avatar.startsWith('http') || avatar.startsWith('/')) {
            return avatar;
        }

        return `/storage/${avatar}`;
    }

    const displayName = encodeURIComponent(name || 'Tim Studio');

    return `https://ui-avatars.com/api/?name=${displayName}&background=6366f1&color=ffffff&bold=true`;
}

export function resolveAttachmentUrl(att: ClientAttachment): string {
    if (att.preview_url) {
        return att.preview_url;
    }

    if (att.file_url) {
        return att.file_url;
    }

    if (
        att.file_path &&
        (att.file_path.startsWith('http') || att.file_path.startsWith('/'))
    ) {
        return att.file_path;
    }

    return `/storage/${att.file_path}`;
}

export function getStatusMeta(status: string): {
    label: string;
    className: string;
    dotColor: string;
    accentBorder: string;
} {
    switch (status) {
        case 'completed':
        case 'done':
            return {
                label: 'Selesai',
                className:
                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
                dotColor: 'bg-emerald-500',
                accentBorder: 'from-emerald-500 to-teal-400',
            };
        case 'in_progress':
        case 'active':
            return {
                label: 'Dalam Pengerjaan',
                className:
                    'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
                dotColor: 'bg-sky-500',
                accentBorder: 'from-sky-500 to-cyan-400',
            };
        case 'review':
            return {
                label: 'Uji Coba & Review',
                className:
                    'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
                dotColor: 'bg-amber-400',
                accentBorder: 'from-amber-400 to-orange-400',
            };
        case 'planned':
        case 'todo':
        default:
            return {
                label: 'Antrean Tugas',
                className:
                    'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/25 dark:border-slate-700',
                dotColor: 'bg-slate-400',
                accentBorder: 'from-slate-400 to-slate-500',
            };
    }
}

export function getPriorityMeta(priority: string): {
    label: string;
    className: string;
} {
    switch (priority) {
        case 'urgent':
            return {
                label: 'Urgent',
                className:
                    'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
            };
        case 'high':
            return {
                label: 'Prioritas Tinggi',
                className:
                    'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
            };
        case 'medium':
            return {
                label: 'Menengah',
                className:
                    'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25',
            };
        case 'low':
        default:
            return {
                label: 'Normal',
                className:
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-400/20 dark:border-slate-700',
            };
    }
}

/**
 * Safely renders inline **bold** markdown markers as highlighted React <strong> nodes
 * without using dangerouslySetInnerHTML.
 */
export function renderFormattedText(text: string): React.ReactNode[] {
    const segments = text.split(/(\*\*[^*]+\*\*)/g);

    return segments.map((seg, idx) => {
        if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
            return (
                <strong
                    key={idx}
                    className="font-bold text-slate-900 dark:text-white"
                >
                    {seg.slice(2, -2)}
                </strong>
            );
        }

        return <React.Fragment key={idx}>{seg}</React.Fragment>;
    });
}

/**
 * Derives a compact file type label for attachment cards.
 */
export function getFileExtensionBadge(fileName: string): {
    ext: string;
    toneClass: string;
} {
    const ext = (fileName.split('.').pop() || 'FILE').toUpperCase().slice(0, 4);

    if (ext === 'PDF') {
        return {
            ext,
            toneClass:
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
    }

    if (['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(ext)) {
        return {
            ext,
            toneClass:
                'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
        };
    }

    if (['ZIP', 'RAR', '7Z'].includes(ext)) {
        return {
            ext,
            toneClass:
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
    }

    return {
        ext,
        toneClass:
            'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    };
}

interface CircularProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

export function CircularProgressRing({
    percentage,
    size = 86,
    strokeWidth = 7,
}: CircularProgressRingProps) {
    const gradientId = useId();
    const clamped = Math.max(0, Math.min(100, percentage));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clamped / 100) * circumference;

    return (
        <div
            className="relative inline-flex shrink-0 items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} className="-rotate-90 transform">
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop
                            offset="100%"
                            stopColor={clamped >= 100 ? '#10b981' : '#0ea5e9'}
                        />
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200/80 dark:text-slate-800/90"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg leading-none font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
                    {clamped}%
                </span>
                <span className="mt-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    Total
                </span>
            </div>
        </div>
    );
}
