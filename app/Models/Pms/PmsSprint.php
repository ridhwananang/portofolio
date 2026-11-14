<?php

namespace App\Models\Pms;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PmsSprint extends Model
{
    use HasFactory;

    protected $table = 'pms_sprints';

    protected $fillable = [
        'project_id',
        'name',
        'goal',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = [
        'tasks_count',
        'completed_tasks_count',
        'progress_percentage',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(PmsTask::class, 'sprint_id');
    }

    public function getTasksCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    public function getCompletedTasksCountAttribute(): int
    {
        return $this->tasks()->where('status', 'done')->count();
    }

    public function getProgressPercentageAttribute(): int
    {
        $total = $this->tasks_count;
        if ($total === 0) {
            return $this->status === 'completed' ? 100 : 0;
        }

        return (int) round(($this->completed_tasks_count / $total) * 100);
    }
}
