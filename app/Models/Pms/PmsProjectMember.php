<?php

namespace App\Models\Pms;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmsProjectMember extends Model
{
    use HasFactory;

    protected $table = 'pms_project_members';

    protected $fillable = [
        'project_id',
        'user_id',
        'role_in_project',
        'hourly_rate',
        'joined_at',
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'joined_at' => 'date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
