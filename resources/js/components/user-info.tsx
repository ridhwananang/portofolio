import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <div className="relative shrink-0">
                <Avatar className="size-8 overflow-hidden rounded-full border border-slate-200 dark:border-white/10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 font-bold text-xs">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight overflow-hidden">
                <span className="truncate font-semibold text-slate-900 dark:text-white">{user.name}</span>
                <span className="truncate text-[10.5px] text-muted-foreground">
                    {showEmail ? user.email : (user.is_admin ? 'Administrator' : 'Klien')}
                </span>
            </div>
        </div>
    );
}
