import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Briefcase,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Clock,
    Coins,
    DollarSign,
    FolderKanban,
    Layers,
    ListTodo,
    Plus,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { PmsActivityLog, PmsProject, PmsProjectHealth, PmsStats } from '@/types/pms';

interface Props {
    stats: PmsStats;
    projectHealth: PmsProjectHealth[];
    timelineTasks: any[];
    upcomingDeadlines: any[];
    recentLogs: PmsActivityLog[];
    projects: PmsProject[];
}

export default function PmsDashboard({
    stats,
    projectHealth,
    timelineTasks,
    upcomingDeadlines,
    recentLogs,
    projects,
}: Props) {
    const formatCurrency = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val) || 0);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management System (PMS)', href: '/studio/pms' },
            ]}
        >
            <Head title="PMS Executive Cockpit - Studio Workspace" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
                {/* 1. Cockpit Header with Architectural Aura */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-cyan-500/10 p-6 md:p-8 backdrop-blur-2xl shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                                <Sparkles className="size-3.5 text-violet-500 animate-pulse" />
                                Enterprise Project Management Suite
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                PMS Executive Cockpit
                            </h1>
                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                                Pantau kesehatan pengerjaan proyek, efisiensi siklus sprint, progres tugas kanban, dan realisasi anggaran secara terstruktur dan terpadu.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-violet-500/25 h-11 px-5 gap-2 cursor-pointer">
                                <Link href="/studio/pms/projects">
                                    <FolderKanban className="size-4" />
                                    Daftar Proyek
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-xl h-11 px-4 gap-2 border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md cursor-pointer">
                                <Link href="/studio/pms/tasks">
                                    <Zap className="size-4 text-amber-500" />
                                    Kanban Board
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 2. Floating Metric Constellation */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Proyek Aktif */}
                    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Proyek Berjalan</span>
                            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                <FolderKanban className="size-4" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                {stats.active_projects}
                            </span>
                            <span className="text-xs text-slate-500">/ {stats.total_projects} total</span>
                        </div>
                        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="size-3.5" />
                            {stats.completed_projects} proyek selesai
                        </div>
                    </div>

                    {/* Sprint & Velocity */}
                    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Sprint Aktif</span>
                            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Zap className="size-4" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                {stats.active_sprints}
                            </span>
                            <span className="text-xs text-slate-500">siklus berjalan</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="size-3.5 text-amber-500" />
                            {stats.open_tasks} tugas dalam antrean
                        </div>
                    </div>

                    {/* Total Anggaran / Budget */}
                    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Anggaran</span>
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Coins className="size-4" />
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(stats.total_budget)}
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <TrendingUp className="size-3.5 text-emerald-500" />
                            Pemasukan: {formatCurrency(stats.total_income)}
                        </div>
                    </div>

                    {/* Realisasi Pengeluaran */}
                    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-semibold uppercase tracking-wider">Sisa Anggaran</span>
                            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <DollarSign className="size-4" />
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {formatCurrency(stats.remaining_budget)}
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium">
                            <span>Pengeluaran: {formatCurrency(stats.total_expenses)}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Project Health Constellation (Visual Bars & Statuses) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="size-5 text-violet-500" />
                                Kesehatan & Progres Proyek (Project Health)
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pantau sisa hari menuju tenggat waktu, pembagian sprint, dan rasio penyelesaian tugas.
                            </p>
                        </div>
                        <Link href="/studio/pms/projects" className="text-xs font-semibold text-violet-600 hover:text-violet-500 flex items-center gap-1">
                            Lihat Semua Proyek <ArrowUpRight className="size-3.5" />
                        </Link>
                    </div>

                    {projectHealth.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500">
                            Belum ada proyek PMS yang terdaftar. Mulai dengan membuat proyek baru atau impor dari Order Klien.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {projectHealth.slice(0, 6).map((proj) => {
                                const healthColor =
                                    proj.progress >= 85
                                        ? 'bg-emerald-500'
                                        : proj.progress >= 40
                                        ? 'bg-indigo-500'
                                        : 'bg-amber-500';

                                return (
                                    <Link
                                        key={proj.id}
                                        href={`/studio/pms/projects/${proj.id}`}
                                        className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-violet-500/40 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider bg-violet-500/10 px-2 py-0.5 rounded-md">
                                                        {proj.code}
                                                    </span>
                                                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1 group-hover:text-violet-600 transition-colors line-clamp-1">
                                                        {proj.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">Klien: {proj.client}</p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize text-[11px] font-semibold"
                                                >
                                                    {proj.status.replace('_', ' ')}
                                                </Badge>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-4 space-y-1.5">
                                                <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Penyelesaian</span>
                                                        <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold group-hover:underline">
                                                            (Rincian ↗)
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {proj.progress}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${healthColor} rounded-full transition-all duration-700`}
                                                        style={{ width: `${proj.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <CalendarDays className="size-3.5 text-slate-400" />
                                                {proj.days_left !== null ? (
                                                    proj.days_left >= 0 ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400">
                                                            {proj.days_left} hari tersisa
                                                        </span>
                                                    ) : (
                                                        <span className="text-rose-500 font-semibold">
                                                            Lewat {Math.abs(proj.days_left)} hari
                                                        </span>
                                                    )
                                                ) : (
                                                    'Tanpa deadline'
                                                )}
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <span>⚡ {proj.active_sprints} Sprint</span>
                                                <span>•</span>
                                                <span>📋 {proj.open_tasks} Task</span>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 4. Dual Section: Upcoming Deadlines & Recent System Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Stream: Upcoming Deadlines (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="size-4 text-amber-500" />
                                Tenggat Waktu Mendatang (Next 14 Days)
                            </h2>
                            <Link href="/studio/pms/tasks" className="text-xs text-violet-600 hover:underline">
                                Buka Kanban
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-4 space-y-3">
                            {upcomingDeadlines.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500">
                                    Tidak ada tugas mendekati tenggat waktu dalam 14 hari ke depan. Semua pengerjaan terkendali! 🎉
                                </div>
                            ) : (
                                upcomingDeadlines.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 hover:border-violet-500/30 transition-all"
                                    >
                                        <div className="space-y-1">
                                            <div className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                                                {task.title}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="text-violet-600 font-medium">{task.project_name}</span>
                                                <span>•</span>
                                                <span>Due: {task.due_date}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={`text-[10px] capitalize font-medium ${
                                                    task.priority === 'urgent'
                                                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                        : task.priority === 'high'
                                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                                }`}
                                            >
                                                {task.priority}
                                            </Badge>
                                            {task.assignee && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600">
                                                    {task.assignee.name.split(' ')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Stream: Audit Activity Logs (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="size-4 text-violet-500" />
                                Aktivitas & Log Sistem
                            </h2>
                            <Link href="/studio/pms/activity-logs" className="text-xs text-violet-600 hover:underline">
                                Log Lengkap
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm p-4 space-y-3">
                            {recentLogs.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500">
                                    Belum ada log aktivitas tercatat.
                                </div>
                            ) : (
                                recentLogs.map((log) => (
                                    <div key={log.id} className="text-xs space-y-1 py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                                            {log.description}
                                        </div>
                                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                            <span>{log.user?.name ?? 'Sistem'}</span>
                                            <span>{new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
