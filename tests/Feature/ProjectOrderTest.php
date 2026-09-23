<?php

use App\Contracts\PaymentGatewayInterface;
use App\Models\ProjectOrder;
use App\Models\Quest;
use App\Models\Transaction;
use App\Models\User;

beforeEach(function () {
    $this->developer = User::factory()->create([
        'email' => 'ridhwananang@gmail.com',
        'name' => "Ridhwan Anang Ma'ruf",
    ]);

    $this->mockGateway = Mockery::mock(PaymentGatewayInterface::class);
    $this->app->instance(PaymentGatewayInterface::class, $this->mockGateway);
});

test('calon klien dapat memesan jasa pembuatan website via kalkulator dan mendapatkan invoice rekber', function () {
    $this->mockGateway->shouldReceive('createInvoice')
        ->once()
        ->andReturn([
            'id' => 'inv_order_123',
            'invoice_url' => 'https://checkout-staging.xendit.co/web/inv_order_123',
            'expiry_date' => now()->addDay()->toISOString(),
        ]);

    $payload = [
        'client_name' => 'Budi Santoso',
        'client_email' => 'budi@example.com',
        'client_phone' => '081234567890',
        'project_type' => 'web_app',
        'selected_features' => ['payment_gateway', 'admin_cms'],
        'delivery_speed' => 'standard',
        'notes' => 'Tolong buatkan website portal berita',
        'total_amount' => 600000,
    ];

    $response = $this->postJson('/project-orders', $payload);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'success',
            'tracking_code',
            'invoice_url',
            'redirect_url',
        ]);

    $order = ProjectOrder::where('client_email', 'budi@example.com')->first();
    expect($order)->not->toBeNull()
        ->and($order->status)->toBe('pending_payment')
        ->and($order->project_type)->toBe('web_app')
        ->and($order->total_amount)->toBe('600000.00');

    $quest = $order->quest;
    expect($quest)->not->toBeNull()
        ->and($quest->worker_id)->toBe($this->developer->id)
        ->and($quest->depositTransaction)->not->toBeNull();
});

test('klien dapat melihat halaman live tracker dengan tracking code unik', function () {
    $client = User::factory()->create(['email' => 'client@example.com']);

    $quest = Quest::create([
        'poster_id' => $client->id,
        'worker_id' => $this->developer->id,
        'title' => 'Pembuatan Website Landing Page',
        'description' => 'Website landing page',
        'reward_amount' => 150000,
        'fee_amount' => 0,
        'total_amount' => 150000,
        'currency' => 'IDR',
        'status' => 'open',
    ]);

    $order = ProjectOrder::create([
        'tracking_code' => 'PRJ-TEST1234',
        'client_name' => 'Client Test',
        'client_email' => 'client@example.com',
        'project_type' => 'landing_page',
        'selected_features' => [],
        'delivery_speed' => 'standard',
        'total_amount' => 150000,
        'currency' => 'IDR',
        'status' => 'in_progress',
        'quest_id' => $quest->id,
    ]);

    $response = $this->get('/track-project/' . $order->tracking_code);
    $response->assertOk();
});

test('developer dapat memperbarui staging url dan klien dapat menyetujui hasil website', function () {
    $client = User::factory()->create(['email' => 'client@example.com']);

    $quest = Quest::create([
        'poster_id' => $client->id,
        'worker_id' => $this->developer->id,
        'title' => 'Pembuatan Web App',
        'description' => 'Web App',
        'reward_amount' => 500000,
        'fee_amount' => 0,
        'total_amount' => 500000,
        'currency' => 'IDR',
        'status' => 'in_progress',
    ]);

    Transaction::create([
        'quest_id' => $quest->id,
        'user_id' => $client->id,
        'type' => 'deposit',
        'amount' => 500000,
        'currency' => 'IDR',
        'status' => 'held',
        'xendit_external_id' => 'DEP-ORD-123',
    ]);

    $order = ProjectOrder::create([
        'tracking_code' => 'PRJ-STG1234',
        'client_name' => 'Client Test',
        'client_email' => 'client@example.com',
        'project_type' => 'web_app',
        'selected_features' => [],
        'delivery_speed' => 'standard',
        'total_amount' => 500000,
        'currency' => 'IDR',
        'status' => 'in_progress',
        'quest_id' => $quest->id,
    ]);

    // 1. Update staging
    $response = $this->post('/track-project/' . $order->tracking_code . '/staging', [
        'staging_url' => 'https://preview.ridhwananang.id',
    ]);
    $response->assertRedirect();
    expect($order->fresh()->status)->toBe('in_review')
        ->and($order->fresh()->staging_url)->toBe('https://preview.ridhwananang.id');

    // 2. Client approve
    $this->mockGateway->shouldReceive('createDisbursement')
        ->once()
        ->andReturn([
            'id' => 'disb_order_123',
            'status' => 'PENDING',
        ]);

    $approveResponse = $this->post('/track-project/' . $order->tracking_code . '/approve');
    $approveResponse->assertRedirect();
    expect($order->fresh()->status)->toBe('completed');
});

