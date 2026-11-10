import React, { useState } from 'react';
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
    Activity,
    CheckCircle2,
    Clock,
    Edit3,
    FolderKanban,
    History,
    Info,
    PlusCircle,
    Trash2,
    UserCheck,
    Zap,
} from 'lucide-react';
import { PmsActivityLog, PmsProject } from '@/types/pms';

interface Props {
    logs: {
        data: PmsActivityLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    projects: PmsProject[];
    filters: {
        project_id?: number;
        action?: string;
        entity_type?: string;
    };
}

export default function ActivityLogsIndex({ logs, projects, filters }: Props) {
    const [selectedProject, setSelectedProject] = useState(filters.project_id ? String(filters.project_id) : 'all');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [selectedEntity, setSelectedEntity] = useState(filters.entity_type || 'all');

    const handleFilterChange = (proj: string, act: string, ent: string) => {
        router.get(
            '/studio/pms/activity-logs',
            {
                project_id: proj !== 'all' ? proj : undefined,
                action: act !== 'all' ? act : undefined,
                entity_type: ent !== 'all' ? ent : undefined,
            },
            { preserveState: true }
        );
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'created':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Created</Badge>;
            case 'updated':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Updated</Badge>;
            case 'deleted':
                return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]">Deleted</Badge>;
            case 'status_changed':
                return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">Status Shift</Badge>;
            case 'assigned':
                return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px]">Assigned</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Studio', href: '/studio' },
                { title: 'Project Management', href: '/studio/pms' },
                { title: 'Audit & Activity Log', href: '/studio/pms/activity-logs' },
            ]}
        >
            <Head title="Audit Trail & Riwayat Aktivitas - Studio PMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                <History className="size-5" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Audit Trail & Log Aktivitas Sistem
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Pencatatan riwayat setiap aksi, perubahan status tugas, penugasan tim, dan pencatatan transaksi keuangan.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select
                            value={selectedProject}
                            onValueChange={(val) => {
                                setSelectedProject(val);
                                handleFilterChange(val, selectedAction, selectedEntity);
                            }}
                        >
                            <SelectTrigger className="w-52 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                                <SelectValue placeholder="Pilih Proyek" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Proyek</SelectItem>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={selectedAction}
                            onValueChange={(val) => {
                                setSelectedAction(val);
                                handleFilterChange(selectedProject, val, selectedEntity);
                            }}
                        >
                            <SelectTrigger className="w-40 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                                <SelectValue placeholder="Jenis Aksi" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Aksi</SelectItem>
                                <SelectItem value="created">Created</SelectItem>
                                <SelectItem value="updated">Updated</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                                <SelectItem value="status_changed">Status Changed</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Logs Timeline List */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 backdrop-blur-xl shadow-md space-y-4">
                    {logs.data.length === 0 ? (
                        <div className="py-16 text-center text-xs text-slate-400">
                            Tidak ada riwayat aktivitas yang cocok dengan filter yang dipilih.
                        </div>
                    ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                            {logs.data.map((log) => (
                                <div key={log.id} className="relative group">
                                    {/* Timeline Marker Dot */}
                                    <div className="absolute -left-[29px] top-1.5 size-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-violet-500 group-hover:scale-125 transition-transform" />

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {getActionBadge(log.action)}
                                                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                                    {log.description}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                                <span>Oleh: <strong className="text-slate-700 dark:text-slate-300">{log.user?.name ?? 'Sistem'}</strong></span>
                                                {log.project && (
                                                    <>
                                                        <span>•</span>
                                                        <Link
                                                            href={`/studio/pms/projects/${log.project.id}`}
                                                            className="text-violet-600 font-medium hover:underline"
                                                        >
                                                            {log.project.name}
                                                        </Link>
                                                    </>
                                                )}
                                                {log.entity_type && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="capitalize">{log.entity_type}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <span className="text-xs text-slate-400 shrink-0">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
