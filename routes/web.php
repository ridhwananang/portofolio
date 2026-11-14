<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProjectOrderController;
use App\Http\Controllers\QuestController;
use Illuminate\Support\Facades\Route;

// Showcase Portofolio Publik (Cached High-Performance Engine)
Route::get('/', [HomeController::class, 'index'])->name('home');

// Client Project Orders & Live Tracker (Public & Guest-friendly with Rate Limiting)
Route::get('/layanan', [ProjectOrderController::class, 'calculator'])->name('services.calculator');
Route::post('/project-orders', [ProjectOrderController::class, 'store'])->middleware('throttle:10,1')->name('project.order.store');
Route::get('/track-project/{tracking_code}', [ProjectOrderController::class, 'track'])->middleware('throttle:60,1')->name('project.tracker');
Route::post('/track-project/{tracking_code}/approve', [ProjectOrderController::class, 'approve'])->middleware('throttle:10,1')->name('project.tracker.approve');
Route::post('/track-project/{tracking_code}/settle', [ProjectOrderController::class, 'requestSettlement'])->middleware('throttle:10,1')->name('project.tracker.settle');
Route::post('/track-project/{tracking_code}/staging', [ProjectOrderController::class, 'updateStaging'])->middleware(['auth', 'admin'])->name('project.tracker.staging');
Route::post('/track-project/{tracking_code}/revision', [ProjectOrderController::class, 'submitRevision'])->middleware('throttle:10,1')->name('project.tracker.revision');

// Legal & Compliance Pages (Midtrans Requirements)
Route::inertia('/terms-and-conditions', 'terms')->name('terms');
Route::inertia('/privacy-policy', 'privacy')->name('privacy');

// Secure Public Certificate Media Streaming (Masks & Protects Object Storage Bucket URLs)
Route::get('/certificates/{certificate}/view', [App\Http\Controllers\CertificateStreamController::class, 'view'])
    ->middleware('throttle:60,1')
    ->name('certificates.view');
Route::get('/certificates/{certificate}/download', [App\Http\Controllers\CertificateStreamController::class, 'download'])
    ->middleware('throttle:30,1')
    ->name('certificates.download');
Route::get('/certificates/{certificate}/thumbnail', [App\Http\Controllers\CertificateStreamController::class, 'thumbnail'])
    ->middleware('throttle:120,1')
    ->name('certificates.thumbnail');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => redirect('/studio'))->name('dashboard');

    Route::resource('quests', QuestController::class);
    Route::post('/quests/{quest}/take', [QuestController::class, 'take'])->name('quests.take');
    Route::post('/quests/{quest}/submit', [QuestController::class, 'submitWork'])->name('quests.submit');
    Route::post('/quests/{quest}/approve', [QuestController::class, 'approve'])->name('quests.approve');
    Route::post('/quests/{quest}/cancel', [QuestController::class, 'cancel'])->name('quests.cancel');
    Route::post('/quests/{quest}/dispute', [QuestController::class, 'dispute'])->name('quests.dispute');
});

require __DIR__.'/settings.php';
require __DIR__.'/studio.php';

