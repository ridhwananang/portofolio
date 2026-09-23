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
        'client_brief',
        'delivery_speed',
        'notes',
        'total_amount',
        'currency',
        'payment_scheme',
        'dp_percentage',
        'dp_amount',
        'remaining_amount',
        'payment_stage',
        'dp_paid_at',
        'final_paid_at',
        'dp_transaction_id',
        'final_transaction_id',
        'status',
        'milestone_progress',
        'staging_url',
        'handover_data',
        'revision_notes',
        'quest_id',
    ];

    protected function casts(): array
    {
        return [
            'selected_features' => 'array',
            'client_brief' => 'array',
            'milestone_progress' => 'array',
            'handover_data' => 'array',
            'revision_notes' => 'array',
            'total_amount' => 'decimal:2',
            'dp_percentage' => 'decimal:2',
            'dp_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'dp_paid_at' => 'datetime',
            'final_paid_at' => 'datetime',
        ];
    }

    public static function getDefaultMilestones(?string $status = null): array
    {
        $isDepositCompleted = in_array($status, ['in_progress', 'in_review', 'completed']);

        return [
            [
                'id' => 'deposit',
                'title' => 'DP Terverifikasi (Uang Muka)',
                'description' => 'Pembayaran DP telah diamankan di Rekening Bersama (Escrow) untuk memulai pengerjaan.',
                'status' => $isDepositCompleted ? 'completed' : 'pending',
                'updated_at' => $isDepositCompleted ? now()->toIso8601String() : null,
            ],
            [
                'id' => 'design',
                'title' => 'Perancangan UI/UX & Arsitektur',
                'description' => 'Penyusunan wireframe, mockup visual, dan arsitektur database sesuai kebutuhan klien.',
                'status' => in_array($status, ['in_review', 'completed']) ? 'completed' : ($status === 'in_progress' ? 'in_progress' : 'pending'),
                'updated_at' => null,
            ],
            [
                'id' => 'development',
                'title' => 'Pengembangan Sistem & Fitur',
                'description' => 'Pengkodean modul frontend & backend serta integrasi API secara intensif.',
                'status' => in_array($status, ['in_review', 'completed']) ? 'completed' : ($status === 'in_progress' ? 'in_progress' : 'pending'),
                'updated_at' => null,
            ],
            [
                'id' => 'staging',
                'title' => 'Preview Staging Live & Uji Coba Klien',
                'description' => 'Website aktif di server preview agar klien dapat menguji coba langsung seluruh fitur.',
                'status' => $status === 'completed' ? 'completed' : ($status === 'in_review' ? 'in_progress' : 'pending'),
                'updated_at' => null,
            ],
            [
                'id' => 'handover',
                'title' => 'Persetujuan Final & Pelunasan',
                'description' => 'Klien menyetujui hasil akhir, melunasi sisa tagihan, dan akses repositori/kredensial diserahkan.',
                'status' => $status === 'completed' ? 'completed' : 'pending',
                'updated_at' => null,
            ],
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ProjectOrder $order) {
            if (empty($order->tracking_code)) {
                $order->tracking_code = 'PRJ-' . strtoupper(Str::random(8));
            }
            if (empty($order->milestone_progress)) {
                $order->milestone_progress = static::getDefaultMilestones($order->status);
            }
        });
    }

    public function quest(): BelongsTo
    {
        return $this->belongsTo(Quest::class);
    }

    public function dpTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'dp_transaction_id');
    }

    public function finalTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'final_transaction_id');
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

    public function isDpPaid(): bool
    {
        if (in_array($this->payment_stage, ['dp_paid', 'awaiting_final', 'fully_paid']) || !empty($this->dp_paid_at)) {
            return true;
        }

        $dpTx = $this->dpTransaction ?? $this->quest?->dpDepositTransaction ?? $this->quest?->depositTransaction;
        if ($dpTx && in_array($dpTx->status, [\App\Enums\TransactionStatus::HELD, \App\Enums\TransactionStatus::RELEASED])) {
            return true;
        }

        return false;
    }

    public function isFullyPaid(): bool
    {
        if ($this->payment_stage === 'fully_paid' || !empty($this->final_paid_at) || $this->status === 'completed') {
            return true;
        }

        $finalTx = $this->finalTransaction ?? $this->quest?->finalDepositTransaction;
        if ($finalTx && in_array($finalTx->status, [\App\Enums\TransactionStatus::HELD, \App\Enums\TransactionStatus::RELEASED])) {
            return true;
        }

        return false;
    }

    public function isAwaitingFinal(): bool
    {
        return $this->payment_stage === 'awaiting_final' || ($this->isInReview() && $this->isDpPaid() && !$this->isFullyPaid());
    }
}

