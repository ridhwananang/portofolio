import {
    Calendar,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    CornerDownRight,
    FolderKanban,
    Layers,
    MoveHorizontal,
    Search,
    Sparkles,
    X,
    Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PmsTimelineItem } from '@/types/pms';
import type { ClientProject, HoveredGanttItem } from './portal-types';
import {
    formatDate,
    getStatusMeta,
    parseLocalDate,
    toLocalDateKey,
} from './portal-utils';

interface PortalGanttTimelineProps {
    project: ClientProject;
    timelineData: PmsTimelineItem[];
}

const STICKY_COL_CLASSES = 'w-44 sm:w-64 lg:w-72 shrink-0';
const STICKY_MONTH_OFFSET_CLASSES =
    'left-[184px] sm:left-[264px] lg:left-[296px]';

export function PortalGanttTimeline({
    project,
    timelineData,
}: PortalGanttTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragScrollLeft, setDragScrollLeft] = useState(0);

    const [timelineFilter, setTimelineFilter] = useState<
        'all' | 'sprint' | 'task'
    >('all');
    const [timelineSearch, setTimelineSearch] = useState('');
    const [zoomMode, setZoomMode] = useState<'compact' | 'normal' | 'spacious'>(
        'normal',
    );
    const [collapsedSprintIds, setCollapsedSprintIds] = useState<
        Record<number, boolean>
    >({});
    const [hoveredGantt, setHoveredGantt] = useState<HoveredGanttItem | null>(
        null,
    );

    const toggleSprintCollapse = (sprintId: number) => {
        setCollapsedSprintIds((prev) => ({
            ...prev,
            [sprintId]: !prev[sprintId],
        }));
    };

    const areAllCollapsed =
        project.sprints.length > 0 &&
        project.sprints.every((s) => collapsedSprintIds[s.id]);

    const toggleAllSprints = () => {
        if (areAllCollapsed) {
            setCollapsedSprintIds({});
        } else {
            const next: Record<number, boolean> = {};
            project.sprints.forEach((s) => {
                next[s.id] = true;
            });
            setCollapsedSprintIds(next);
        }
    };

    const dayWidth = useMemo(() => {
        switch (zoomMode) {
            case 'compact':
                return 36;
            case 'spacious':
                return 64;
            case 'normal':
            default:
                return 48;
        }
    }, [zoomMode]);

    // Timezone-safe calendar reference (normalized once to local midnight)
    const [todayMidnight] = useState(() => {
        const now = new Date();

        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    });

    // Effective timeline items for date-bound calculation
    const effectiveTimelineData: PmsTimelineItem[] = useMemo(() => {
        if (timelineData && timelineData.length > 0) {
            return timelineData;
        }

        const items: PmsTimelineItem[] = [];
        const baseMs = todayMidnight.getTime();
        const todayStr = toLocalDateKey(todayMidnight);

        items.push({
            type: 'project',
            id: `proj-${project.id}`,
            project_id: project.id,
            name: project.name,
            code: project.code,
            status: project.status,
            start_date: project.start_date || todayStr,
            end_date:
                project.end_date ||
                toLocalDateKey(new Date(baseMs + 30 * 86400000)),
            progress: project.progress_percentage,
        });

        project.sprints.forEach((s) => {
            items.push({
                type: 'sprint',
                id: `sprint-${s.id}`,
                project_id: project.id,
                name: s.name,
                status: s.status,
                start_date: s.start_date || project.start_date || todayStr,
                end_date:
                    s.end_date ||
                    project.end_date ||
                    toLocalDateKey(new Date(baseMs + 14 * 86400000)),
                tasks_count: s.tasks_count,
                progress: s.progress_percentage,
            });
        });

        project.tasks.forEach((t) => {
            const sprint = project.sprints.find((s) => s.id === t.sprint_id);
            const startDate =
                t.created_at ||
                sprint?.start_date ||
                project.start_date ||
                todayStr;
            const endDate =
                t.due_date ||
                sprint?.end_date ||
                project.end_date ||
                toLocalDateKey(new Date(baseMs + 7 * 86400000));

            items.push({
                type: 'task',
                id: `task-${t.id}`,
                project_id: project.id,
                name: t.title,
                status: t.status,
                priority: t.priority,
                start_date: startDate,
                end_date: endDate,
                assignee_name: t.assignee_name,
                assignee_avatar: null,
            });
        });

        return items;
    }, [timelineData, project, todayMidnight]);

    const { days, horizonStart } = useMemo(() => {
        const timestamps: number[] = [todayMidnight.getTime()];
        effectiveTimelineData.forEach((item) => {
            if (item.start_date) {
                timestamps.push(parseLocalDate(item.start_date).getTime());
            }

            if (item.end_date) {
                timestamps.push(parseLocalDate(item.end_date).getTime());
            }
        });

        const minDate = new Date(Math.min(...timestamps));
        const maxDate = new Date(Math.max(...timestamps));

        const start = new Date(
            minDate.getFullYear(),
            minDate.getMonth(),
            minDate.getDate() - 5,
        );
        const end = new Date(
            maxDate.getFullYear(),
            maxDate.getMonth(),
            maxDate.getDate() + 10,
        );

        const list: {
            date: Date;
            dateStr: string;
            isToday: boolean;
            isWeekend: boolean;
        }[] = [];

        const curr = new Date(start);

        while (curr <= end) {
            const isToday = curr.getTime() === todayMidnight.getTime();
            const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
            list.push({
                date: new Date(curr),
                dateStr: toLocalDateKey(curr),
                isToday,
                isWeekend,
            });
            curr.setDate(curr.getDate() + 1);
        }

        return { days: list, horizonStart: start };
    }, [effectiveTimelineData, todayMidnight]);

    // Group days by Month for Top Header Tier 1
    const monthGroups = useMemo(() => {
        interface MonthGroup {
            key: string;
            label: string;
            daysCount: number;
        }
        const groups: MonthGroup[] = [];
        let currentKey = '';
        let currentGroup: MonthGroup | null = null;

        days.forEach((day) => {
            const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;

            if (key !== currentKey) {
                if (currentGroup) {
                    groups.push(currentGroup);
                }

                currentKey = key;
                currentGroup = {
                    key,
                    label: day.date.toLocaleDateString('id-ID', {
                        month: 'long',
                        year: 'numeric',
                    }),
                    daysCount: 1,
                };
            } else if (currentGroup) {
                currentGroup.daysCount += 1;
            }
        });

        if (currentGroup) {
            groups.push(currentGroup);
        }

        return groups;
    }, [days]);

    // Timezone-safe pixel coordinate computation
    const getBarCoordinates = (startStr: string, endStr: string) => {
        const rawStart = parseLocalDate(startStr);
        const rawEnd = parseLocalDate(endStr);
        const start = rawStart <= rawEnd ? rawStart : rawEnd;
        const end = rawEnd >= rawStart ? rawEnd : rawStart;

        const oneDay = 1000 * 60 * 60 * 24;
        const leftDays = Math.max(
            0,
            Math.round((start.getTime() - horizonStart.getTime()) / oneDay),
        );
        const durationDays = Math.max(
            1,
            Math.round((end.getTime() - start.getTime()) / oneDay) + 1,
        );

        return {
            left: leftDays * dayWidth,
            width: Math.max(dayWidth, durationDays * dayWidth),
            durationDays,
            resolvedStart: toLocalDateKey(start),
            resolvedEnd: toLocalDateKey(end),
        };
    };

    // Drag-to-scroll handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) {
            return;
        }

        const target = e.target as HTMLElement;

        if (target.closest('button') || target.closest('input')) {
            return;
        }

        setIsMouseDown(true);
        setDragStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setDragScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsMouseDown(false);
        setHoveredGantt(null);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isMouseDown || !scrollContainerRef.current) {
            return;
        }

        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - dragStartX) * 1.4;
        scrollContainerRef.current.scrollLeft = dragScrollLeft - walk;
    };

    const scrollToToday = () => {
        if (!scrollContainerRef.current) {
            return;
        }

        const todayIndex = days.findIndex((d) => d.isToday);

        if (todayIndex >= 0) {
            scrollContainerRef.current.scrollTo({
                left: Math.max(0, (todayIndex - 2) * dayWidth),
                behavior: 'smooth',
            });
        }
    };

    const scrollByDays = (daysCount: number) => {
        if (!scrollContainerRef.current) {
            return;
        }

        scrollContainerRef.current.scrollBy({
            left: daysCount * dayWidth,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            const todayIndex = days.findIndex((d) => d.isToday);

            if (todayIndex > 2) {
                scrollContainerRef.current.scrollLeft =
                    (todayIndex - 2) * dayWidth;
            }
        }
    }, [days, dayWidth]);

    const handleBarHover = (
        e: React.MouseEvent,
        payload: Omit<HoveredGanttItem, 'clientX' | 'clientY'>,
    ) => {
        if (isMouseDown) {
            return;
        }

        setHoveredGantt({
            ...payload,
            clientX: e.clientX,
            clientY: e.clientY,
        });
    };

    const handleBarMove = (e: React.MouseEvent) => {
        if (!hoveredGantt || isMouseDown) {
            return;
        }

        setHoveredGantt((prev) =>
            prev
                ? {
                      ...prev,
                      clientX: e.clientX,
                      clientY: e.clientY,
                  }
                : null,
        );
    };

    const standaloneTasks = useMemo(() => {
        const searchLower = timelineSearch.trim().toLowerCase();

        return project.tasks.filter(
            (t) =>
                !t.sprint_id &&
                (!searchLower ||
                    t.title.toLowerCase().includes(searchLower) ||
                    t.assignee_role.toLowerCase().includes(searchLower) ||
                    t.assignee_name.toLowerCase().includes(searchLower)),
        );
    }, [project.tasks, timelineSearch]);

    const todayIndex = days.findIndex((d) => d.isToday);
    const todayLeftPx =
        todayIndex >= 0 ? todayIndex * dayWidth + dayWidth / 2 : null;

    const getTaskBarClasses = (status: string) => {
        switch (status) {
            case 'done':
                return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20';
            case 'in_progress':
                return 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/20';
            case 'review':
                return 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/20';
            default:
                return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-500/10';
        }
    };

    const masterCoords = getBarCoordinates(
        project.start_date || toLocalDateKey(todayMidnight),
        project.end_date ||
            toLocalDateKey(new Date(todayMidnight.getTime() + 21 * 86400000)),
    );

    const searchLower = timelineSearch.trim().toLowerCase();

    return (
        <div className="space-y-4">
            {/* 1. Executive Timeline Toolbar */}
            <div className="luxury-card relative overflow-hidden rounded-3xl">
                <div className="specular-top" />

                {/* Tier 1: Title & Timeline Navigation */}
                <div className="flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-600/15 to-indigo-600/10 text-violet-600 dark:text-violet-400">
                            <CalendarDays className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-[family-name:var(--font-brand)] text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                                    Interactive Roadmap &amp; Timeline Gantt
                                </h2>
                                <Badge
                                    variant="outline"
                                    className="border-violet-500/25 bg-violet-500/8 px-2 py-0.5 text-[10px] font-bold text-violet-700 tabular-nums dark:border-violet-400/30 dark:bg-violet-500/12 dark:text-violet-300"
                                >
                                    {project.sprints.length} Sprint ·{' '}
                                    {project.tasks.length} Tugas
                                </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Visualisasi linimasa proyek, siklus sprint, dan
                                perkembangan tiket dengan navigasi interaktif.
                            </p>
                        </div>
                    </div>

                    {/* Top-Right Quick Navigation Actions */}
                    <div className="no-print flex shrink-0 flex-wrap items-center gap-2">
                        {project.sprints.length > 0 &&
                            timelineFilter !== 'task' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleAllSprints}
                                    className="h-9 cursor-pointer rounded-xl border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-violet-500/35 hover:text-violet-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-violet-300"
                                    title={
                                        areAllCollapsed
                                            ? 'Buka Semua Sprint'
                                            : 'Lipat Semua Sprint'
                                    }
                                >
                                    {areAllCollapsed ? (
                                        <ChevronsUpDown className="mr-1.5 size-3.5 text-violet-500" />
                                    ) : (
                                        <ChevronsDownUp className="mr-1.5 size-3.5 text-violet-500" />
                                    )}
                                    <span>
                                        {areAllCollapsed
                                            ? 'Buka Semua'
                                            : 'Lipat Semua'}
                                    </span>
                                </Button>
                            )}

                        {/* Segmented Date Navigation Group */}
                        <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-0.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
                            <button
                                type="button"
                                onClick={() => scrollByDays(-7)}
                                className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 hover:shadow-2xs dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                title="Geser Mundur 1 Minggu"
                                aria-label="Geser Mundur 1 Minggu"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={scrollToToday}
                                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-violet-700 shadow-xs transition-all hover:bg-violet-50 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-violet-500/20"
                                title="Lompat ke Hari Ini"
                            >
                                <Sparkles className="size-3 text-violet-500" />
                                <span>Hari Ini</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollByDays(7)}
                                className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-slate-900 hover:shadow-2xs dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                title="Geser Maju 1 Minggu"
                                aria-label="Geser Maju 1 Minggu"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tier 2: Search, Filter & Scale Strip */}
                <div className="no-print flex flex-col gap-2.5 border-t border-slate-200/75 bg-slate-50/70 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800/80 dark:bg-slate-900/45">
                    {/* Search Box */}
                    <div className="relative w-full lg:w-72">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Cari sprint, tugas, atau PIC di linimasa..."
                            value={timelineSearch}
                            onChange={(e) => setTimelineSearch(e.target.value)}
                            className="h-9 rounded-xl border-slate-200/90 bg-white pr-8 pl-8.5 text-xs shadow-2xs dark:border-slate-700/80 dark:bg-slate-950/70"
                        />
                        {timelineSearch && (
                            <button
                                type="button"
                                onClick={() => setTimelineSearch('')}
                                aria-label="Hapus pencarian"
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter & Scale Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
                        {/* Entity Type Filter */}
                        <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-slate-900/90">
                            {(
                                [
                                    { key: 'all', label: 'Semua' },
                                    { key: 'sprint', label: 'Sprint' },
                                    { key: 'task', label: 'Tugas' },
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setTimelineFilter(tab.key)}
                                    className={`cursor-pointer rounded-lg px-3 py-1 text-[11px] font-bold transition-all ${
                                        timelineFilter === tab.key
                                            ? 'bg-white text-violet-600 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />

                        {/* Zoom Mode Selector */}
                        <div className="flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-slate-900/90">
                            {(
                                [
                                    {
                                        key: 'compact',
                                        label: 'Kompak',
                                        title: 'Skala 36px/hari',
                                    },
                                    {
                                        key: 'normal',
                                        label: 'Standar',
                                        title: 'Skala 48px/hari',
                                    },
                                    {
                                        key: 'spacious',
                                        label: 'Luas',
                                        title: 'Skala 64px/hari',
                                    },
                                ] as const
                            ).map((z) => (
                                <button
                                    key={z.key}
                                    type="button"
                                    onClick={() => setZoomMode(z.key)}
                                    title={z.title}
                                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                        zoomMode === z.key
                                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {z.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Gantt Canvas Card */}
            <div className="luxury-card relative overflow-hidden rounded-3xl">
                <div className="specular-top" />

                {/* Color Legend Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 p-3.5 text-[11px] font-medium text-slate-600 sm:px-5 dark:border-slate-800/80 dark:bg-[#080f20] dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full bg-violet-600 shadow-xs shadow-violet-600/40" />
                            Master Proyek
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full bg-orange-500 shadow-xs shadow-orange-500/40" />
                            Siklus Sprint
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/40" />
                            Tugas Selesai
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full bg-sky-500 shadow-xs shadow-sky-500/40" />
                            Dalam Pengerjaan
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/40" />
                            Uji Coba / Review
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full bg-slate-400" />
                            Antrean Tugas
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="hidden items-center gap-1.5 md:flex">
                            <MoveHorizontal className="size-3.5 text-violet-500" />
                            <span>Klik & drag area jadwal untuk menggeser</span>
                        </div>
                        <span className="rounded-full bg-slate-200/60 px-2 py-0.5 font-bold text-slate-700 tabular-nums dark:bg-slate-800/80 dark:text-slate-300">
                            {effectiveTimelineData.length} Entitas
                        </span>
                    </div>
                </div>

                {/* Scrollable Timeline Canvas */}
                <div
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`scrollbar-sleek relative overflow-x-auto select-none ${
                        isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                    style={{ minHeight: '400px' }}
                >
                    <div
                        style={{
                            minWidth: '100%',
                            width: `${days.length * dayWidth + 288}px`,
                        }}
                        className="relative"
                    >
                        {/* 2-TIER STICKY CALENDAR HEADER */}
                        <div className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#080f20]">
                            {/* TIER 1: MONTHS */}
                            <div className="flex border-b border-slate-200/80 dark:border-slate-800/80">
                                <div
                                    className={`${STICKY_COL_CLASSES} sticky left-0 z-40 flex items-center justify-between border-r border-slate-200 bg-slate-100 p-2.5 px-3 text-[11px] font-bold tracking-wider text-slate-700 uppercase shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] sm:px-4 dark:border-slate-800 dark:bg-[#0a1226] dark:text-slate-200 dark:shadow-[4px_0_14px_-2px_rgba(0,0,0,0.5)]`}
                                >
                                    <span className="truncate">
                                        Struktur Pekerjaan
                                    </span>
                                    <Layers className="size-3.5 shrink-0 text-violet-500" />
                                </div>
                                <div className="flex">
                                    {monthGroups.map((month) => (
                                        <div
                                            key={month.key}
                                            style={{
                                                width: `${month.daysCount * dayWidth}px`,
                                            }}
                                            className="relative shrink-0 border-r border-slate-200 bg-slate-50 p-2 px-3 text-xs dark:border-slate-800 dark:bg-[#080f20]"
                                        >
                                            <div
                                                className={`sticky ${STICKY_MONTH_OFFSET_CLASSES} inline-flex max-w-full items-center gap-2`}
                                            >
                                                <Calendar className="size-3.5 shrink-0 text-violet-500" />
                                                <span className="truncate font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                                                    {month.label}
                                                </span>
                                                <span className="shrink-0 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                                    ({month.daysCount}h)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TIER 2: DAYS */}
                            <div className="flex">
                                <div
                                    className={`${STICKY_COL_CLASSES} sticky left-0 z-40 flex items-center justify-between border-r border-slate-200 bg-slate-50 p-2 px-3 text-xs font-bold text-slate-800 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] sm:px-4 dark:border-slate-800 dark:bg-[#0a1226] dark:text-slate-200 dark:shadow-[4px_0_14px_-2px_rgba(0,0,0,0.5)]`}
                                >
                                    <span className="truncate">
                                        Item / Tiket Tugas
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="shrink-0 border-slate-300 px-1.5 py-0 text-[9px] text-slate-500 dark:border-slate-700 dark:text-slate-400"
                                    >
                                        Status
                                    </Badge>
                                </div>
                                <div className="flex">
                                    {days.map((day) => (
                                        <div
                                            key={day.dateStr}
                                            style={{ width: `${dayWidth}px` }}
                                            className={`shrink-0 border-r border-slate-100 py-1.5 text-center text-[10px] font-semibold transition-colors dark:border-slate-800/60 ${
                                                day.isToday
                                                    ? 'relative bg-violet-600/12 font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                                                    : day.isWeekend
                                                      ? 'bg-slate-100/60 text-slate-400 dark:bg-slate-900/50 dark:text-slate-500'
                                                      : 'text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <div className="text-[9px] font-bold uppercase">
                                                {day.date.toLocaleDateString(
                                                    'id-ID',
                                                    { weekday: 'narrow' },
                                                )}
                                            </div>
                                            <div
                                                className={`mt-0.5 tabular-nums ${
                                                    day.isToday
                                                        ? 'inline-flex items-center justify-center rounded-full bg-violet-600 px-1.5 font-black text-white shadow-xs'
                                                        : ''
                                                }`}
                                            >
                                                {day.date.getDate()}
                                            </div>
                                            {day.date.getDate() === 1 && (
                                                <span className="-mt-0.5 block font-mono text-[8px] font-bold text-violet-600 uppercase dark:text-amber-400">
                                                    {day.date.toLocaleDateString(
                                                        'id-ID',
                                                        { month: 'short' },
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TIMELINE BODY ROWS */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {/* 1. MASTER PROJECT ROW */}
                            {timelineFilter !== 'task' && (
                                <div className="group relative flex min-h-[50px] items-center bg-violet-500/[0.025] dark:bg-violet-500/[0.03]">
                                    <div
                                        className={`${STICKY_COL_CLASSES} sticky left-0 z-30 flex items-center justify-between gap-2 border-r border-slate-200 bg-white p-2.5 px-3 text-xs shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] sm:px-4 dark:border-slate-800 dark:bg-[#0c152a] dark:shadow-[4px_0_14px_-2px_rgba(0,0,0,0.5)]`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xs">
                                                <FolderKanban className="size-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block truncate font-bold text-slate-900 dark:text-white">
                                                    {project.name}
                                                </span>
                                                <span className="block truncate font-mono text-[10px] text-slate-400">
                                                    Master ({project.code})
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className="shrink-0 border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-[9px] text-violet-700 tabular-nums dark:text-violet-300">
                                            {project.progress_percentage}%
                                        </Badge>
                                    </div>

                                    {/* Track */}
                                    <div className="relative flex h-11 flex-1 items-center">
                                        <div className="pointer-events-none absolute inset-0 flex">
                                            {days.map((day) => (
                                                <div
                                                    key={day.dateStr}
                                                    style={{
                                                        width: `${dayWidth}px`,
                                                    }}
                                                    className={`h-full shrink-0 border-r border-slate-100/80 dark:border-slate-800/40 ${
                                                        day.isWeekend
                                                            ? 'bg-slate-100/35 dark:bg-slate-900/30'
                                                            : ''
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        {todayLeftPx !== null && (
                                            <div
                                                style={{
                                                    left: `${todayLeftPx}px`,
                                                }}
                                                className="pointer-events-none absolute top-0 bottom-0 z-15 w-[2px] bg-violet-500/75"
                                            />
                                        )}
                                        <div
                                            style={{
                                                left: `${masterCoords.left}px`,
                                                width: `${masterCoords.width}px`,
                                            }}
                                            onMouseEnter={(e) =>
                                                handleBarHover(e, {
                                                    name: project.name,
                                                    type: 'project',
                                                    status: project.status,
                                                    start_date:
                                                        masterCoords.resolvedStart,
                                                    end_date:
                                                        masterCoords.resolvedEnd,
                                                    durationDays:
                                                        masterCoords.durationDays,
                                                    progress:
                                                        project.progress_percentage,
                                                })
                                            }
                                            onMouseMove={handleBarMove}
                                            onMouseLeave={() =>
                                                setHoveredGantt(null)
                                            }
                                            className="absolute z-10 flex h-7 cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-3 text-[11px] font-bold text-white shadow-sm shadow-violet-600/25 transition-all hover:z-20 hover:scale-[1.01] hover:brightness-110"
                                        >
                                            <span className="flex items-center gap-1.5 truncate">
                                                <Sparkles className="size-3 shrink-0 text-amber-200" />
                                                {project.name}
                                            </span>
                                            <span className="ml-2 hidden shrink-0 font-mono text-[10px] tabular-nums opacity-90 sm:inline">
                                                {masterCoords.durationDays}h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. SPRINT GROUPS & NESTED TASKS */}
                            {project.sprints.map((sprint, sprintIdx) => {
                                const sprintTasks = project.tasks.filter(
                                    (t) => t.sprint_id === sprint.id,
                                );
                                const isCollapsed =
                                    collapsedSprintIds[sprint.id] ?? false;
                                const sprintCoords = getBarCoordinates(
                                    sprint.start_date ||
                                        project.start_date ||
                                        toLocalDateKey(todayMidnight),
                                    sprint.end_date ||
                                        project.end_date ||
                                        toLocalDateKey(todayMidnight),
                                );

                                const sprintMatches =
                                    !searchLower ||
                                    sprint.name
                                        .toLowerCase()
                                        .includes(searchLower);
                                const filteredSprintTasks = sprintTasks.filter(
                                    (t) =>
                                        !searchLower ||
                                        t.title
                                            .toLowerCase()
                                            .includes(searchLower) ||
                                        t.assignee_role
                                            .toLowerCase()
                                            .includes(searchLower) ||
                                        t.assignee_name
                                            .toLowerCase()
                                            .includes(searchLower),
                                );

                                if (
                                    searchLower &&
                                    !sprintMatches &&
                                    filteredSprintTasks.length === 0
                                ) {
                                    return null;
                                }

                                return (
                                    <React.Fragment key={sprint.id}>
                                        {timelineFilter !== 'task' && (
                                            <div className="group relative flex min-h-[46px] items-center bg-amber-500/[0.02] transition-colors hover:bg-amber-500/[0.045] dark:bg-amber-500/[0.02]">
                                                <div
                                                    className={`${STICKY_COL_CLASSES} sticky left-0 z-30 flex items-center justify-between gap-1.5 border-r border-slate-200 bg-slate-50 p-2 px-3 text-xs shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] sm:px-4 dark:border-slate-800 dark:bg-[#0e1730] dark:shadow-[4px_0_14px_-2px_rgba(0,0,0,0.5)]`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleSprintCollapse(
                                                                sprint.id,
                                                            )
                                                        }
                                                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left transition-colors hover:text-amber-600 dark:hover:text-amber-400"
                                                    >
                                                        <div className="flex size-5 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                            <Zap className="size-3" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="block truncate font-bold text-slate-800 dark:text-slate-100">
                                                                {sprint.name}
                                                            </span>
                                                            <span className="block truncate text-[10px] text-slate-400">
                                                                Tahap{' '}
                                                                {sprintIdx + 1}{' '}
                                                                •{' '}
                                                                {
                                                                    sprint.tasks_count
                                                                }{' '}
                                                                Tiket
                                                            </span>
                                                        </div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleSprintCollapse(
                                                                sprint.id,
                                                            )
                                                        }
                                                        aria-label={
                                                            isCollapsed
                                                                ? 'Buka tugas sprint'
                                                                : 'Tutup tugas sprint'
                                                        }
                                                        className="shrink-0 cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                                    >
                                                        {isCollapsed ? (
                                                            <ChevronRight className="size-3.5" />
                                                        ) : (
                                                            <ChevronDown className="size-3.5" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="relative flex h-10 flex-1 items-center">
                                                    <div className="pointer-events-none absolute inset-0 flex">
                                                        {days.map((day) => (
                                                            <div
                                                                key={
                                                                    day.dateStr
                                                                }
                                                                style={{
                                                                    width: `${dayWidth}px`,
                                                                }}
                                                                className={`h-full shrink-0 border-r border-slate-100/80 dark:border-slate-800/40 ${
                                                                    day.isWeekend
                                                                        ? 'bg-slate-100/35 dark:bg-slate-900/30'
                                                                        : ''
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {todayLeftPx !== null && (
                                                        <div
                                                            style={{
                                                                left: `${todayLeftPx}px`,
                                                            }}
                                                            className="pointer-events-none absolute top-0 bottom-0 z-15 w-[2px] bg-violet-500/75"
                                                        />
                                                    )}
                                                    <div
                                                        style={{
                                                            left: `${sprintCoords.left}px`,
                                                            width: `${sprintCoords.width}px`,
                                                        }}
                                                        onMouseEnter={(e) =>
                                                            handleBarHover(e, {
                                                                name: sprint.name,
                                                                type: 'sprint',
                                                                status: sprint.status,
                                                                start_date:
                                                                    sprintCoords.resolvedStart,
                                                                end_date:
                                                                    sprintCoords.resolvedEnd,
                                                                durationDays:
                                                                    sprintCoords.durationDays,
                                                                progress:
                                                                    sprint.progress_percentage,
                                                            })
                                                        }
                                                        onMouseMove={
                                                            handleBarMove
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredGantt(
                                                                null,
                                                            )
                                                        }
                                                        className="absolute z-10 flex h-7 cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 px-2.5 text-[11px] font-bold text-white shadow-sm shadow-orange-500/20 transition-all hover:z-20 hover:scale-[1.01] hover:brightness-110"
                                                    >
                                                        <span className="truncate">
                                                            {sprint.name}
                                                        </span>
                                                        <span className="ml-1.5 shrink-0 rounded-full bg-black/25 px-1.5 py-0.5 text-[9.5px] tabular-nums">
                                                            {
                                                                sprint.progress_percentage
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Nested Tasks under Sprint */}
                                        {!isCollapsed &&
                                            timelineFilter !== 'sprint' &&
                                            filteredSprintTasks.map((task) => {
                                                const taskCoords =
                                                    getBarCoordinates(
                                                        task.created_at ||
                                                            sprint.start_date ||
                                                            project.start_date ||
                                                            toLocalDateKey(
                                                                todayMidnight,
                                                            ),
                                                        task.due_date ||
                                                            sprint.end_date ||
                                                            project.end_date ||
                                                            toLocalDateKey(
                                                                todayMidnight,
                                                            ),
                                                    );
                                                const tMeta = getStatusMeta(
                                                    task.status,
                                                );
                                                const barStyle =
                                                    getTaskBarClasses(
                                                        task.status,
                                                    );

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="group relative flex min-h-[42px] items-center transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                                    >
                                                        <div
                                                            className={`${STICKY_COL_CLASSES} sticky left-0 z-30 flex items-center justify-between gap-1.5 border-r border-slate-200 bg-white p-2 px-3 pl-5 text-xs shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] sm:px-4 sm:pl-7 dark:border-slate-800 dark:bg-[#0c152a] dark:shadow-[4px_0_14px_-2px_rgba(0,0,0,0.5)]`}
                                                        >
                                                            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                                                                <CornerDownRight className="hidden size-3 shrink-0 text-slate-400 sm:block" />
                                                                <span
                                                                    className={`size-2 rounded-full ${tMeta.dotColor} shrink-0`}
                                                                />
                                                                <div className="min-w-0">
                                                                    <span className="block truncate font-semibold text-slate-800 dark:text-slate-200">
                                                                        {
                                                                            task.title
                                                                        }
                                                                    </span>
                                                                    <span className="block truncate text-[10px] text-slate-400">
                                                                        {
                                                                            task.assignee_role
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                className={`hidden shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold sm:inline-flex ${tMeta.className}`}
                                                            >
                                                                {tMeta.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="relative flex h-9 flex-1 items-center">
                                                            <div className="pointer-events-none absolute inset-0 flex">
                                                                {days.map(
                                                                    (day) => (
                                                                        <div
                                                                            key={
                                                                                day.dateStr
                                                                            }
                                                                            style={{
                                                                                width: `${dayWidth}px`,
                                                                            }}
                                                                            className={`h-full shrink-0 border-r border-slate-100/80 dark:border-slate-800/40 ${
                                                                                day.isWeekend
                                                                                    ? 'bg-slate-100/35 dark:bg-slate-900/30'
                                                                                    : ''
                                                                            }`}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                            {todayLeftPx !==
                                                                null && (
                                                                <div
                                                                    style={{
                                                                        left: `${todayLeftPx}px`,
                                                                    }}
                                                                    className="pointer-events-none absolute top-0 bottom-0 z-15 w-[2px] bg-violet-500/75"
                                                                />
                                                            )}
                                                            <div
                                                                style={{
                                                                    left: `${taskCoords.left}px`,
                                                                    width: `${taskCoords.width}px`,
                                                                }}
                                                                onMouseEnter={(
                                                                    e,
                                                                ) =>
                                                                    handleBarHover(
                                                                        e,
                                                                        {
                                                                            name: task.title,
                                                                            type: 'task',
                                                                            status: task.status,
                                                                            priority:
                                                                                task.priority,
                                                                            start_date:
                                                                                taskCoords.resolvedStart,
                                                                            end_date:
                                                                                taskCoords.resolvedEnd,
                                                                            durationDays:
                                                                                taskCoords.durationDays,
                                                                            assignee_name:
                                                                                task.assignee_name,
                                                                            assignee_role:
                                                                                task.assignee_role,
                                                                        },
                                                                    )
                                                                }
                                                                onMouseMove={
                                                                    handleBarMove
                                                                }
                                                                onMouseLeave={() =>
                                                                    setHoveredGantt(
                                                                        null,
                                                                    )
                                                                }
                                                                className={`absolute h-6 rounded-lg ${barStyle} z-10 flex cursor-pointer items-center justify-between overflow-hidden px-2 text-[10.5px] font-bold shadow-xs transition-all hover:z-20 hover:scale-[1.01] hover:brightness-110`}
                                                            >
                                                                {taskCoords.width >=
                                                                96 ? (
                                                                    <>
                                                                        <span className="truncate">
                                                                            {
                                                                                task.title
                                                                            }
                                                                        </span>
                                                                        {task.status ===
                                                                            'done' && (
                                                                            <Check className="ml-1 size-3 shrink-0" />
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="mx-auto truncate text-[9px]">
                                                                        {task.status ===
                                                                        'done'
                                                                            ? '✓'
                                                                            : '•'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {taskCoords.width <
                                                                96 && (
                                                                <span
                                                                    style={{
                                                                        left: `${taskCoords.left + taskCoords.width + 6}px`,
                                                                    }}
                                                                    className="pointer-events-none absolute z-10 text-[10px] font-medium whitespace-nowrap text-slate-600 dark:text-slate-400"
                                                                >
                                                                    {task.title}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </React.Fragment>
                                );
                            })}

                            {/* 3. STANDALONE TASKS (WITHOUT SPRINT) */}
                            {timelineFilter !== 'sprint' &&
                                standaloneTasks.map((task) => {
                                    const taskCoords = getBarCoordinates(
                                        task.created_at ||
                                            project.start_date ||
                                            toLocalDateKey(todayMidnight),
                                        task.due_date ||
                                            project.end_date ||
                                            toLocalDateKey(todayMidnight),
                                    );
                                    const tMeta = getStatusMeta(task.status);
                                    const barStyle = getTaskBarClasses(
                                        task.status,
                                    );

                                    return (
                                        <div
                                            key={`standalone-${task.id}`}
                                            className="group relative flex min-h-[42px] items-center transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                        >
                                            <div
                                                className={`${STICKY_COL_CLASSES} sticky left-0 z-30 flex items-center justify-between gap-1.5 border-r border-slate-200 bg-white p-2 px-3 text-xs shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] sm:px-4 dark:border-slate-800 dark:bg-[#0c152a] dark:shadow-[4px_0_14px_-2px_rgba(0,0,0,0.5)]`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className={`size-2 rounded-full ${tMeta.dotColor} shrink-0`}
                                                    />
                                                    <div className="min-w-0">
                                                        <span className="block truncate font-semibold text-slate-800 dark:text-slate-200">
                                                            {task.title}
                                                        </span>
                                                        <span className="block truncate text-[10px] text-slate-400">
                                                            {task.assignee_role}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`hidden shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold sm:inline-flex ${tMeta.className}`}
                                                >
                                                    {tMeta.label}
                                                </Badge>
                                            </div>

                                            <div className="relative flex h-9 flex-1 items-center">
                                                <div className="pointer-events-none absolute inset-0 flex">
                                                    {days.map((day) => (
                                                        <div
                                                            key={day.dateStr}
                                                            style={{
                                                                width: `${dayWidth}px`,
                                                            }}
                                                            className={`h-full shrink-0 border-r border-slate-100/80 dark:border-slate-800/40 ${
                                                                day.isWeekend
                                                                    ? 'bg-slate-100/35 dark:bg-slate-900/30'
                                                                    : ''
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                {todayLeftPx !== null && (
                                                    <div
                                                        style={{
                                                            left: `${todayLeftPx}px`,
                                                        }}
                                                        className="pointer-events-none absolute top-0 bottom-0 z-15 w-[2px] bg-violet-500/75"
                                                    />
                                                )}
                                                <div
                                                    style={{
                                                        left: `${taskCoords.left}px`,
                                                        width: `${taskCoords.width}px`,
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        handleBarHover(e, {
                                                            name: task.title,
                                                            type: 'task',
                                                            status: task.status,
                                                            priority:
                                                                task.priority,
                                                            start_date:
                                                                taskCoords.resolvedStart,
                                                            end_date:
                                                                taskCoords.resolvedEnd,
                                                            durationDays:
                                                                taskCoords.durationDays,
                                                            assignee_name:
                                                                task.assignee_name,
                                                            assignee_role:
                                                                task.assignee_role,
                                                        })
                                                    }
                                                    onMouseMove={handleBarMove}
                                                    onMouseLeave={() =>
                                                        setHoveredGantt(null)
                                                    }
                                                    className={`absolute h-6 rounded-lg ${barStyle} z-10 flex cursor-pointer items-center justify-between overflow-hidden px-2 text-[10.5px] font-bold shadow-xs transition-all hover:z-20 hover:scale-[1.01] hover:brightness-110`}
                                                >
                                                    <span className="truncate">
                                                        {task.title}
                                                    </span>
                                                    {task.status === 'done' && (
                                                        <Check className="ml-1 size-3 shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Viewport-Safe Cursor Floating Tooltip */}
            {hoveredGantt && typeof window !== 'undefined' && (
                <div
                    className="pointer-events-none fixed z-50 w-72 animate-in space-y-2 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 text-xs shadow-2xl backdrop-blur-xl duration-150 fade-in-0 zoom-in-95 dark:border-slate-700/80 dark:bg-[#0c152a]/95"
                    style={{
                        left: `${Math.max(12, Math.min(window.innerWidth - 304, hoveredGantt.clientX + 16))}px`,
                        top: `${Math.max(12, Math.min(window.innerHeight - 190, hoveredGantt.clientY + 16))}px`,
                    }}
                >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                        <span className="truncate font-bold text-slate-900 dark:text-white">
                            {hoveredGantt.name}
                        </span>
                        <Badge className="shrink-0 border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 uppercase dark:text-violet-300">
                            {hoveredGantt.type === 'project'
                                ? 'Master'
                                : hoveredGantt.type === 'sprint'
                                  ? 'Sprint'
                                  : 'Tiket'}
                        </Badge>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                            <span>Jadwal:</span>
                            <strong className="font-mono text-slate-800 dark:text-slate-200">
                                {formatDate(hoveredGantt.start_date)} –{' '}
                                {formatDate(hoveredGantt.end_date)}
                            </strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Durasi:</span>
                            <span className="font-semibold text-slate-700 tabular-nums dark:text-slate-300">
                                {hoveredGantt.durationDays} Hari Kalender
                            </span>
                        </div>
                        {hoveredGantt.assignee_name && (
                            <div className="flex items-center justify-between gap-2">
                                <span>PIC:</span>
                                <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                                    {hoveredGantt.assignee_name}{' '}
                                    {hoveredGantt.assignee_role
                                        ? `(${hoveredGantt.assignee_role})`
                                        : ''}
                                </span>
                            </div>
                        )}
                        {hoveredGantt.progress !== undefined && (
                            <div className="pt-1">
                                <div className="mb-1 flex items-center justify-between text-[10px]">
                                    <span>Penyelesaian</span>
                                    <strong className="text-violet-600 tabular-nums dark:text-violet-400">
                                        {hoveredGantt.progress}%
                                    </strong>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-500"
                                        style={{
                                            width: `${hoveredGantt.progress}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
