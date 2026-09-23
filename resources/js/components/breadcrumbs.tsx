import React from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Briefcase,
    Award,
    Layers,
    Mail,
    ShoppingBag,
    User,
    FolderKanban,
    ChevronLeft,
    ShieldCheck,
    Palette,
    Settings,
} from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

function getBreadcrumbIcon(title: string) {
    const lower = title.toLowerCase();
    if (lower.includes('studio') || lower.includes('cockpit') || lower.includes('overview') || lower.includes('dashboard')) {
        return <LayoutDashboard className="size-3.5 text-violet-500 shrink-0" />;
    }
    if (lower.includes('proyek') || lower.includes('portofolio') || lower.includes('karya') || lower.includes('project')) {
        return <Briefcase className="size-3.5 text-blue-500 shrink-0" />;
    }
    if (lower.includes('sertifikat') || lower.includes('lisensi') || lower.includes('kredensial') || lower.includes('certificate')) {
        return <Award className="size-3.5 text-amber-500 shrink-0" />;
    }
    if (lower.includes('tech') || lower.includes('stack') || lower.includes('matrix') || lower.includes('keahlian')) {
        return <Layers className="size-3.5 text-cyan-500 shrink-0" />;
    }
    if (lower.includes('order') || lower.includes('pesanan') || lower.includes('rekber') || lower.includes('transaksi') || lower.includes('quest')) {
        return <ShoppingBag className="size-3.5 text-emerald-500 shrink-0" />;
    }
    if (lower.includes('pesan') || lower.includes('inbox') || lower.includes('mail') || lower.includes('kontak')) {
        return <Mail className="size-3.5 text-pink-500 shrink-0" />;
    }
    if (lower.includes('keamanan') || lower.includes('security') || lower.includes('sandi') || lower.includes('password') || lower.includes('2fa') || lower.includes('passkey')) {
        return <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />;
    }
    if (lower.includes('tampilan') || lower.includes('appearance') || lower.includes('tema') || lower.includes('theme')) {
        return <Palette className="size-3.5 text-violet-500 shrink-0" />;
    }
    if (lower.includes('profil') || lower.includes('bio') || lower.includes('identitas') || lower.includes('profile')) {
        return <User className="size-3.5 text-indigo-500 shrink-0" />;
    }
    if (lower.includes('pengaturan') || lower.includes('setting')) {
        return <Settings className="size-3.5 text-slate-500 shrink-0" />;
    }
    return <FolderKanban className="size-3.5 text-slate-400 shrink-0" />;
}

export function Breadcrumbs({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    const currentItem = breadcrumbs[breadcrumbs.length - 1];
    const prevItem = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;

    return (
        <nav aria-label="Breadcrumbs" className="min-w-0 flex items-center">
            {/* Mobile Compact Breadcrumbs View (< sm / 640px) */}
            <div className="flex sm:hidden items-center gap-1 min-w-0">
                {prevItem && (
                    <>
                        <Link
                            href={prevItem.href}
                            className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shrink-0 transition-colors"
                            title={`Kembali ke ${prevItem.title}`}
                        >
                            <ChevronLeft className="size-3.5 shrink-0" />
                            <span className="truncate max-w-[70px]">{prevItem.title}</span>
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700 text-[10px] shrink-0 select-none">/</span>
                    </>
                )}
                <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white font-bold text-xs shadow-2xs min-w-0 shrink"
                    aria-current="page"
                >
                    {getBreadcrumbIcon(currentItem.title)}
                    <span className="truncate max-w-[130px] xs:max-w-[170px]">
                        {currentItem.title}
                    </span>
                </span>
            </div>

            {/* Tablet & Desktop Segmented Trail View (>= sm / 640px) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold min-w-0">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const isFirst = index === 0;

                    return (
                        <React.Fragment key={index}>
                            {index > 0 && (
                                <span className="text-slate-300 dark:text-slate-700 font-light select-none px-0.5 text-[11px] shrink-0">
                                    /
                                </span>
                            )}

                            {isLast ? (
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white font-bold shadow-2xs min-w-0 shrink"
                                    aria-current="page"
                                >
                                    {getBreadcrumbIcon(item.title)}
                                    <span className="truncate max-w-[160px] md:max-w-[220px] xl:max-w-none">
                                        {item.title}
                                    </span>
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors shrink-0 max-w-[90px] md:max-w-[130px] xl:max-w-none"
                                >
                                    {isFirst && getBreadcrumbIcon(item.title)}
                                    <span className="truncate">
                                        {item.title}
                                    </span>
                                </Link>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </nav>
    );
}
