<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsProjectMember;
use App\Models\Pms\PmsTask;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $avatar
 * @property string|null $phone
 * @property string|null $role_title
 * @property string $status
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'is_admin', 'avatar', 'phone', 'role_title', 'status'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Determine if the user has administrator privileges.
     */
    public function isAdmin(): bool
    {
        return (bool) ($this->attributes['is_admin'] ?? false) || $this->email === 'ridhwananang@gmail.com';
    }

    /**
     * PMS Relationships
     */
    public function pmsMemberships(): HasMany
    {
        return $this->hasMany(PmsProjectMember::class, 'user_id');
    }

    public function pmsProjects(): BelongsToMany
    {
        return $this->belongsToMany(PmsProject::class, 'pms_project_members', 'user_id', 'project_id')
            ->withPivot(['role_in_project', 'hourly_rate', 'joined_at'])
            ->withTimestamps();
    }

    public function assignedPmsTasks(): HasMany
    {
        return $this->hasMany(PmsTask::class, 'assigned_to');
    }

    public function createdPmsProjects(): HasMany
    {
        return $this->hasMany(PmsProject::class, 'created_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
