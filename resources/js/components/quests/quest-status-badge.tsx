import { Badge } from '@/components/ui/badge';
import type { QuestStatusType } from '@/types/quest';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileEdit,
    PlayCircle,
    ShieldCheck,
    XCircle,
} from 'lucide-react';

interface Props {
    status: QuestStatusType;
    className?: string;
}

export function QuestStatusBadge({ status, className }: Props) {
    switch (status) {
        case 'draft':
            return (
                <Badge variant="outline" className={`gap-1 border-neutral-400 text-neutral-600 dark:text-neutral-400 ${className}`}>
                    <FileEdit className="size-3" />
                    Draft
                </Badge>
            );
        case 'pending_payment':
            return (
                <Badge variant="secondary" className={`gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
                    <Clock className="size-3" />
                    Menunggu Pembayaran
                </Badge>
            );
        case 'open':
            return (
                <Badge variant="default" className={`gap-1 bg-emerald-600 text-white dark:bg-emerald-500 ${className}`}>
                    <ShieldCheck className="size-3" />
                    Terbuka (Rekber Aktif)
                </Badge>
            );
        case 'in_progress':
            return (
                <Badge variant="secondary" className={`gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}>
                    <PlayCircle className="size-3" />
                    Sedang Dikerjakan
                </Badge>
            );
        case 'under_review':
            return (
                <Badge variant="secondary" className={`gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 ${className}`}>
                    <Clock className="size-3" />
                    Menunggu Review
                </Badge>
            );
        case 'completed':
            return (
                <Badge variant="default" className={`gap-1 bg-green-600 text-white dark:bg-green-500 ${className}`}>
                    <CheckCircle2 className="size-3" />
                    Selesai (Dana Cair)
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge variant="outline" className={`gap-1 border-neutral-500 text-neutral-500 ${className}`}>
                    <XCircle className="size-3" />
                    Dibatalkan
                </Badge>
            );
        case 'disputed':
            return (
                <Badge variant="destructive" className={`gap-1 ${className}`}>
                    <AlertTriangle className="size-3" />
                    Dalam Sengketa
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
