<?php

use App\Contracts\PaymentGatewayInterface;
use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\EscrowFunded;
use App\Models\Quest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->poster = User::factory()->create();
    $this->worker = User::factory()->create();

    Config::set('services.midtrans.server_key', 'SB-Mid-server-TESTKEY123');
    Config::set('services.midtrans.client_key', 'SB-Mid-client-TESTKEY123');
    Config::set('services.midtrans.is_production', false);
});

test('midtrans webhook settlement berhasil menahan dana rekber dan membuka quest', function () {
    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'title' => 'Buat Website Company Profile',
        'description' => 'Desain responsif Laravel',
        'reward_amount' => 500000,
        'fee_amount' => 5000,
        'total_amount' => 505000,
        'currency' => 'IDR',
        'status' => QuestStatus::PENDING_PAYMENT,
    ]);

    $orderId = 'QUEST-DEP-' . $quest->id . '-12345';
    $transaction = Transaction::create([
        'quest_id' => $quest->id,
        'user_id' => $this->poster->id,
        'type' => TransactionType::DEPOSIT,
        'amount' => 505000,
        'currency' => 'IDR',
        'status' => TransactionStatus::PENDING,
        'xendit_id' => 'midtrans-trans-123',
        'xendit_external_id' => $orderId,
    ]);

    $statusCode = '200';
    $grossAmount = '505000.00';
    $serverKey = 'SB-Mid-server-TESTKEY123';
    $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

    $payload = [
        'transaction_id' => 'midtrans-trans-123',
        'order_id' => $orderId,
        'gross_amount' => $grossAmount,
        'status_code' => $statusCode,
        'transaction_status' => 'settlement',
        'payment_type' => 'bank_transfer',
        'transaction_time' => now()->toISOString(),
        'signature_key' => $signatureKey,
        'va_numbers' => [
            ['bank' => 'bca', 'va_number' => '12345678901'],
        ],
    ];

    $response = $this->postJson('/api/webhooks/midtrans/notification', $payload);

    $response->assertStatus(200)
        ->assertJson(['status' => 'success']);

    $transaction->refresh();
    expect($transaction->status)->toBe(TransactionStatus::HELD)
        ->and($transaction->payment_method)->toBe('bank_transfer')
        ->and($transaction->paid_at)->not->toBeNull();

    expect($quest->fresh()->status)->toBe(QuestStatus::OPEN);
});

test('midtrans webhook menolak request dengan signature yang tidak valid', function () {
    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'title' => 'Test Quest',
        'description' => 'Test Description',
        'reward_amount' => 100000,
        'fee_amount' => 0,
        'total_amount' => 100000,
        'currency' => 'IDR',
        'status' => QuestStatus::PENDING_PAYMENT,
    ]);

    $orderId = 'QUEST-DEP-999-12345';

    Transaction::create([
        'quest_id' => $quest->id,
        'user_id' => $this->poster->id,
        'type' => TransactionType::DEPOSIT,
        'amount' => 100000,
        'currency' => 'IDR',
        'status' => TransactionStatus::PENDING,
        'xendit_external_id' => $orderId,
    ]);

    $payload = [
        'transaction_id' => 'midtrans-trans-fake',
        'order_id' => $orderId,
        'gross_amount' => '100000.00',
        'status_code' => '200',
        'transaction_status' => 'settlement',
        'signature_key' => 'invalid_signature_hash',
    ];

    $response = $this->postJson('/api/webhooks/midtrans/notification', $payload);

    $response->assertStatus(403)
        ->assertJson(['error' => 'Invalid signature']);
});
