import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    FolderKanban,
    Layers,
    MoveHorizontal,
    Sparkles,
    Zap,
} from 'lucide-react';
import { PmsProject, PmsTimelineItem } from '@/types/pms';

interface Props {
    timelineData: PmsTimelineItem[];
    projects: PmsProject[];
    selectedProjectId: number | null;
}

export default function TimelineIndex({
    timelineData,
    projects,
    selectedProjectId,
}: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Timeline Date Bounds calculation (dynamic 30-60 days horizon)
    const today = new Date();
    const horizonStart = new Date(today);
    horizonStart.setDate(today.getDate() - 10);
    const horizonEnd = new Date(today);
    horizonEnd.setDate(today.getDate() + 35);

    // Generate day list
    const days: { date: Date; dateStr: string; label: string; isToday: boolean; isWeekend: boolean }[] = [];
    const curr = new Date(horizonStart);
    while (curr <= horizonEnd) {
        const dateStr = curr.toISOString().split('T')[0];
        const isToday = curr.toDateString() === today.toDateString();
        const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
        days.push({
            date: new Date(curr),
            dateStr,
            label: curr.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
            isToday,
            isWeekend,
        });
        curr.setDate(curr.getDate() + 1);
    }

    const dayWidth = 48; // px per day column

    // Mouse drag scroll logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsMouseDown(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsMouseDown(false);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isMouseDown || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Auto-scroll to today column on initial render
    useEffect(() => {
        if (scrollContainerRef.current) {
            const todayIndex = days.findIndex((d) => d.isToday);
            if (todayIndex > 2) {
                scrollContainerRef.current.scrollLeft = (todayIndex - 2) * dayWidth;
            }
        }
    }, []);

    // Calculate bar left offset and width
    const getBarCoordinates = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const minDate = horizonStart.getTime();
        const oneDay = 1000 * 60 * 60 * 24;

        const leftDays = Math.max(0, Math.floor((start.getTime() - minDate) / oneDay));
        const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / oneDay) + 1);

        return {
            left: leftDays * dayWidth,
            width: Math.max(dayWidth, durationDays * dayWidth),
        };
    };

    const handleProjectFilter = (val: string) => {
        router.get(
            '/studio/pms/timeline',
            { project_id: val !== 'all' ? val : undefined },
            { preserveState: true }
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Interactive Timeline', href: '/studio/pms/timeline' },
            ]}
        >
            <Head title="Interactive Timeline & Gantt - Studio PMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                <CalendarDays className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Interactive Roadmap & Timeline Gantt
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Visualisasi jadwal proyek, rentang sprint, dan target deliverable dengan navigasi drag-to-scroll.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select
                            value={selectedProjectId ? String(selectedProjectId) : 'all'}
                            onValueChange={handleProjectFilter}
                        >
                            <SelectTrigger className="w-56 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <SelectValue placeholder="Semua Proyek" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Proyek Aktif</SelectItem>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name} ({p.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-600">
                            <MoveHorizontal className="size-3.5" />
                            <span>Geser / Drag untuk navigasi</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Gantt Stage */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg overflow-hidden">
                    {/* Gantt Header Guide / Legend */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-violet-600" />
                                Master Proyek
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-amber-500" />
                                Siklus Sprint
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-emerald-500" />
                                Tugas Selesai
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-3 rounded-full bg-indigo-500" />
                                Tugas Berjalan
                            </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                            Menampilkan {timelineData.length} entitas jadwal
                        </span>
                    </div>

                    {/* Timeline Interactive Canvas */}
                    <div
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={`overflow-x-auto relative select-none ${
                            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                        style={{ minHeight: '480px' }}
                    >
                        <div
                            style={{ width: `${days.length * dayWidth + 240}px` }}
                            className="relative min-w-full"
                        >
                            {/* Sticky Left Column / Header Days */}
                            <div className="sticky top-0 z-20 flex bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                                <div className="w-60 shrink-0 p-3 font-bold text-xs text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/95 sticky left-0 z-30 shadow-sm">
                                    Item / Nama Tugas
                                </div>
                                <div className="flex">
                                    {days.map((day) => (
                                        <div
                                            key={day.dateStr}
                                            style={{ width: `${dayWidth}px` }}
                                            className={`p-2 text-center text-[10px] font-semibold border-r border-slate-100 dark:border-slate-800/80 shrink-0 ${
                                                day.isToday
                                                    ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400 font-bold'
                                                    : day.isWeekend
                                                    ? 'bg-slate-100/50 dark:bg-slate-900/40 text-slate-400'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            <div className="uppercase text-[9px]">{day.date.toLocaleDateString('id-ID', { weekday: 'narrow' })}</div>
                                            <div>{day.date.getDate()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline Rows */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {timelineData.length === 0 ? (
                                    <div className="py-20 text-center text-xs text-slate-400">
                                        Tidak ada item timeline aktif dengan tanggal mulai dan tenggat waktu.
                                    </div>
                                ) : (
                                    timelineData.map((item) => {
                                        const coords = getBarCoordinates(item.start_date, item.end_date);

                                        let barColor = 'bg-slate-500';
                                        if (item.type === 'project') barColor = 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white';
                                        else if (item.type === 'sprint') barColor = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
                                        else if (item.status === 'done') barColor = 'bg-emerald-500 text-white';
                                        else if (item.status === 'in_progress') barColor = 'bg-indigo-500 text-white';
                                        else barColor = 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200';

                                        return (
                                            <div key={item.id} className="flex relative hover:bg-violet-500/[0.02] transition-colors items-center min-h-[44px]">
                                                {/* Left Sticky Label */}
                                                <div className="w-60 shrink-0 p-2.5 px-3 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky left-0 z-10 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 truncate">
                                                        {item.type === 'project' && <FolderKanban className="size-3.5 text-violet-500 shrink-0" />}
                                                        {item.type === 'sprint' && <Zap className="size-3.5 text-amber-500 shrink-0" />}
                                                        {item.type === 'task' && <span className="size-2 rounded-full bg-slate-400 shrink-0" />}
                                                        <span className="font-semibold truncate text-slate-900 dark:text-slate-100">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Timeline Track & Bar */}
                                                <div className="relative flex-1 h-9 flex items-center">
                                                    {/* Today vertical indicator */}
                                                    {days.map((day, idx) => day.isToday && (
                                                        <div
                                                            key={idx}
                                                            style={{ left: `${idx * dayWidth + dayWidth / 2}px` }}
                                                            className="absolute top-0 bottom-0 w-[2px] bg-violet-500/40 z-0 pointer-events-none"
                                                        />
                                                    ))}

                                                    {/* Bar representation */}
                                                    <div
                                                        style={{
                                                            left: `${coords.left}px`,
                                                            width: `${coords.width}px`,
                                                        }}
                                                        title={`${item.name} (${item.start_date ? String(item.start_date).split('T')[0] : '-'} s/d ${item.end_date ? String(item.end_date).split('T')[0] : '-'})`}
                                                        className={`absolute h-7 rounded-xl ${barColor} shadow-sm px-2.5 flex items-center justify-between text-[11px] font-bold overflow-hidden transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer`}
                                                    >
                                                        <span className="truncate">{item.name}</span>
                                                        {item.progress !== undefined && (
                                                            <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded-full ml-1">
                                                                {item.progress}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
