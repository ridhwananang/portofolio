<?php

namespace App\Enums;

enum TransactionType: string
{
    case DEPOSIT = 'deposit';
    case PAYOUT = 'payout';
    case REFUND = 'refund';

    public function label(): string
    {
        return match ($this) {
            self::DEPOSIT => 'Deposit (Inflow Poster)',
            self::PAYOUT => 'Pencairan (Outflow Worker)',
            self::REFUND => 'Pengembalian Dana (Refund Poster)',
        };
    }
}
