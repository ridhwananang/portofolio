<?php

namespace App\Models\Pms;

use App\Models\ProjectOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class PmsProject extends Model
{
    use HasFactory;

    protected $table = 'pms_projects';

    protected $fillable = [
        'name',
        'code',
        'client',
        'client_email',
        'description',
        'budget',
        'status',
        'priority',
        'start_date',
        'end_date',
        'portal_token',
        'portal_pin',
        'is_portal_active',
        'portal_last_accessed_at',
        'portal_last_email_sent_at',
        'project_order_id',
        'created_by',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_portal_active' => 'boolean',
        'portal_last_accessed_at' => 'datetime',
        'portal_last_email_sent_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function ($project) {
            if (empty($project->portal_token)) {
                $project->portal_token = self::generatePortalToken($project->name, $project->code);
            }
        });
    }

    /**
     * Generate a readable, client-friendly, yet unpredictable portal access token.
     */
    public static function generatePortalToken(?string $name = null, ?string $code = null): string
    {
        $slugSource = trim((string) ($name ?: $code ?: 'proyek'));
        $prefix = Str::slug($slugSource);
        $prefix = Str::limit($prefix, 32, '');
        $prefix = trim($prefix, '-') ?: 'proyek';

        return $prefix . '-' . strtolower(Str::random(8));
    }

    protected $appends = [
        'progress_percentage',
        'total_income',
        'total_expense',
        'remaining_budget',
        'budget_burn_rate',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function projectOrder(): BelongsTo
    {
        return $this->belongsTo(ProjectOrder::class, 'project_order_id');
    }

    public function detail(): HasOne
    {
        return $this->hasOne(PmsProjectDetail::class, 'project_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(PmsProjectMember::class, 'project_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'pms_project_members', 'project_id', 'user_id')
            ->withPivot(['role_in_project', 'hourly_rate', 'joined_at'])
            ->withTimestamps();
    }

    public function sprints(): HasMany
    {
        return $this->hasMany(PmsSprint::class, 'project_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(PmsTask::class, 'project_id');
    }

    public function finances(): HasMany
    {
        return $this->hasMany(PmsFinance::class, 'project_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(PmsAttachment::class, 'project_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(PmsActivityLog::class, 'project_id')->latest();
    }

    // Accessors
    public function getProgressPercentageAttribute(): int
    {
        $total = $this->tasks()->count();
        if ($total === 0) {
            return $this->status === 'completed' ? 100 : 0;
        }

        $done = $this->tasks()->where('status', 'done')->count();
        return (int) round(($done / $total) * 100);
    }

    public function getTotalIncomeAttribute(): float
    {
        return (float) $this->finances()->where('type', 'income')->sum('amount');
    }

    public function getTotalExpenseAttribute(): float
    {
        return (float) $this->finances()->where('type', 'project_expense')->sum('amount');
    }

    public function getRemainingBudgetAttribute(): float
    {
        $budget = (float) $this->budget;
        $expenses = $this->total_expense;
        return max(0, $budget - $expenses);
    }

    public function getBudgetBurnRateAttribute(): float
    {
        $budget = (float) $this->budget;
        if ($budget <= 0) return 0;
        return round(($this->total_expense / $budget) * 100, 1);
    }
}
