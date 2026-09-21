<?php

namespace App\Models;

use App\Enums\QuestStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Quest extends Model
{
    use HasFactory;

    protected $fillable = [
        'poster_id',
        'worker_id',
        'title',
        'description',
        'reward_amount',
        'fee_amount',
        'total_amount',
        'currency',
        'status',
        'submitted_work_notes',
        'dispute_reason',
        'submitted_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => QuestStatus::class,
            'reward_amount' => 'decimal:2',
            'fee_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'poster_id');
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function depositTransaction(): HasOne
    {
        return $this->hasOne(Transaction::class)->where('type', TransactionType::DEPOSIT);
    }

    public function payoutTransaction(): HasOne
    {
        return $this->hasOne(Transaction::class)->where('type', TransactionType::PAYOUT);
    }

    public function projectOrder(): HasOne
    {
        return $this->hasOne(ProjectOrder::class);
    }

    public function isFunded(): bool
    {
        return in_array($this->status, [
            QuestStatus::OPEN,
            QuestStatus::IN_PROGRESS,
            QuestStatus::UNDER_REVIEW,
            QuestStatus::COMPLETED,
        ]);
    }

    public function canBeTakenBy(User $user): bool
    {
        return $this->status === QuestStatus::OPEN && $this->poster_id !== $user->id;
    }

    public function canBeSubmittedBy(User $user): bool
    {
        return $this->status === QuestStatus::IN_PROGRESS && $this->worker_id === $user->id;
    }

    public function canBeApprovedBy(User $user): bool
    {
        return $this->status === QuestStatus::UNDER_REVIEW && $this->poster_id === $user->id;
    }
}
