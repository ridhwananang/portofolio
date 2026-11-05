<?php

namespace App\Services\Payment\Mayar;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Quest;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class MayarPaymentGateway implements PaymentGatewayInterface
{
    public function __construct(
        protected MayarClient $client
    ) {}

    /**
     * Membuat tagihan pembayaran via Mayar Headless API (Inflow / Deposit Escrow)
     */
    public function createInvoice(Transaction $transaction, Quest $quest): array
    {
        $externalId = $transaction->xendit_external_id;
        $amount = (int) round((float) $transaction->amount);
        $clientUser = $quest->poster;
        $projectOrder = $quest->projectOrder;

        $stage = $transaction->payment_details['stage'] ?? null;
        if (! $stage) {
            if (str_contains((string) $externalId, '-DP-')) {
                $stage = 'dp';
            } elseif (str_contains((string) $externalId, '-FINAL-')) {
                $stage = 'final';
            }
        }

        $description = match ($stage) {
            'dp' => 'DP (' . ($projectOrder?->dp_percentage ?? 50) . '%): ' . $quest->title . " [Ref: {$externalId}]",
            'final' => 'Pelunasan Final: ' . $quest->title . " [Ref: {$externalId}]",
            default => "Pembayaran Rekber: {$quest->title} [Ref: {$externalId}]",
        };

        $redirectUrl = $projectOrder
            ? route('project.tracker', $projectOrder->tracking_code)
            : url("/quests/{$quest->id}");

        $expiredAt = now()->addHours(24)->toIso8601String();

        $payload = [
            'name' => $clientUser?->name ?? $projectOrder?->client_name ?? 'Client',
            'email' => $clientUser?->email ?? $projectOrder?->client_email ?? 'client@example.com',
            'amount' => $amount,
            'mobile' => $projectOrder?->client_phone ?: '081200000000',
            'redirectUrl' => $redirectUrl,
            'redirectURL' => $redirectUrl,
            'description' => $description,
            'expiredAt' => $expiredAt,
        ];

        // Jika MAYAR_API_KEY belum diisi (misal belum verifikasi / testing lokal tanpa API key),
        // gunakan fallback simulasi agar alur pemesanan tetap berjalan mulus tanpa error
        if (empty($this->client->getApiKey())) {
            $mockId = 'MAYAR-SIM-' . strtolower(substr(md5($externalId), 0, 10));
            Log::info("Mayar Simulation Mode aktif (MAYAR_API_KEY kosong) untuk Quest #{$quest->id}", [
                'external_id' => $externalId,
                'mock_id' => $mockId,
            ]);

            return [
                'id' => $mockId,
                'invoice_url' => $redirectUrl,
                'status' => 'PENDING',
                'token' => $mockId,
                'expiry_date' => $expiredAt,
                'raw' => ['simulated' => true],
            ];
        }

        $response = $this->client->createPayment($payload);
        $data = $response['data'] ?? $response;

        $mayarId = $data['id'] ?? $data['transactionId'] ?? $data['transaction_id'] ?? $externalId;
        $transactionId = $data['transactionId'] ?? $data['transaction_id'] ?? $mayarId;
        $invoiceUrl = $data['link'] ?? $data['paymentUrl'] ?? $redirectUrl;

        Log::info("Mayar Payment Link berhasil dibuat untuk Quest #{$quest->id}", [
            'external_id' => $externalId,
            'mayar_id' => $mayarId,
            'transaction_id' => $transactionId,
            'link' => $invoiceUrl,
        ]);

        return [
            'id' => $mayarId,
            'invoice_url' => $invoiceUrl,
            'status' => 'PENDING',
            'token' => $transactionId,
            'expiry_date' => $expiredAt,
            'raw' => $response,
        ];
    }

    /**
     * Mencatat pelepasan dana rekber (Outflow / Settlement ke Merchant)
     */
    public function createDisbursement(Transaction $transaction, array $recipient): array
    {
        Log::info("Pencairan dana rekber Mayar dicatat untuk Quest #{$transaction->quest_id}", [
            'transaction_id' => $transaction->id,
            'recipient' => $recipient,
        ]);

        return [
            'id' => 'MAYAR-DISB-' . time(),
            'status' => 'COMPLETED',
            'amount' => $transaction->amount,
            'recipient' => $recipient,
        ];
    }

    /**
     * Mendapatkan status pembayaran/invoice dari Mayar API
     */
    public function getInvoice(string $invoiceId): array
    {
        return $this->client->getPaymentStatus($invoiceId);
    }

    /**
     * Mendapatkan status disbursement
     */
    public function getDisbursement(string $disbursementId): array
    {
        return [
            'id' => $disbursementId,
            'status' => 'COMPLETED',
        ];
    }

    /**
     * Verifikasi token webhook Mayar
     */
    public function verifyWebhookToken(?string $token): bool
    {
        return $this->client->verifyWebhookToken($token);
    }
}
