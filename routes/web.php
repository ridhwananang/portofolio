<?php

use App\Models\Profile;
use App\Models\Project;
use App\Models\TechStack;
use App\Models\Certificate;

Route::get('/', function () {
    $profile = Profile::first();
    if ($profile && $profile->image && !str_starts_with($profile->image, '/') && !str_starts_with($profile->image, 'http')) {
        $profile->image = \Illuminate\Support\Facades\Storage::url($profile->image);
    }

    $projects = Project::orderBy('id', 'asc')->get();
    foreach ($projects as $project) {
        if ($project->image && !str_starts_with($project->image, '/') && !str_starts_with($project->image, 'http')) {
            $project->image = \Illuminate\Support\Facades\Storage::url($project->image);
        }
    }

    $techStacks = TechStack::all();

    $certificates = Certificate::orderBy('id', 'asc')->get()->map(function ($cert) {
        $path = $cert->file_path;
        if ($path) {
            if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                $cert->file_url = $path;
            } else {
                $cert->file_url = \Illuminate\Support\Facades\Storage::url($path);
            }

            // Generate thumbnail URL if webp thumbnail exists
            $filename = basename($path);
            $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';
            $thumbnailPath = 'images/Sertifikat/thumbnails/' . $thumbnailName;
            if (file_exists(public_path($thumbnailPath))) {
                $cert->thumbnail_url = '/' . $thumbnailPath;
            } else {
                $cert->thumbnail_url = $cert->file_url;
            }
        } else {
            $cert->file_url = null;
            $cert->thumbnail_url = null;
        }
        return $cert;
    });

    return inertia('welcome', [
        'initialProfile' => $profile,
        'initialProjects' => $projects,
        'initialTechStacks' => $techStacks,
        'initialCertificates' => $certificates,
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
