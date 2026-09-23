import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    backHref?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-sidebar-border/60">
            <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                    {backHref && (
                        <Button variant="ghost" size="icon" asChild className="size-8 rounded-xl border border-border/60 hover:bg-accent hover:border-border transition-all shadow-xs shrink-0">
                            <Link href={backHref}>
                                <ChevronLeft className="size-4" />
                            </Link>
                        </Button>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{title}</h1>
                </div>
                {description && <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">{description}</p>}
            </div>
            {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
    );
}
