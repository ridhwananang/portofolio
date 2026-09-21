<?php

namespace App\Contracts;

use App\Models\Quest;
use App\Models\Transaction;

interface PaymentGatewayInterface
{
    /**
     * Membuat tagihan invoice (Inflow / Deposit Escrow)
     *
     * @param Transaction $transaction
     * @param Quest $quest
     * @return array Response dari gateway (termasuk invoice_url dan id)
     */
    public function createInvoice(Transaction $transaction, Quest $quest): array;

    /**
     * Membuat transfer pencairan dana (Outflow / Disbursement Escrow)
     *
     * @param Transaction $transaction
     * @param array $recipient Info rekening penerima (bank_code, account_number, account_holder_name, description)
     * @return array Response dari gateway
     */
    public function createDisbursement(Transaction $transaction, array $recipient): array;

    /**
     * Mendapatkan status invoice dari gateway
     */
    public function getInvoice(string $invoiceId): array;

    /**
     * Mendapatkan status disbursement dari gateway
     */
    public function getDisbursement(string $disbursementId): array;

    /**
     * Memverifikasi token / signature webhook yang masuk
     */
    public function verifyWebhookToken(?string $token): bool;
}
