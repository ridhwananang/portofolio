import { LayoutGrid, List, RotateCcw, Search, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PmsProject } from '@/types/pms';

interface KanbanToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    selectedProject: string;
    onProjectChange: (value: string) => void;
    selectedPriority: string;
    onPriorityChange: (value: string) => void;
    projects: PmsProject[];
    cardDensity: 'standard' | 'compact';
    onDensityChange: (density: 'standard' | 'compact') => void;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export function KanbanToolbar({
    search,
    onSearchChange,
    onSearchSubmit,
    selectedProject,
    onProjectChange,
    selectedPriority,
    onPriorityChange,
    projects,
    cardDensity,
    onDensityChange,
    hasActiveFilters,
    onResetFilters,
}: KanbanToolbarProps) {
    return (
        <div className="glass-panel rounded-2xl border border-slate-200/85 p-3 shadow-xs sm:p-3.5 dark:border-white/10">
            <form
                onSubmit={onSearchSubmit}
                className="flex flex-col gap-2.5 lg:flex-row lg:items-center"
            >
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari tugas berdasarkan judul, catatan, atau kode proyek..."
                        className="h-9.5 rounded-xl border-slate-200/90 bg-white/90 pr-9 pl-10 text-xs shadow-2xs sm:text-sm dark:border-white/10 dark:bg-slate-950/70"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            aria-label="Hapus pencarian"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={selectedProject}
                        onValueChange={onProjectChange}
                    >
                        <SelectTrigger className="h-9.5 min-w-[155px] flex-1 rounded-xl border-slate-200/90 bg-white/90 text-xs font-medium sm:w-48 sm:flex-none dark:border-white/10 dark:bg-slate-950/70">
                            <SelectValue placeholder="Semua Proyek" />
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
                        value={selectedPriority}
                        onValueChange={onPriorityChange}
                    >
                        <SelectTrigger className="h-9.5 min-w-[135px] flex-1 rounded-xl border-slate-200/90 bg-white/90 text-xs font-medium sm:w-40 sm:flex-none dark:border-white/10 dark:bg-slate-950/70">
                            <SelectValue placeholder="Semua Prioritas" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Prioritas</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <div
                        className="inline-flex h-9.5 items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-0.5 dark:border-white/10 dark:bg-slate-950/70"
                        title="Tampilan kartu"
                    >
                        <button
                            type="button"
                            onClick={() => onDensityChange('standard')}
                            className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                                cardDensity === 'standard'
                                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <LayoutGrid className="size-3.5" />
                            <span className="hidden sm:inline">Standar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onDensityChange('compact')}
                            className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                                cardDensity === 'compact'
                                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <List className="size-3.5" />
                            <span className="hidden sm:inline">Kompak</span>
                        </button>
                    </div>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onResetFilters}
                            className="h-9.5 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                            <RotateCcw className="size-3.5" />
                            Reset
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
