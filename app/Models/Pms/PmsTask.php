<?php

namespace App\Models\Pms;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PmsTask extends Model
{
    use HasFactory;

    protected $table = 'pms_tasks';

    protected $fillable = [
        'project_id',
        'sprint_id',
        'title',
        'description',
        'status',
        'priority',
        'assigned_to',
        'due_date',
        'estimated_hours',
        'actual_hours',
        'order_index',
        'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'order_index' => 'integer',
    ];

    protected $appends = [
        'subtasks_count',
        'completed_subtasks_count',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(PmsSprint::class, 'sprint_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(PmsSubtask::class, 'task_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(PmsAttachment::class, 'task_id');
    }

    public function getSubtasksCountAttribute(): int
    {
        return $this->subtasks()->count();
    }

    public function getCompletedSubtasksCountAttribute(): int
    {
        return $this->subtasks()->where('is_done', true)->count();
    }
}
