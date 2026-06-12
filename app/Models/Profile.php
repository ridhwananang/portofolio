<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'name',
        'role',
        'bio',
        'location',
        'email',
        'image',
        'github_url',
        'linkedin_url',
        'education',
    ];

    protected $casts = [
        'education' => 'array',
    ];
}
