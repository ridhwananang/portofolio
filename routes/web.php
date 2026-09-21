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

                // Check local public folder thumbnails
                $filename = basename($path);
                $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';
                $thumbnailPath = 'images/Sertifikat/thumbnails/' . $thumbnailName;
                if (file_exists(public_path($thumbnailPath))) {
                    $cert->thumbnail_url = '/' . $thumbnailPath;
                } else {
                    $cert->thumbnail_url = $cert->file_url;
                }
            } else {
                $cert->file_url = \Illuminate\Support\Facades\Storage::disk('public')->url($path);

                // Check storage disk for _thumb.webp
                $extension = pathinfo($path, PATHINFO_EXTENSION);
                $thumbPathStorage = str_replace('.' . $extension, '_thumb.webp', $path);
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($thumbPathStorage)) {
                    $cert->thumbnail_url = \Illuminate\Support\Facades\Storage::disk('public')->url($thumbPathStorage);
                } else {
                    $cert->thumbnail_url = $cert->file_url;
                }
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

use App\Http\Controllers\QuestController;
use App\Http\Controllers\ProjectOrderController;

// Client Project Orders & Live Tracker (Public & Guest-friendly)
Route::get('/layanan', [ProjectOrderController::class, 'calculator'])->name('services.calculator');
Route::post('/project-orders', [ProjectOrderController::class, 'store'])->name('project.order.store');
Route::get('/track-project/{tracking_code}', [ProjectOrderController::class, 'track'])->name('project.tracker');
Route::post('/track-project/{tracking_code}/approve', [ProjectOrderController::class, 'approve'])->name('project.tracker.approve');
Route::post('/track-project/{tracking_code}/staging', [ProjectOrderController::class, 'updateStaging'])->name('project.tracker.staging');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('quests', QuestController::class);
    Route::post('/quests/{quest}/take', [QuestController::class, 'take'])->name('quests.take');
    Route::post('/quests/{quest}/submit', [QuestController::class, 'submitWork'])->name('quests.submit');
    Route::post('/quests/{quest}/approve', [QuestController::class, 'approve'])->name('quests.approve');
    Route::post('/quests/{quest}/cancel', [QuestController::class, 'cancel'])->name('quests.cancel');
    Route::post('/quests/{quest}/dispute', [QuestController::class, 'dispute'])->name('quests.dispute');
});

require __DIR__.'/settings.php';

