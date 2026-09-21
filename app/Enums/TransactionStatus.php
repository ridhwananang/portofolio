<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case PENDING = 'pending';
    case HELD = 'held';
    case RELEASING = 'releasing';
    case RELEASED = 'released';
    case FAILED = 'failed';
    case EXPIRED = 'expired';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Pembayaran',
            self::HELD => 'Dana Ditahan (Escrow)',
            self::RELEASING => 'Proses Pencairan',
            self::RELEASED => 'Dana Berhasil Dicairkan',
            self::FAILED => 'Gagal',
            self::EXPIRED => 'Kedaluwarsa',
            self::REFUNDED => 'Dikembalikan (Refund)',
        };
    }
}
