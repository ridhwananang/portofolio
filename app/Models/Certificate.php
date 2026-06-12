<?php
 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = [
        'title',
        'category',
        'issuer',
        'credential_id',
        'date',
        'duration',
        'skills',
        'file_path',
    ];

    protected $casts = [
        'skills' => 'array',
    ];
}
