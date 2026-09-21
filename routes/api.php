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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/profile', [ProfileController::class, 'index']);
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/tech-stacks', [TechStackController::class, 'index']);
Route::get('/certificates', [CertificateController::class, 'index']);
Route::post('/chat', [ChatController::class, 'store']);
Route::post('/contact', [ContactController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Payment Gateways Webhooks (Escrow Rekber)
|--------------------------------------------------------------------------
*/
Route::prefix('webhooks/xendit')->group(function () {
    Route::post('/invoice', [XenditWebhookController::class, 'handleInvoice']);
    Route::post('/disbursement', [XenditWebhookController::class, 'handleDisbursement']);
});

Route::prefix('webhooks/midtrans')->group(function () {
    Route::post('/notification', [MidtransWebhookController::class, 'handleNotification']);
});


