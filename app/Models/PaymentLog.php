<?php

namespace App\Models;

use App\Enums\PaymentLogStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event',
        'xendit_id',
        'external_id',
        'payload',
        'ip_address',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'status' => PaymentLogStatus::class,
        ];
    }
}
