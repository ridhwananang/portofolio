<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'description',
        'tags',
        'mockup_type',
        'image',
    ];

    protected $casts = [
        'tags' => 'array',
    ];
}
