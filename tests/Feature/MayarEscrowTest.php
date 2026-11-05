<?php

use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\ProjectOrder;
use App\Models\Quest;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Payment\EscrowService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->poster = User::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
    ]);
    $this->worker = User::factory()->create([
        'name' => "Ridhwan Anang Ma'ruf",
        'email' => 'ridhwananang@gmail.com',
    ]);

    Config::set('services.payment_gateway', 'mayar');
    Config::set('services.mayar.api_key', 'mayar_test_api_key_12345');
    Config::set('services.mayar.webhook_token', 'mayar_webhook_secret_token_999');
    Config::set('services.mayar.is_production', false);
});

test('mayar payment gateway membuat payment link via headless API untuk DP proyek', function () {
    Http::fake([
        'https://api.mayar.club/hl/v1/payment/create' => Http::response([
            'statusCode' => 200,
            'messages' => 'success',
            'data' => [
                'id' => 'mayar-pay-uuid-111',
                'transactionId' => 'mayar-tx-uuid-222',
                'link' => 'https://ridhwananang.myr.id/pl/mayar-pay-uuid-111',
            ],
        ], 200),
    ]);

    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'worker_id' => $this->worker->id,
        'title' => 'Jasa Pembuatan Website: Company Profile',
        'description' => 'Company profile profesional',
        'reward_amount' => 1000000,
        'fee_amount' => 0,
        'total_amount' => 1000000,
        'currency' => 'IDR',
        'status' => QuestStatus::DRAFT,
    ]);

    $order = ProjectOrder::create([
        'client_name' => 'Budi Santoso',
        'client_email' => 'budi@example.com',
        'client_phone' => '081234567890',
        'project_type' => 'company_profile',
        'delivery_speed' => 'standard',
        'total_amount' => 1000000,
        'dp_percentage' => 50,
        'dp_amount' => 500000,
        'remaining_amount' => 500000,
        'payment_scheme' => 'down_payment',
        'payment_stage' => 'awaiting_dp',
        'status' => 'pending_payment',
        'quest_id' => $quest->id,
    ]);

    /** @var EscrowService $escrowService */
    $escrowService = app(EscrowService::class);
    $transaction = $escrowService->initiateProjectDpDeposit($order);

    expect($transaction->xendit_id)->toBe('mayar-pay-uuid-111')
        ->and($transaction->payment_details['invoice_url'])->toBe('https://ridhwananang.myr.id/pl/mayar-pay-uuid-111')
        ->and($transaction->payment_details['token'])->toBe('mayar-tx-uuid-222')
        ->and((float) $transaction->amount)->toBe(500000.0);
});

test('mayar webhook payment.received berhasil memverifikasi pembayaran DP dan mengubah status proyek menjadi in_progress', function () {
    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'worker_id' => $this->worker->id,
        'title' => 'Buat Website Toko Online',
        'description' => 'Toko online fullstack',
        'reward_amount' => 800000,
        'fee_amount' => 0,
        'total_amount' => 800000,
        'currency' => 'IDR',
        'status' => QuestStatus::PENDING_PAYMENT,
    ]);

    $externalId = 'QUEST-DP-77-123456';
    $transaction = Transaction::create([
        'quest_id' => $quest->id,
        'user_id' => $this->poster->id,
        'type' => TransactionType::DEPOSIT,
        'amount' => 400000,
        'currency' => 'IDR',
        'status' => TransactionStatus::PENDING,
        'xendit_id' => 'e890d24a-cfc0-4915-83d2-3166b9ffba9e',
        'xendit_external_id' => $externalId,
        'payment_details' => [
            'stage' => 'dp',
            'token' => '040d5adb-1496-45de-8435-5cab16526a8c',
            'invoice_url' => 'https://ridhwananang.myr.id/pl/e890d24a',
        ],
    ]);

    $order = ProjectOrder::create([
        'client_name' => 'Budi Santoso',
        'client_email' => 'budi@example.com',
        'project_type' => 'ecommerce',
        'delivery_speed' => 'standard',
        'total_amount' => 800000,
        'dp_percentage' => 50,
        'dp_amount' => 400000,
        'remaining_amount' => 400000,
        'payment_scheme' => 'down_payment',
        'payment_stage' => 'awaiting_dp',
        'dp_transaction_id' => $transaction->id,
        'status' => 'pending_payment',
        'quest_id' => $quest->id,
    ]);

    $payload = [
        'event' => 'payment.received',
        'data' => [
            'id' => 'e890d24a-cfc0-4915-83d2-3166b9ffba9e',
            'transactionId' => '040d5adb-1496-45de-8435-5cab16526a8c',
            'status' => true,
            'amount' => 400000,
            'customerName' => 'Budi Santoso',
            'customerEmail' => 'budi@example.com',
            'customerMobile' => '081234567890',
        ],
    ];

    $response = $this->postJson('/api/webhooks/mayar/notification', $payload, [
        'x-callback-token' => 'mayar_webhook_secret_token_999',
    ]);

    $response->assertStatus(200)
        ->assertJson(['status' => 'success']);

    $transaction->refresh();
    $order->refresh();

    expect($transaction->status)->toBe(TransactionStatus::HELD)
        ->and($transaction->paid_at)->not->toBeNull()
        ->and($order->payment_stage)->toBe('dp_paid')
        ->and($order->status)->toBe('in_progress')
        ->and($quest->fresh()->status)->toBe(QuestStatus::OPEN);
});

test('mayar webhook menolak request jika x-callback-token tidak sesuai konfigurasi', function () {
    $payload = [
        'event' => 'payment.received',
        'data' => [
            'id' => 'e890d24a-cfc0-4915-83d2-3166b9ffba9e',
            'status' => true,
            'amount' => 400000,
        ],
    ];

    $response = $this->postJson('/api/webhooks/mayar/notification', $payload, [
        'x-callback-token' => 'wrong_token_123',
    ]);

    $response->assertStatus(403)
        ->assertJson(['error' => 'Invalid webhook token']);
});
