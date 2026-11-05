<?php

namespace App\Services\Payment\Mayar;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MayarClient
{
    protected string $apiKey;
    protected string $webhookToken;
    protected bool $isProduction;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) (config('services.mayar.api_key') ?? '');
        $this->webhookToken = (string) (config('services.mayar.webhook_token') ?? '');
        $this->isProduction = (bool) config('services.mayar.is_production', false);

        $configuredBaseUrl = config('services.mayar.base_url');
        if (! empty($configuredBaseUrl)) {
            $this->baseUrl = rtrim((string) $configuredBaseUrl, '/');
        } else {
            $this->baseUrl = $this->isProduction
                ? 'https://api.mayar.id/hl/v1'
                : 'https://api.mayar.club/hl/v1';
        }
    }

    /**
     * HTTP Client dengan Bearer Token Mayar Headless API
     */
    protected function client(): PendingRequest
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('MAYAR_API_KEY belum dikonfigurasi di file .env.');
        }

        return Http::baseUrl($this->baseUrl)
            ->withToken($this->apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(15)
            ->retry(2, 100);
    }

    /**
     * Membuat Single Payment Request / Invoice di Mayar (Inflow / Deposit)
     * Endpoint: POST /payment/create
     */
    public function createPayment(array $payload): array
    {
        $response = $this->client()->post('/payment/create', $payload);

        return $this->handleResponse($response, 'createPayment');
    }

    /**
     * Membuat Invoice di Mayar
     * Endpoint: POST /invoice/create
     */
    public function createInvoice(array $payload): array
    {
        $response = $this->client()->post('/invoice/create', $payload);

        return $this->handleResponse($response, 'createInvoice');
    }

    /**
     * Cek status pembayaran / invoice dari Mayar API
     * Endpoint: GET /payment/{id} atau GET /invoice/{id}
     */
    public function getPaymentStatus(string $id): array
    {
        $response = $this->client()->get("/payment/{$id}");

        if ($response->failed()) {
            $fallbackResponse = $this->client()->get("/invoice/{$id}");
            if ($fallbackResponse->successful()) {
                return $this->handleResponse($fallbackResponse, 'getInvoiceStatus');
            }
        }

        return $this->handleResponse($response, 'getPaymentStatus');
    }

    /**
     * Mendaftarkan URL Webhook secara terprogram ke Mayar
     * Endpoint: POST /webhook/register
     */
    public function registerWebhook(string $urlHook): array
    {
        $response = $this->client()->post('/webhook/register', [
            'urlHook' => $urlHook,
        ]);

        return $this->handleResponse($response, 'registerWebhook');
    }

    /**
     * Verifikasi token webhook Mayar (x-callback-token)
     * Jika MAYAR_WEBHOOK_TOKEN dikonfigurasi di .env, wajib cocok (fail-closed).
     */
    public function verifyWebhookToken(?string $token): bool
    {
        if (empty($this->webhookToken)) {
            return false;
        }

        if (empty($token)) {
            return false;
        }

        return hash_equals($this->webhookToken, (string) $token);
    }

    public function hasWebhookTokenConfigured(): bool
    {
        return ! empty($this->webhookToken);
    }

    public function getApiKey(): string
    {
        return $this->apiKey;
    }

    public function isProduction(): bool
    {
        return $this->isProduction;
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    /**
     * Handle & parse HTTP response dari Mayar
     */
    protected function handleResponse(Response $response, string $action): array
    {
        if ($response->successful()) {
            return $response->json() ?? [];
        }

        $errorMessage = $response->json('messages')
            ?? $response->json('message')
            ?? $response->body();

        Log::error("Mayar API Error [{$action}]:", [
            'status' => $response->status(),
            'body' => $response->json() ?? $response->body(),
        ]);

        throw new RuntimeException("Mayar Error [{$action}]: {$errorMessage} (HTTP {$response->status()})");
    }
}
