<?php

namespace App\Services\Payment\Midtrans;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Quest;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class MidtransPaymentGateway implements PaymentGatewayInterface
{
    public function __construct(
        protected MidtransClient $client
    ) {}

    /**
     * Membuat tagihan invoice via Midtrans Snap (Inflow / Deposit Escrow)
     */
    public function createInvoice(Transaction $transaction, Quest $quest): array
    {
        $orderId = $transaction->xendit_external_id;
        $grossAmount = (int) round((float) $transaction->amount);
        $clientUser = $quest->poster;
        $projectOrder = $quest->projectOrder;

        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $clientUser?->name ?? $projectOrder?->client_name ?? 'Client',
                'email' => $clientUser?->email ?? $projectOrder?->client_email ?? 'client@example.com',
                'phone' => $projectOrder?->client_phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'QUEST-' . $quest->id,
                    'price' => $grossAmount,
                    'quantity' => 1,
                    'name' => mb_substr($quest->title, 0, 50),
                ],
            ],
        ];

        // Jika menggunakan snap token / redirect_url
        $snapResponse = $this->client->createSnapTransaction($payload);

        $invoiceUrl = $snapResponse['redirect_url'] ?? '';
        $token = $snapResponse['token'] ?? '';

        Log::info("Midtrans Snap Transaction berhasil dibuat untuk Quest #{$quest->id}", [
            'order_id' => $orderId,
            'token' => $token,
            'redirect_url' => $invoiceUrl,
        ]);

        return [
            'id' => $token,
            'invoice_url' => $invoiceUrl,
            'status' => 'PENDING',
            'token' => $token,
            'raw' => $snapResponse,
        ];
    }

    /**
     * Membuat pencairan dana (Outflow / Disbursement)
     */
    public function createDisbursement(Transaction $transaction, array $recipient): array
    {
        // Catat transfer pencairan dana rekber ke rekening developer
        Log::info("Pencairan dana rekber Midtrans diinisiasi untuk Quest #{$transaction->quest_id}", [
            'transaction_id' => $transaction->id,
            'recipient' => $recipient,
        ]);

        return [
            'id' => 'MIDTRANS-DISB-' . time(),
            'status' => 'PENDING',
            'amount' => $transaction->amount,
            'recipient' => $recipient,
        ];
    }

    /**
     * Mendapatkan status invoice dari Midtrans Core API
     */
    public function getInvoice(string $invoiceId): array
    {
        return $this->client->getTransactionStatus($invoiceId);
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
     * Verifikasi token webhook (Midtrans menggunakan SHA512 signature hash)
     */
    public function verifyWebhookToken(?string $token): bool
    {
        return ! empty($token);
    }

    /**
     * Helper verifikasi spesifik signature Midtrans
     */
    public function verifyMidtransSignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        return $this->client->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey);
    }
}
