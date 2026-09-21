import type { QuestStatusType } from '@/types/quest';
import { Check, Clock, ShieldCheck, Banknote, AlertTriangle } from 'lucide-react';

interface Props {
    status: QuestStatusType;
}

export function EscrowStepper({ status }: Props) {
    if (status === 'cancelled') {
        return (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400">
                Quest ini telah dibatalkan. Dana yang telah masuk telah dikembalikan ke poster.
            </div>
        );
    }

    if (status === 'disputed') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="size-5 shrink-0" />
                <div>
                    <div className="font-semibold">Quest Sedang Dalam Sengketa</div>
                    <div className="text-xs text-destructive/90">
                        Dana rekber ditahan oleh sistem sementara waktu hingga arbitrase selesai.
                    </div>
                </div>
            </div>
        );
    }

    const steps = [
        {
            title: 'Rekber Didanai',
            description: 'Dana ditahan aman di Xendit',
            icon: ShieldCheck,
            isCompleted: ['open', 'in_progress', 'under_review', 'completed'].includes(status),
            isCurrent: status === 'pending_payment' || status === 'draft',
        },
        {
            title: 'Pengerjaan',
            description: 'Worker mengerjakan tugas',
            icon: Clock,
            isCompleted: ['under_review', 'completed'].includes(status),
            isCurrent: status === 'open' || status === 'in_progress',
        },
        {
            title: 'Review Pekerjaan',
            description: 'Poster memeriksa hasil kerja',
            icon: Check,
            isCompleted: status === 'completed',
            isCurrent: status === 'under_review',
        },
        {
            title: 'Dana Dicairkan',
            description: 'Transfer ke rekening worker',
            icon: Banknote,
            isCompleted: status === 'completed',
            isCurrent: status === 'completed',
        },
    ];

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.title}
                            className={`relative flex items-center gap-3 rounded-xl border p-3 transition-all ${
                                step.isCompleted
                                    ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20'
                                    : step.isCurrent
                                    ? 'border-primary/50 bg-primary/5 shadow-xs'
                                    : 'border-border/60 bg-muted/20 opacity-60'
                            }`}
                        >
                            <div
                                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                    step.isCompleted
                                        ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                                        : step.isCurrent
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-semibold text-foreground truncate">
                                    {idx + 1}. {step.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