test('checkout kalkulator dengan skema DP menghasilkan invoice DP dan mencatat nominal termin yang tepat', function () {
    $this->mockGateway->shouldReceive('createInvoice')
        ->once()
        ->withArgs(function (Transaction $transaction, Quest $quest) {
            // Verify that charged amount is only DP (50% of 1.000.000 = 500.000)
            return (float) $transaction->amount === 500000.0
                && str_contains($transaction->xendit_external_id, 'QUEST-DP-');
        })
        ->andReturn([
            'id' => 'inv_dp_123',
            'invoice_url' => 'https://checkout-staging.xendit.co/web/inv_dp_123',
            'expiry_date' => now()->addDay()->toISOString(),
        ]);

    $payload = [
        'client_name' => 'Siti Nurhaliza',
        'client_email' => 'siti@example.com',
        'client_phone' => '081234567899',
        'project_type' => 'company_profile',
        'selected_features' => ['seo_optimization'],
        'delivery_speed' => 'standard',
        'payment_scheme' => 'down_payment',
        'notes' => 'Website Profil Perusahaan Profesional',
        'total_amount' => 1000000,
    ];

    $response = $this->postJson('/project-orders', $payload);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'success',
            'tracking_code',
            'invoice_url',
            'redirect_url',
        ]);

    $order = ProjectOrder::where('client_email', 'siti@example.com')->first();
    expect($order)->not->toBeNull()
        ->and($order->payment_scheme)->toBe('down_payment')
        ->and((int) $order->dp_percentage)->toBe(50)
        ->and((float) $order->dp_amount)->toBe(500000.0)
        ->and((float) $order->remaining_amount)->toBe(500000.0)
        ->and($order->payment_stage)->toBe('awaiting_dp')
        ->and($order->status)->toBe('pending_payment');
});

test('klien tidak dapat menyetujui serah terima final jika masih ada sisa pelunasan yang belum dibayar', function () {
    $client = User::factory()->create(['email' => 'client-dp@example.com']);

    $quest = Quest::create([
        'poster_id' => $client->id,
        'worker_id' => $this->developer->id,
        'title' => 'Website Company Profile',
        'description' => 'Company profile dengan DP',
        'reward_amount' => 1000000,
        'fee_amount' => 0,
        'total_amount' => 1000000,
        'currency' => 'IDR',
        'status' => 'in_progress',
    ]);

    $order = ProjectOrder::create([
        'tracking_code' => 'PRJ-DP-TEST',
        'client_name' => 'Client DP',
        'client_email' => 'client-dp@example.com',
        'project_type' => 'company_profile',
        'delivery_speed' => 'standard',
        'total_amount' => 1000000,
        'dp_percentage' => 50,
        'dp_amount' => 500000,
        'remaining_amount' => 500000,
        'payment_scheme' => 'down_payment',
        'payment_stage' => 'dp_paid',
        'currency' => 'IDR',
        'status' => 'in_review',
        'quest_id' => $quest->id,
    ]);

    // Client tries to approve without settling remaining amount
    $response = $this->post('/track-project/' . $order->tracking_code . '/approve');
    $response->assertRedirect();
    $response->assertSessionHas('error');

    // Status remains in_review
    expect($order->fresh()->status)->toBe('in_review');
});

test('klien dapat meminta invoice pelunasan sisa termin saat review staging', function () {
    $client = User::factory()->create(['email' => 'client-settle@example.com']);

    $quest = Quest::create([
        'poster_id' => $client->id,
        'worker_id' => $this->developer->id,
        'title' => 'Website Company Profile',
        'description' => 'Company profile pelunasan',
        'reward_amount' => 1000000,
        'fee_amount' => 0,
        'total_amount' => 1000000,
        'currency' => 'IDR',
        'status' => 'in_progress',
    ]);

    $order = ProjectOrder::create([
        'tracking_code' => 'PRJ-SETTLE12',
        'client_name' => 'Client Settle',
        'client_email' => 'client-settle@example.com',
        'project_type' => 'company_profile',
        'delivery_speed' => 'standard',
        'total_amount' => 1000000,
        'dp_percentage' => 50,
        'dp_amount' => 500000,
        'remaining_amount' => 500000,
        'payment_scheme' => 'down_payment',
        'payment_stage' => 'dp_paid',
        'currency' => 'IDR',
        'status' => 'in_review',
        'quest_id' => $quest->id,
    ]);

    $this->mockGateway->shouldReceive('createInvoice')
        ->once()
        ->withArgs(function (Transaction $transaction, Quest $quest) {
            return (float) $transaction->amount === 500000.0
                && str_contains($transaction->xendit_external_id, 'QUEST-FINAL-');
        })
        ->andReturn([
            'id' => 'inv_final_123',
            'invoice_url' => 'https://checkout-staging.xendit.co/web/inv_final_123',
            'expiry_date' => now()->addDay()->toISOString(),
        ]);

    $response = $this->postJson('/track-project/' . $order->tracking_code . '/settle');
    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'invoice_url',
            'amount',
            'tracking_code',
        ]);

    expect($order->fresh()->payment_stage)->toBe('awaiting_final')
        ->and($order->fresh()->final_transaction_id)->not->toBeNull();
});
