<?php

use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ProjectOrderController;
use App\Http\Controllers\Admin\ServiceManagementController;
use App\Http\Controllers\Admin\TechStackController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->prefix('admin')->as('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::resource('projects', ProjectController::class);
    Route::resource('tech-stacks', TechStackController::class)->except(['create', 'show', 'edit']);
    Route::resource('certificates', CertificateController::class);

    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages/{message}/reply', [MessageController::class, 'reply'])->name('messages.reply');
    Route::patch('/messages/{message}/toggle-read', [MessageController::class, 'toggleRead'])->name('messages.toggle-read');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

    Route::get('/orders', [ProjectOrderController::class, 'index'])->name('orders.index');
    Route::put('/orders/{order}', [ProjectOrderController::class, 'update'])->name('orders.update');

    // Service & Catalog Management
    Route::get('/services', [ServiceManagementController::class, 'index'])->name('services.index');
    Route::post('/services/packages', [ServiceManagementController::class, 'storePackage'])->name('services.packages.store');
    Route::put('/services/packages/{package}', [ServiceManagementController::class, 'updatePackage'])->name('services.packages.update');
    Route::patch('/services/packages/{package}/toggle', [ServiceManagementController::class, 'togglePackage'])->name('services.packages.toggle');
    Route::delete('/services/packages/{package}', [ServiceManagementController::class, 'destroyPackage'])->name('services.packages.destroy');

    Route::post('/services/addons', [ServiceManagementController::class, 'storeAddon'])->name('services.addons.store');
    Route::put('/services/addons/{addon}', [ServiceManagementController::class, 'updateAddon'])->name('services.addons.update');
    Route::patch('/services/addons/{addon}/toggle', [ServiceManagementController::class, 'toggleAddon'])->name('services.addons.toggle');
    Route::delete('/services/addons/{addon}', [ServiceManagementController::class, 'destroyAddon'])->name('services.addons.destroy');

    Route::post('/services/settings', [ServiceManagementController::class, 'updateSettings'])->name('services.settings.update');
});
