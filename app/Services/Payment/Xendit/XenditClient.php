<?php

namespace App\Services\Payment\Xendit;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class XenditClient
{
    protected string $secretKey;
    protected string $webhookToken;
    protected string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.xendit.secret_key') ?? '';
        $this->webhookToken = config('services.xendit.webhook_token') ?? '';
        $this->baseUrl = config('services.xendit.base_url', 'https://api.xendit.co');
    }

    /**
     * Helper to prepare HTTP client with Basic Auth
     */
    protected function client(): PendingRequest
    {
        if (empty($this->secretKey)) {
            throw new RuntimeException('Xendit secret key is not configured in services.xendit.secret_key');
        }

        return Http::baseUrl($this->baseUrl)
            ->withBasicAuth($this->secretKey, '')
            ->timeout(15)
            ->retry(2, 100);
    }

    /**
     * Create Invoice (Inflow)
     */
    public function createInvoice(array $payload): array
    {
        $response = $this->client()->post('/v2/invoices', $payload);

        return $this->handleResponse($response, 'createInvoice');
    }

    /**
     * Get Invoice details
     */
    public function getInvoice(string $invoiceId): array
    {
        $response = $this->client()->get("/v2/invoices/{$invoiceId}");

        return $this->handleResponse($response, 'getInvoice');
    }

    /**
     * Create Disbursement (Outflow to Worker)
     */
    public function createDisbursement(array $payload, ?string $idempotencyKey = null): array
    {
        $client = $this->client();
        if ($idempotencyKey) {
            $client->withHeaders(['X-IDEMPOTENCY-KEY' => $idempotencyKey]);
        }

        $response = $client->post('/disbursements', $payload);

        return $this->handleResponse($response, 'createDisbursement');
    }

    /**
     * Get Disbursement details
     */
    public function getDisbursement(string $disbursementId): array
    {
        $response = $this->client()->get("/disbursements/{$disbursementId}");

        return $this->handleResponse($response, 'getDisbursement');
    }

    /**
     * Verify callback token
     */
    public function verifyCallbackToken(?string $token): bool
    {
        if (empty($this->webhookToken) || empty($token)) {
            return false;
        }

        return hash_equals($this->webhookToken, $token);
    }

    /**
     * Handle and parse HTTP response
     */
    protected function handleResponse(Response $response, string $action): array
    {
        if ($response->failed()) {
            Log::error("Xendit API Error [{$action}]", [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            $message = $response->json('message') ?? 'Gagal berkomunikasi dengan gateway pembayaran Xendit';
            throw new RuntimeException("Xendit [{$action}] Error: {$message} (HTTP {$response->status()})");
        }

        return $response->json() ?? [];
    }
}
