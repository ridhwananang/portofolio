<?php

namespace App\Services\Payment\Xendit;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Quest;
use App\Models\Transaction;

class XenditPaymentGateway implements PaymentGatewayInterface
{
    public function __construct(
        protected XenditClient $client
    ) {}

    public function createInvoice(Transaction $transaction, Quest $quest): array
    {
        $payload = [
            'external_id' => $transaction->xendit_external_id,
            'amount' => (float) $transaction->amount,
            'description' => "Pembayaran Rekber Quest: {$quest->title}",
            'currency' => $transaction->currency ?? 'IDR',
            'payer_email' => $transaction->user?->email,
            'customer' => [
                'given_names' => $transaction->user?->name ?? 'User',
                'email' => $transaction->user?->email,
            ],
            'items' => [
                [
                    'name' => "Hadiah Quest: {$quest->title}",
                    'quantity' => 1,
                    'price' => (float) $quest->reward_amount,
                    'category' => 'QUEST_REWARD',
                ],
            ],
        ];

        if ((float) $quest->fee_amount > 0) {
            $payload['items'][] = [
                'name' => 'Biaya Platform Rekber',
                'quantity' => 1,
                'price' => (float) $quest->fee_amount,
                'category' => 'PLATFORM_FEE',
            ];
        }

        return $this->client->createInvoice($payload);
    }

    public function createDisbursement(Transaction $transaction, array $recipient): array
    {
        $payload = [
            'external_id' => $transaction->xendit_external_id,
            'amount' => (float) $transaction->amount,
            'bank_code' => strtoupper($recipient['bank_code']),
            'account_holder_name' => $recipient['account_holder_name'],
            'account_number' => (string) $recipient['account_number'],
            'description' => $recipient['description'] ?? "Pencairan Hadiah Quest #{$transaction->quest_id}",
        ];

        return $this->client->createDisbursement($payload, $transaction->uuid);
    }

    public function getInvoice(string $invoiceId): array
    {
        return $this->client->getInvoice($invoiceId);
    }

    public function getDisbursement(string $disbursementId): array
    {
        return $this->client->getDisbursement($disbursementId);
    }

    public function verifyWebhookToken(?string $token): bool
    {
        return $this->client->verifyCallbackToken($token);
    }
}
