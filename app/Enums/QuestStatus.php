<?php

namespace App\Enums;

enum QuestStatus: string
{
    case DRAFT = 'draft';
    case PENDING_PAYMENT = 'pending_payment';
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case UNDER_REVIEW = 'under_review';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
    case DISPUTED = 'disputed';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_PAYMENT => 'Menunggu Pembayaran',
            self::OPEN => 'Terbuka (Dana Ditahan)',
            self::IN_PROGRESS => 'Sedang Dikerjakan',
            self::UNDER_REVIEW => 'Menunggu Review',
            self::COMPLETED => 'Selesai (Dana Cair)',
            self::CANCELLED => 'Dibatalkan',
            self::DISPUTED => 'Dalam Sengketa',
        };
    }
}
