import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    href?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconColor = 'text-primary',
    iconBg = 'bg-primary/10',
    href,
}: StatCardProps) {
    const content = (
        <Card className="group relative overflow-hidden rounded-2xl border border-sidebar-border/70 bg-card/85 backdrop-blur-xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-violet-500/30 h-full">
            {/* Top micro gradient line on hover */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{value}</p>
                        {description && (
                            <p className="text-[11px] text-muted-foreground truncate font-medium">{description}</p>
                        )}
                    </div>
                    <div className={cn('p-3.5 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs', iconBg)}>
                        <Icon className={cn('size-5 sm:size-6', iconColor)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return href ? (
        <Link href={href} className="block h-full">
            {content}
        </Link>
    ) : (
        content
    );
}
