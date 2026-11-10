<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TechStackController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\Webhook\XenditWebhookController;
use App\Http\Controllers\Api\Webhook\MidtransWebhookController;
use App\Http\Controllers\Api\Webhook\MayarWebhookController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/profile', [ProfileController::class, 'index'])->middleware('throttle:60,1');
Route::get('/projects', [ProjectController::class, 'index'])->middleware('throttle:60,1');
Route::get('/tech-stacks', [TechStackController::class, 'index'])->middleware('throttle:60,1');
Route::get('/certificates', [CertificateController::class, 'index'])->middleware('throttle:60,1');
Route::get('/service-packages', function () {
    return response()->json(\App\Models\ServicePackage::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get());
})->middleware('throttle:60,1');
Route::post('/chat', [ChatController::class, 'store'])->middleware('throttle:15,1');
Route::get('/chat/sync', [ChatController::class, 'sync'])->middleware('throttle:120,1');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:6,1');

/*
|--------------------------------------------------------------------------
| Payment Gateways Webhooks (Escrow Rekber)
|--------------------------------------------------------------------------
*/
Route::prefix('webhooks/mayar')->group(function () {
    Route::match(['get', 'post', 'head'], '/', [MayarWebhookController::class, 'handleNotification']);
    Route::match(['get', 'post', 'head'], '/notification', [MayarWebhookController::class, 'handleNotification']);
});

Route::prefix('webhooks/xendit')->group(function () {
    Route::post('/invoice', [XenditWebhookController::class, 'handleInvoice']);
    Route::post('/disbursement', [XenditWebhookController::class, 'handleDisbursement']);
});

Route::prefix('webhooks/midtrans')->group(function () {
    Route::match(['get', 'post', 'head'], '/notification', [MidtransWebhookController::class, 'handleNotification']);
});



