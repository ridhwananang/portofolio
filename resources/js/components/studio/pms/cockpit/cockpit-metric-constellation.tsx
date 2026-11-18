import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Coins,
    DollarSign,
    FolderKanban,
    ListTodo,
    TrendingUp,
    Zap,
} from 'lucide-react';
import React from 'react';
import type { PmsStats } from '@/types/pms';
import { formatCurrencyIdr } from './cockpit-utils';

interface CockpitMetricConstellationProps {
    stats: PmsStats;
    isAdmin: boolean;
}

interface MetricCardConfig {
    key: string;
    label: string;
    href: string;
    icon: React.ElementType;
    iconTone: string;
    accentGradient: string;
    value: string | number;
    subValue?: string;
    footer: React.ReactNode;
}

export function CockpitMetricConstellation({ stats, isAdmin }: CockpitMetricConstellationProps) {
    const todoCount = stats.todo_tasks ?? 0;
    const inProgressCount = stats.in_progress_tasks ?? 0;
    const reviewCount = stats.review_tasks ?? 0;
    const totalSprints = stats.total_sprints ?? stats.active_sprints;
    const completionRate =
        stats.completion_rate ??
        (stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0);

    const budgetBurnRate =
        stats.total_budget > 0
            ? Math.min(100, Math.round((stats.total_expenses / stats.total_budget) * 100))
            : 0;

    const sharedProjectCard: MetricCardConfig = {
        key: 'projects',
        label: isAdmin ? 'Proyek Berjalan' : 'Proyek Diikuti',
        href: '/studio/pms/projects',
        icon: FolderKanban,
        iconTone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
        accentGradient: 'from-violet-500 via-indigo-500 to-transparent',
        value: stats.active_projects,
        subValue: `/ ${stats.total_projects} total`,
        footer: (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>{stats.completed_projects} proyek selesai</span>
            </span>
        ),
    };

    const sharedSprintCard: MetricCardConfig = {
        key: 'sprints',
        label: 'Siklus Sprint Aktif',
        href: '/studio/pms/sprints',
        icon: Zap,
        iconTone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        accentGradient: 'from-amber-500 via-orange-500 to-transparent',
        value: stats.active_sprints,
        subValue: `/ ${totalSprints} sprint`,
        footer: (
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <Clock className="size-3.5 text-amber-500 shrink-0" />
                <span>{stats.open_tasks} tugas dalam antrean</span>
            </span>
        ),
    };

    const roleSpecificCards: MetricCardConfig[] = isAdmin
        ? [
              {
                  key: 'budget',
                  label: 'Total Anggaran',
                  href: '/studio/pms/finances',
                  icon: Coins,
                  iconTone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                  accentGradient: 'from-emerald-500 via-teal-500 to-transparent',
                  value: formatCurrencyIdr(stats.total_budget),
                  footer: (
                      <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                          <TrendingUp className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Pemasukan: {formatCurrencyIdr(stats.total_income)}</span>
                      </span>
                  ),
              },
              {
                  key: 'remaining',
                  label: 'Sisa Anggaran',
                  href: '/studio/pms/finances',
                  icon: DollarSign,
                  iconTone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
                  accentGradient: 'from-cyan-500 via-sky-500 to-transparent',
                  value: formatCurrencyIdr(stats.remaining_budget),
                  footer: (
                      <div className="flex items-center justify-between gap-2 w-full">
                          <span className="text-rose-600 dark:text-rose-400 font-medium truncate">
                              Keluar: {formatCurrencyIdr(stats.total_expenses)}
                          </span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                              {budgetBurnRate}% terpakai
                          </span>
                      </div>
                  ),
              },
          ]
        : [
              {
                  key: 'tasks',
                  label: 'Jobdesk & Antrean',
                  href: '/studio/pms/tasks',
                  icon: ListTodo,
                  iconTone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                  accentGradient: 'from-indigo-500 via-violet-500 to-transparent',
                  value: stats.open_tasks,
                  subValue: `/ ${stats.total_tasks} tugas`,
                  footer: (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                              Proses {inProgressCount}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                              Review {reviewCount}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20">
                              To Do {todoCount}
                          </span>
                      </div>
                  ),
              },
              {
                  key: 'completion',
                  label: 'Penyelesaian Tugas',
                  href: '/studio/pms/tasks',
                  icon: CheckCircle2,
                  iconTone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                  accentGradient: 'from-emerald-500 via-cyan-500 to-transparent',
                  value: `${completionRate}%`,
                  subValue: `${stats.completed_tasks}/${stats.total_tasks} selesai`,
                  footer: (
                      <div className="w-full space-y-1.5">
                          <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                              <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
                                  style={{ width: `${completionRate}%` }}
                              />
                          </div>
                      </div>
                  ),
              },
          ];

    const cards = [sharedProjectCard, sharedSprintCard, ...roleSpecificCards];

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <Link
                        key={card.key}
                        href={card.href}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/65 p-5 backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-violet-500/35 dark:hover:border-violet-400/30 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {card.label}
                                </span>
                                <span className={`p-2 rounded-xl border ${card.iconTone}`}>
                                    <Icon className="size-4" />
                                </span>
                            </div>

                            <div className="mt-3.5 flex items-baseline gap-2 flex-wrap">
                                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                    {card.value}
                                </span>
                                {card.subValue && (
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {card.subValue}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0 flex-1">{card.footer}</div>
                            <ArrowUpRight className="size-3.5 text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-violet-500 transition-all shrink-0" />
                        </div>

                        {/* Ambient Bottom Hover Accent */}
                        <div
                            aria-hidden="true"
                            className={`absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r ${card.accentGradient} opacity-35 group-hover:opacity-90 transition-opacity`}
                        />
                    </Link>
                );
            })}
        </section>
    );
}
