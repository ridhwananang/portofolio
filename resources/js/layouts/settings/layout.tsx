import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { LucideIcon } from 'lucide-react';
import { User, ShieldCheck, Palette, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    description: string;
}

const sidebarNavItems: SettingsNavItem[] = [
    {
        title: 'Profil Akun',
        href: toUrl(edit()),
        icon: User,
        description: 'Informasi akun utama & email',
    },
    {
        title: 'Keamanan & Autentikasi',
        href: toUrl(editSecurity()),
        icon: ShieldCheck,
        description: 'Kata sandi, 2FA, & passkey',
    },
    {
        title: 'Tema & Tampilan',
        href: toUrl(editAppearance()),
        icon: Palette,
        description: 'Mode gelap, terang, atau sistem',
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Cockpit Hero Banner */}
            <div className="glass-card relative overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xl shadow-slate-100/50 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-blue-500/5 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            Account Center & Preferences
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Pengaturan &{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                Keamanan Akun
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            Kelola kredensial akun pengembang, autentikasi dua faktor, passkey biometrik, dan preferensi tema tampilan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                        >
                            <Link href="/admin">
                                <ArrowLeft className="size-4 mr-1.5" />
                                Kembali ke Cockpit
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Segmented Settings Navigation & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Navigation Aside (4 cols) */}
                <aside className="lg:col-span-4 space-y-2">
                    <nav className="space-y-2" aria-label="Settings Navigation">
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3.5 p-4 rounded-[1.6rem] border transition-all duration-300',
                                        active
                                            ? 'border-violet-500/40 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-blue-500/5 shadow-md shadow-violet-500/5'
                                            : 'border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-violet-300 dark:hover:border-slate-700 shadow-xs'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex size-10 items-center justify-center rounded-2xl border transition-all duration-300 shrink-0',
                                            active
                                                ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/25'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 group-hover:text-violet-600 dark:group-hover:text-violet-400'
                                        )}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className={cn(
                                                'text-xs sm:text-sm font-bold truncate transition-colors',
                                                active
                                                    ? 'text-violet-700 dark:text-violet-300 font-extrabold'
                                                    : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                                            )}
                                        >
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {item.description}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content Panel (8 cols) */}
                <main className="lg:col-span-8">
                    <div className="glass-card rounded-[2rem] sm:rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
