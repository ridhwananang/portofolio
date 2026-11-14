<?php

namespace App\Models\Pms;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PmsFinance extends Model
{
    use HasFactory;

    protected $table = 'pms_finances';

    protected $fillable = [
        'project_id',
        'type',
        'title',
        'category',
        'amount',
        'transaction_date',
        'notes',
        'receipt_file',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    protected $appends = [
        'receipt_url',
    ];

    public function getReceiptUrlAttribute(): ?string
    {
        if (! $this->receipt_file) {
            return null;
        }

        if (str_starts_with($this->receipt_file, 'http://') || str_starts_with($this->receipt_file, 'https://') || str_starts_with($this->receipt_file, '/')) {
            return $this->receipt_file;
        }

        return Storage::disk(config('filesystems.default'))->url($this->receipt_file);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
