<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechStack extends Model
{
    protected $fillable = [
        'name',
        'description',
        'badge',
        'color',
        'text_color',
        'accent',
        'icon_name',
    ];
}
