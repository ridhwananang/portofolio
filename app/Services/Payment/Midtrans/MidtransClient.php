<?php

namespace App\Services\Payment\Midtrans;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MidtransClient
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $snapBaseUrl;
    protected string $apiBaseUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key') ?? '';
        $this->clientKey = config('services.midtrans.client_key') ?? '';
        $this->isProduction = (bool) config('services.midtrans.is_production', false);

        $this->snapBaseUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1'
            : 'https://app.sandbox.midtrans.com/snap/v1';

        $this->apiBaseUrl = $this->isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    /**
     * HTTP Client dengan Basic Auth Server Key Midtrans
     */
    protected function client(): PendingRequest
    {
        return Http::withBasicAuth($this->serverKey, '')
            ->timeout(15)
            ->retry(2, 100);
    }

    /**
     * Membuat transaksi Snap (Inflow / Deposit)
     * Mengembalikan snap token dan redirect_url
     */
    public function createSnapTransaction(array $payload): array
    {
        $response = $this->client()->post("{$this->snapBaseUrl}/transactions", $payload);

        return $this->handleResponse($response, 'createSnapTransaction');
    }

    /**
     * Cek status transaksi via Midtrans Core API
     */
    public function getTransactionStatus(string $orderId): array
    {
        $response = $this->client()->get("{$this->apiBaseUrl}/v2/{$orderId}/status");

        return $this->handleResponse($response, 'getTransactionStatus');
    }

    /**
     * Verifikasi signature key webhook dari Midtrans
     * SHA512(order_id + status_code + gross_amount + ServerKey)
     */
    public function verifySignature(?string $orderId, ?string $statusCode, ?string $grossAmount, ?string $signatureKey): bool
    {
        if (empty($this->serverKey) || empty($orderId) || empty($signatureKey)) {
            return false;
        }

        $expected = hash('sha512', (string) $orderId . (string) $statusCode . (string) $grossAmount . $this->serverKey);

        return hash_equals($expected, (string) $signatureKey);
    }

    public function getServerKey(): string
    {
        return $this->serverKey;
    }

    public function getClientKey(): string
    {
        return $this->clientKey;
    }

    public function isProduction(): bool
    {
        return $this->isProduction;
    }

    /**
     * Handle & parse HTTP response
     */
    protected function handleResponse(Response $response, string $action): array
    {
        if ($response->successful()) {
            return $response->json();
        }

        $errorMessage = $response->json('error_messages.0')
            ?? $response->json('message')
            ?? $response->body();

        Log::error("Midtrans API Error [{$action}]:", [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        throw new RuntimeException("Midtrans Error: {$errorMessage} (HTTP {$response->status()})");
    }
}
