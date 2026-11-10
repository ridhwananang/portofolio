<?php

namespace App\Models\Pms;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmsSubtask extends Model
{
    use HasFactory;

    protected $table = 'pms_subtasks';

    protected $fillable = [
        'task_id',
        'title',
        'is_done',
        'completed_at',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(PmsTask::class, 'task_id');
    }
}
