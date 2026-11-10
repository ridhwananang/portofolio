<?php

namespace App\Models\Pms;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmsActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'pms_activity_logs';

    protected $fillable = [
        'project_id',
        'user_id',
        'action',
        'entity_type',
        'description',
        'properties',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function log(
        string $action,
        string $entityType,
        string $description,
        ?int $projectId = null,
        ?array $properties = null
    ): void {
        try {
            static::create([
                'project_id' => $projectId,
                'user_id' => auth()->id(),
                'action' => $action,
                'entity_type' => $entityType,
                'description' => $description,
                'properties' => $properties,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Silently fail logging so business operations are not blocked
        }
    }
}
