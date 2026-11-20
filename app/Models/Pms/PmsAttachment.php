<?php

namespace App\Models\Pms;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PmsAttachment extends Model
{
    use HasFactory;

    protected $table = 'pms_attachments';

    protected $fillable = [
        'project_id',
        'task_id',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'uploaded_by',
    ];

    protected $appends = [
        'file_url',
        'preview_url',
        'download_url',
    ];

    /**
     * Resolve target storage disk for project attachments (S3 bucket when configured).
     */
    public static function storageDisk(): string
    {
        if (! app()->runningUnitTests() && filled(config('filesystems.disks.s3.bucket'))) {
            return 's3';
        }

        return (string) config('filesystems.default', 'public');
    }

    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://') || str_starts_with($this->file_path, '/')) {
            return $this->file_path;
        }

        return Storage::disk(static::storageDisk())->url($this->file_path);
    }

    public function getPreviewUrlAttribute(): ?string
    {
        if (! $this->id) {
            return $this->file_url;
        }

        return "/studio/pms/attachments/{$this->id}/preview";
    }

    public function getDownloadUrlAttribute(): ?string
    {
        if (! $this->id) {
            return $this->file_url;
        }

        return "/studio/pms/attachments/{$this->id}/download";
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(PmsTask::class, 'task_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
