<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ProjectOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_code',
        'client_name',
        'client_email',
        'client_phone',
        'project_type',
        'selected_features',
        'delivery_speed',
        'notes',
        'total_amount',
        'currency',
        'status',
        'staging_url',
        'quest_id',
    ];

    protected function casts(): array
    {
        return [
            'selected_features' => 'array',
            'total_amount' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ProjectOrder $order) {
            if (empty($order->tracking_code)) {
                $order->tracking_code = 'PRJ-' . strtoupper(Str::random(8));
            }
        });
    }

    public function quest(): BelongsTo
    {
        return $this->belongsTo(Quest::class);
    }

    public function isPendingPayment(): bool
    {
        return $this->status === 'pending_payment';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isInReview(): bool
    {
        return $this->status === 'in_review';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
