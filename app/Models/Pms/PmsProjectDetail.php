<?php

namespace App\Models\Pms;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PmsProjectDetail extends Model
{
    use HasFactory;

    protected $table = 'pms_project_details';

    protected $fillable = [
        'project_id',
        'background',
        'objective',
        'scope',
        'tech_stack',
        'deliverables',
        'repository_url',
        'live_demo_url',
        'notes',
    ];

    protected $casts = [
        'tech_stack' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(PmsProject::class, 'project_id');
    }
}
