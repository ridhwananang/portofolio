<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'base_price',
        'timeline',
        'icon',
        'is_active',
        'is_popular',
        'sort_order',
        'features_included',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'sort_order' => 'integer',
            'features_included' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ServicePackage $package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->title, '_');
            }
        });
    }
}
