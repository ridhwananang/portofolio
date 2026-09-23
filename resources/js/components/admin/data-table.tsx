import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, X, Inbox } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PaginationLink } from '@/types';

interface DataTableProps {
    search?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: React.ReactNode;
    pagination?: {
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    children: React.ReactNode;
    empty?: boolean;
    emptyMessage?: string;
}

export function DataTable({
    search,
    onSearchChange,
    searchPlaceholder = 'Cari data...',
    filters,
    pagination,
    children,
    empty = false,
    emptyMessage = 'Tidak ada data yang sesuai dengan pencarian.',
}: DataTableProps) {
    return (
        <div className="space-y-4">
            {(onSearchChange || filters) && (
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {onSearchChange && (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                value={search || ''}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="pl-9 pr-8 h-9.5 rounded-xl border-sidebar-border/80 bg-background/50 focus-visible:ring-violet-500/30 focus-visible:border-violet-500 text-xs sm:text-sm"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                                    aria-label="Bersihkan pencarian"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                    {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
                </div>
            )}

            <div className="rounded-2xl border border-sidebar-border/70 overflow-hidden bg-card/85 shadow-xs backdrop-blur-xl transition-all">
                <div className="overflow-x-auto relative">{children}</div>

                {empty && (
                    <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="size-12 rounded-2xl bg-muted/40 border border-sidebar-border flex items-center justify-center text-muted-foreground shadow-xs">
                            <Inbox className="size-6 opacity-60" />
                        </div>
                        <div className="space-y-1 max-w-xs">
                            <p className="text-sm font-semibold text-foreground">Tidak Ada Data</p>
                            <p className="text-xs text-muted-foreground">{emptyMessage}</p>
                        </div>
                    </div>
                )}
            </div>

            {pagination && pagination.links.length > 3 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
                    <p className="text-xs text-muted-foreground font-medium">
                        Menampilkan <span className="font-semibold text-foreground">{pagination.from || 0}</span>–
                        <span className="font-semibold text-foreground">{pagination.to || 0}</span> dari{' '}
                        <span className="font-semibold text-foreground">{pagination.total}</span> data
                    </p>
                    <div className="flex items-center gap-1.5">
                        {pagination.links.map((link, i) => {
                            if (link.label.includes('Previous')) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        asChild={!!link.url}
                                        disabled={!link.url}
                                        className="h-8 px-2.5 rounded-lg border-sidebar-border/70 shadow-xs"
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                <ChevronLeft className="size-4" />
                                            </Link>
                                        ) : (
                                            <span>
                                                <ChevronLeft className="size-4" />
                                            </span>
                                        )}
                                    </Button>
                                );
                            }

                            if (link.label.includes('Next')) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        asChild={!!link.url}
                                        disabled={!link.url}
                                        className="h-8 px-2.5 rounded-lg border-sidebar-border/70 shadow-xs"
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                <ChevronRight className="size-4" />
                                            </Link>
                                        ) : (
                                            <span>
                                                <ChevronRight className="size-4" />
                                            </span>
                                        )}
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild={!!link.url}
                                    disabled={!link.url}
                                    className={`h-8 min-w-8 px-2.5 text-xs rounded-lg shadow-xs ${
                                        link.active ? 'bg-violet-600 hover:bg-violet-700 text-white font-semibold' : 'border-sidebar-border/70'
                                    }`}
                                >
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
