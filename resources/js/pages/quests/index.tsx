import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestStatusBadge } from '@/components/quests/quest-status-badge';
import type { Quest } from '@/types/quest';
import { Coins, PlusCircle, ShieldCheck, User as UserIcon, ArrowRight } from 'lucide-react';

interface Props {
    quests: {
        data: Quest[];
        links: any[];
        total: number;
    };
    filters: {
        tab: string;
    };
}

export default function QuestIndex({ quests, filters }: Props) {
    const currentTab = filters.tab || 'all';

    const handleTabChange = (tab: string) => {
        router.get('/quests', { tab }, { preserveState: true });
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <>
            <Head title="Rekber Quests - Papan Tugas Bergaransi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <ShieldCheck className="size-4" />
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Rekber Quests
                            </h1>
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                100% Escrow Aman
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Sistem escrow otomatis. Dana poster dijamin ditahan di rekening bersama dan hanya cair ke worker saat hasil kerja disetujui.
                        </p>
                    </div>

                    <Button asChild className="gap-2 shrink-0">
                        <Link href="/quests/create">
                            <PlusCircle className="size-4" />
                            Buat Quest Baru
                        </Link>
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                    {[
                        { key: 'all', label: 'Semua Quest' },
                        { key: 'open', label: 'Tersedia Diambil' },
                        { key: 'my_created', label: 'Quest Saya (Poster)' },
                        { key: 'my_taken', label: 'Quest Diambil (Worker)' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                currentTab === tab.key
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Quest Grid */}
                {quests.data.length === 0 ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <ShieldCheck className="size-7" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-foreground">Belum ada Quest di kategori ini</h3>
                        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                            Jadilah yang pertama membuat quest dan rasakan keamanan sistem Rekening Bersama (Escrow).
                        </p>
                        <Button asChild className="mt-5 gap-2" variant="outline">
                            <Link href="/quests/create">
                                <PlusCircle className="size-4" />
                                Buat Quest Sekarang
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {quests.data.map((quest) => (
                            <Card key={quest.id} className="flex flex-col justify-between overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                                <CardHeader className="gap-3 pb-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <QuestStatusBadge status={quest.status} />
                                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                                            <Coins className="size-4 shrink-0" />
                                            <span>{formatCurrency(quest.reward_amount)}</span>
                                        </div>
                                    </div>
                                    <CardTitle className="line-clamp-1 text-lg font-semibold">
                                        {quest.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs">
                                        {quest.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-3 text-xs text-muted-foreground space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="size-3.5 text-muted-foreground" />
                                        <span>Poster: <strong className="text-foreground">{quest.poster?.name || 'Pengguna'}</strong></span>
                                    </div>
                                    {quest.worker && (
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="size-3.5 text-blue-500" />
                                            <span>Worker: <strong className="text-foreground">{quest.worker.name}</strong></span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="border-t border-border/50 bg-muted/20 pt-3">
                                    <Button asChild variant="ghost" size="sm" className="w-full justify-between hover:text-primary">
                                        <Link href={`/quests/${quest.id}`}>
                                            <span>Lihat Detail Rekber</span>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

QuestIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Rekber Quests',
            href: '/quests',
        },
    ],
};
