<?php

use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ProjectOrderController;
use App\Http\Controllers\Admin\ServiceManagementController;
use App\Http\Controllers\Admin\TechStackController;
use App\Http\Controllers\Studio\Pms\PmsActivityLogController;
use App\Http\Controllers\Studio\Pms\PmsAttachmentController;
use App\Http\Controllers\Studio\Pms\PmsDashboardController;
use App\Http\Controllers\Studio\Pms\PmsFinanceController;
use App\Http\Controllers\Studio\Pms\PmsProjectController;
use App\Http\Controllers\Studio\Pms\PmsSprintController;
use App\Http\Controllers\Studio\Pms\PmsTaskController;
use App\Http\Controllers\Studio\Pms\PmsTeamController;
use App\Http\Controllers\Studio\Pms\PmsTimelineController;
use App\Http\Controllers\Studio\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/**
 * Studio & Project Management System (PMS) Core Routes Definition
 */
$registerStudioAdminCmsRoutes = function () {
    // 1. Studio Cockpit Dashboard (Root /studio)
    Route::get('/', function (Request $request) {
        $user = $request->user();
        if (! $user?->isAdmin()) {
            return app(PmsDashboardController::class)->index($request);
        }

        return app(DashboardController::class)->index();
    })->name('dashboard');

    // Admin-only Portfolio CMS, Orders, Services, & User Management
    Route::middleware('admin')->group(function () {
        // 2. Profile & Bio Portfolio
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

        // 3. Showcase & Assets Management
        Route::resource('projects', ProjectController::class);
        Route::resource('tech-stacks', TechStackController::class)->except(['create', 'show', 'edit']);
        Route::resource('certificates', CertificateController::class);

        // 4. Client Communication & Inbound Messages
        Route::get('/messages/sync', [MessageController::class, 'sync'])->name('messages.sync');
        Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
        Route::post('/messages/{message}/reply', [MessageController::class, 'reply'])->name('messages.reply');
        Route::patch('/messages/{message}/toggle-read', [MessageController::class, 'toggleRead'])->name('messages.toggle-read');
        Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

        // 5. Client Orders & Staging Handover
        Route::get('/orders', [ProjectOrderController::class, 'index'])->name('orders.index');
        Route::put('/orders/{order}', [ProjectOrderController::class, 'update'])->name('orders.update');

        // 6. Service & Catalog Management
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

        // 7. Dynamic Team & User Management (Enterprise & Dynamic)
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    });
};

$registerPmsRoutes = function () {
    // 8. Project Management System (PMS) Suite - Accessible to all authenticated users (Scoped by jobdesk/membership)
    Route::prefix('pms')->as('pms.')->group(function () {
        // Cockpit
        Route::get('/', [PmsDashboardController::class, 'index'])->name('dashboard');

        // Managed Projects
        Route::resource('projects', PmsProjectController::class);
        Route::put('projects/{project}/detail', [PmsProjectController::class, 'updateDetail'])->name('projects.detail.update');
        Route::post('projects/import-order', [PmsProjectController::class, 'importFromOrder'])->name('projects.import-order');

        // Sprints
        Route::resource('sprints', PmsSprintController::class)->only(['index', 'store', 'update', 'destroy']);

        // Tasks & Kanban
        Route::resource('tasks', PmsTaskController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::patch('tasks/{task}/status', [PmsTaskController::class, 'updateStatus'])->name('tasks.update-status');
        Route::post('tasks/{task}/subtasks', [PmsTaskController::class, 'storeSubtask'])->name('tasks.subtasks.store');
        Route::patch('subtasks/{subtask}/toggle', [PmsTaskController::class, 'toggleSubtask'])->name('tasks.subtasks.toggle');
        Route::delete('subtasks/{subtask}', [PmsTaskController::class, 'destroySubtask'])->name('tasks.subtasks.destroy');

        // Finances & Budget (Admin only enforced in controller)
        Route::resource('finances', PmsFinanceController::class)->only(['index', 'store', 'destroy']);

        // Project Team Assignment (Admin only enforced in controller)
        Route::post('projects/{project}/members', [PmsTeamController::class, 'assignMember'])->name('members.assign');
        Route::put('members/{member}', [PmsTeamController::class, 'updateMember'])->name('members.update');
        Route::delete('members/{member}', [PmsTeamController::class, 'removeMember'])->name('members.remove');

        // Attachments
        Route::post('attachments', [PmsAttachmentController::class, 'store'])->name('attachments.store');
        Route::delete('attachments/{attachment}', [PmsAttachmentController::class, 'destroy'])->name('attachments.destroy');

        // Interactive Timeline & Gantt
        Route::get('timeline', [PmsTimelineController::class, 'index'])->name('timeline.index');

        // Activity Logs Audit Trail
        Route::get('activity-logs', [PmsActivityLogController::class, 'index'])->name('activity-logs.index');
    });
};

$registerStudioRoutes = function () use ($registerStudioAdminCmsRoutes, $registerPmsRoutes) {
    $registerStudioAdminCmsRoutes();
    $registerPmsRoutes();
};

$studioDomain = env('STUDIO_DOMAIN', env('ADMIN_DOMAIN', 'studio.ridhwananang.id'));

// 1. Primary Dedicated Subdomain Routing: studio.ridhwananang.id
Route::domain($studioDomain)
    ->middleware(['auth'])
    ->as('studio.')
    ->group(function () use ($registerStudioRoutes) {
        $registerStudioRoutes();
        Route::prefix('studio')->group($registerStudioRoutes);
    });

// Also register the routes under 'admin.' name prefix for 100% backward compatibility with test suites & legacy links
Route::domain($studioDomain)
    ->middleware(['auth'])
    ->as('admin.')
    ->group(function () use ($registerStudioRoutes) {
        $registerStudioRoutes();
    });

// 2. Local Development Subdomains (Laravel Herd: studio.portofolio.test & studio.localhost)
if (app()->environment('local')) {
    Route::domain('studio.portofolio.test')
        ->middleware(['auth'])
        ->as('studio.herd.')
        ->group(function () use ($registerStudioRoutes) {
            $registerStudioRoutes();
            Route::prefix('studio')->group($registerStudioRoutes);
        });

    Route::domain('studio.localhost')
        ->middleware(['auth'])
        ->as('studio.local.')
        ->group(function () use ($registerStudioRoutes) {
            $registerStudioRoutes();
            Route::prefix('studio')->group($registerStudioRoutes);
        });
}

// 3. Fallback & Main Domain Routing for /studio:
Route::middleware(['auth'])->prefix('studio')->as('studio.main.')->group(function () use ($registerStudioRoutes, $studioDomain) {
    if (app()->environment('production') && request()->getHost() !== $studioDomain) {
        Route::any('/{any?}', function ($any = null) use ($studioDomain) {
            $scheme = request()->getScheme();
            $path = $any ? '/'.ltrim($any, '/') : '';

            return redirect()->to($scheme.'://'.$studioDomain.$path, 301);
        })->where('any', '.*');
    } else {
        // Direct local or testing access (e.g. 127.0.0.1:8000/studio, localhost in tests)
        $registerStudioRoutes();
    }
});

// 4. Full Backward Compatibility Alias: Mount all routes directly under /admin as well
// This ensures any POST, PUT, PATCH, DELETE or GET requests sent to /admin/* resolve seamlessly with zero 405 errors
Route::middleware(['auth'])->prefix('admin')->as('admin.alias.')->group(function () use ($registerStudioRoutes) {
    $registerStudioRoutes();
});
