import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [], label = 'Platform' }: { items: NavItem[]; label?: string }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-1">
            <SidebarGroupLabel className="px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-0.5">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-200 ${
                                    active
                                        ? 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-semibold shadow-xs border border-violet-500/20'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-2.5">
                                    {item.icon && (
                                        <item.icon
                                            className={`size-4 transition-transform duration-200 group-hover:scale-105 ${
                                                active
                                                    ? 'text-violet-600 dark:text-violet-400'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                        />
                                    )}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
