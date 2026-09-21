<?php

use App\Contracts\PaymentGatewayInterface;
use App\Enums\PaymentLogStatus;
use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\EscrowFunded;
use App\Events\EscrowReleased;
use App\Models\PaymentLog;
use App\Models\Quest;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Payment\EscrowService;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->poster = User::factory()->create();
    $this->worker = User::factory()->create();

    // Mock Gateway Interface
    $this->mockGateway = Mockery::mock(PaymentGatewayInterface::class);
    $this->app->instance(PaymentGatewayInterface::class, $this->mockGateway);
});

test('poster dapat menginisiasi deposit rekber untuk quest', function () {
    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'title' => 'Buat Logo Startup',
        'description' => 'Desain logo minimalis',
        'reward_amount' => 150000,
        'fee_amount' => 5000,
        'total_amount' => 155000,
        'currency' => 'IDR',
        'status' => QuestStatus::DRAFT,
    ]);

    $this->mockGateway->shouldReceive('createInvoice')
        ->once()
        ->andReturn([
            'id' => 'inv_test_123',
            'invoice_url' => 'https://checkout-staging.xendit.co/web/inv_test_123',
            'expiry_date' => now()->addDay()->toISOString(),
        ]);

    $escrowService = app(EscrowService::class);
    $transaction = $escrowService->initiateQuestDeposit($quest);

    expect($transaction)->toBeInstanceOf(Transaction::class)
        ->and($transaction->status)->toBe(TransactionStatus::PENDING)
        ->and($transaction->type)->toBe(TransactionType::DEPOSIT)
        ->and($transaction->xendit_id)->toBe('inv_test_123')
        ->and($transaction->amount)->toBe('155000.00');

    expect($quest->fresh()->status)->toBe(QuestStatus::PENDING_PAYMENT);
});

test('webhook invoice paid berhasil menahan dana rekber dan mengubah status quest menjadi open', function () {
    Event::fake([EscrowFunded::class]);

    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'title' => 'Buat Logo Startup',
        'description' => 'Desain logo minimalis',
        'reward_amount' => 150000,
        'fee_amount' => 5000,
        'total_amount' => 155000,
        'currency' => 'IDR',
        'status' => QuestStatus::PENDING_PAYMENT,
    ]);

    $externalId = 'QUEST-DEP-' . $quest->id . '-12345';
    $transaction = Transaction::create([
        'quest_id' => $quest->id,
        'user_id' => $this->poster->id,
        'type' => TransactionType::DEPOSIT,
        'amount' => 155000,
        'currency' => 'IDR',
        'status' => TransactionStatus::PENDING,
        'xendit_id' => 'inv_test_123',
        'xendit_external_id' => $externalId,
    ]);

    $this->mockGateway->shouldReceive('verifyWebhookToken')
        ->with('valid_token')
        ->andReturn(true);

    $payload = [
        'id' => 'inv_test_123',
        'external_id' => $externalId,
        'status' => 'PAID',
        'amount' => 155000,
        'payment_method' => 'BANK_TRANSFER',
        'payment_channel' => 'BCA',
        'paid_at' => now()->toISOString(),
    ];

    $response = $this->postJson('/api/webhooks/xendit/invoice', $payload, [
        'x-callback-token' => 'valid_token',
    ]);

    $response->assertOk()
        ->assertJson(['status' => 'success']);

    expect($transaction->fresh()->status)->toBe(TransactionStatus::HELD);
    Event::assertDispatched(EscrowFunded::class);

    // Cek payment_logs
    $log = PaymentLog::where('external_id', $externalId)->first();
    expect($log)->not->toBeNull()
        ->and($log->status)->toBe(PaymentLogStatus::PROCESSED);
});

test('webhook menolak request jika x-callback-token tidak valid', function () {
    $this->mockGateway->shouldReceive('verifyWebhookToken')
        ->with('invalid_token')
        ->andReturn(false);

    $response = $this->postJson('/api/webhooks/xendit/invoice', [
        'id' => 'inv_test_123',
        'external_id' => 'QUEST-DEP-1-123',
        'status' => 'PAID',
    ], [
        'x-callback-token' => 'invalid_token',
    ]);

    $response->assertStatus(403);
});

test('alur rilis dana ke worker (disbursement) berhasil mengubah status transaksi dan quest', function () {
    Event::fake([EscrowReleased::class]);

    $quest = Quest::create([
        'poster_id' => $this->poster->id,
        'worker_id' => $this->worker->id,
        'title' => 'Buat Logo Startup',
        'description' => 'Desain logo minimalis',
        'reward_amount' => 150000,
        'fee_amount' => 5000,
        'total_amount' => 155000,
        'currency' => 'IDR',
        'status' => QuestStatus::UNDER_REVIEW,
    ]);

    Transaction::create([
        'quest_id' => $quest->id,
        'user_id' => $this->poster->id,
        'type' => TransactionType::DEPOSIT,
        'amount' => 155000,
        'currency' => 'IDR',
        'status' => TransactionStatus::HELD,
        'xendit_external_id' => 'QUEST-DEP-' . $quest->id . '-123',
    ]);

    $this->mockGateway->shouldReceive('createDisbursement')
        ->once()
        ->andReturn([
            'id' => 'disb_test_999',
            'status' => 'PENDING',
        ]);

    $escrowService = app(EscrowService::class);
    $payoutTransaction = $escrowService->releaseEscrow($quest, [
        'bank_code' => 'BCA',
        'account_number' => '1234567890',
        'account_holder_name' => 'John Doe Worker',
    ]);

    expect($payoutTransaction->status)->toBe(TransactionStatus::RELEASING)
        ->and($payoutTransaction->type)->toBe(TransactionType::PAYOUT)
        ->and($payoutTransaction->amount)->toBe('150000.00');

    // Simulasi Webhook Disbursement Completed dari Xendit
    $this->mockGateway->shouldReceive('verifyWebhookToken')
        ->with('valid_token')
        ->andReturn(true);

    $disbursementPayload = [
        'id' => 'disb_test_999',
        'external_id' => $payoutTransaction->xendit_external_id,
        'status' => 'COMPLETED',
        'amount' => 150000,
        'bank_code' => 'BCA',
    ];

    $response = $this->postJson('/api/webhooks/xendit/disbursement', $disbursementPayload, [
        'x-callback-token' => 'valid_token',
    ]);

    $response->assertOk()
        ->assertJson(['status' => 'success']);

    expect($payoutTransaction->fresh()->status)->toBe(TransactionStatus::RELEASED);
    Event::assertDispatched(EscrowReleased::class);
});
