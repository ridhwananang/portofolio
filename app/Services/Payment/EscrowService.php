<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\EscrowFunded;
use App\Events\EscrowRefunded;
use App\Events\EscrowReleased;
use App\Models\Quest;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class EscrowService
{
    public function __construct(
        protected PaymentGatewayInterface $gateway
    ) {}

    /**
     * Memulai proses deposit rekber untuk Quest yang baru dibuat oleh poster
     */
    public function initiateQuestDeposit(Quest $quest): Transaction
    {
        if ($quest->isFunded()) {
            throw new InvalidArgumentException("Quest #{$quest->id} sudah memiliki dana rekber aktif.");
        }

        return DB::transaction(function () use ($quest) {
            $externalId = 'QUEST-DEP-' . $quest->id . '-' . time();

            // Buat transaksi deposit pending
            $transaction = Transaction::create([
                'quest_id' => $quest->id,
                'user_id' => $quest->poster_id,
                'type' => TransactionType::DEPOSIT,
                'amount' => $quest->total_amount,
                'currency' => $quest->currency,
                'status' => TransactionStatus::PENDING,
                'xendit_external_id' => $externalId,
            ]);

            // Panggil Payment Gateway untuk membuat invoice
            $invoiceResponse = $this->gateway->createInvoice($transaction, $quest);

            $transaction->update([
                'xendit_id' => $invoiceResponse['id'] ?? null,
                'payment_details' => [
                    'invoice_url' => $invoiceResponse['invoice_url'] ?? null,
                    'expiry_date' => $invoiceResponse['expiry_date'] ?? null,
                    'available_banks' => $invoiceResponse['available_banks'] ?? [],
                    'available_ewallets' => $invoiceResponse['available_ewallets'] ?? [],
                    'available_retail_outlets' => $invoiceResponse['available_retail_outlets'] ?? [],
                    'available_qr_codes' => $invoiceResponse['available_qr_codes'] ?? [],
                ],
            ]);

            $quest->update([
                'status' => QuestStatus::PENDING_PAYMENT,
            ]);

            return $transaction;
        });
    }

    /**
     * Menahan dana di rekening rekber setelah pembayaran poster terkonfirmasi (Idempotent & Concurrency-Safe)
     */
    public function holdEscrow(string $externalId, array $paymentData = []): Transaction
    {
        return DB::transaction(function () use ($externalId, $paymentData) {
            /** @var Transaction|null $transaction */
            $transaction = Transaction::where('xendit_external_id', $externalId)
                ->where('type', TransactionType::DEPOSIT)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new RuntimeException("Transaksi deposit dengan external_id [{$externalId}] tidak ditemukan.");
            }

            // Cek Idempotency: Jika status sudah HELD, jangan proses ulang
            if ($transaction->status === TransactionStatus::HELD) {
                return $transaction;
            }

            $currentDetails = $transaction->payment_details ?? [];
            $mergedDetails = array_merge($currentDetails, [
                'payment_id' => $paymentData['id'] ?? null,
                'payer_email' => $paymentData['payer_email'] ?? null,
                'payment_callback' => $paymentData,
            ]);

            $transaction->update([
                'status' => TransactionStatus::HELD,
                'paid_at' => now(),
                'payment_method' => $paymentData['payment_method'] ?? null,
                'payment_channel' => $paymentData['payment_channel'] ?? null,
                'payment_details' => $mergedDetails,
            ]);

            // Dispatch domain event untuk memicu listener
            event(new EscrowFunded($transaction, $transaction->quest));

            return $transaction;
        });
    }

    /**
     * Memulai proses pencairan dana (disbursement) ke rekening worker setelah quest disetujui poster
     */
    public function releaseEscrow(Quest $quest, array $recipientBankDetails): Transaction
    {
        return DB::transaction(function () use ($quest, $recipientBankDetails) {
            // Lock quest untuk mencegah double release
            /** @var Quest $lockedQuest */
            $lockedQuest = Quest::where('id', $quest->id)->lockForUpdate()->firstOrFail();

            if ($lockedQuest->status !== QuestStatus::UNDER_REVIEW) {
                throw new InvalidArgumentException("Hanya quest berstatus 'under_review' yang dapat disetujui untuk pencairan dana.");
            }

            if (! $lockedQuest->worker_id) {
                throw new InvalidArgumentException("Quest belum memiliki worker yang ditugaskan.");
            }

            // Pastikan dana deposit sudah berstatus HELD
            $deposit = $lockedQuest->depositTransaction;
            if (! $deposit || $deposit->status !== TransactionStatus::HELD) {
                throw new RuntimeException("Dana deposit rekber belum berstatus HELD.");
            }

            $externalId = 'QUEST-PAY-' . $lockedQuest->id . '-' . time();

            // Buat record transaksi pencairan (outflow)
            $payoutTransaction = Transaction::create([
                'quest_id' => $lockedQuest->id,
                'user_id' => $lockedQuest->worker_id,
                'type' => TransactionType::PAYOUT,
                'amount' => $lockedQuest->reward_amount,
                'currency' => $lockedQuest->currency,
                'status' => TransactionStatus::RELEASING,
                'xendit_external_id' => $externalId,
                'payment_method' => 'DISBURSEMENT',
                'payment_channel' => strtoupper($recipientBankDetails['bank_code']),
                'payment_details' => [
                    'recipient' => $recipientBankDetails,
                ],
            ]);

            // Panggil API Disbursement Xendit
            $disbursementResponse = $this->gateway->createDisbursement($payoutTransaction, $recipientBankDetails);

            $payoutTransaction->update([
                'xendit_id' => $disbursementResponse['id'] ?? null,
                'payment_details' => array_merge($payoutTransaction->payment_details ?? [], [
                    'disbursement_response' => $disbursementResponse,
                ]),
            ]);

            return $payoutTransaction;
        });
    }

    /**
     * Menyelesaikan status pencairan dana setelah menerima konfirmasi webhook disbursement Xendit
     */
    public function completeDisbursement(string $externalId, array $disbursementData = []): Transaction
    {
        return DB::transaction(function () use ($externalId, $disbursementData) {
            /** @var Transaction|null $transaction */
            $transaction = Transaction::where('xendit_external_id', $externalId)
                ->where('type', TransactionType::PAYOUT)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw new RuntimeException("Transaksi disbursement dengan external_id [{$externalId}] tidak ditemukan.");
            }

            // Cek Idempotency
            if ($transaction->status === TransactionStatus::RELEASED) {
                return $transaction;
            }

            $status = strtoupper($disbursementData['status'] ?? 'COMPLETED');

            if ($status === 'COMPLETED') {
                $transaction->update([
                    'status' => TransactionStatus::RELEASED,
                    'released_at' => now(),
                    'payment_details' => array_merge($transaction->payment_details ?? [], [
                        'completed_callback' => $disbursementData,
                    ]),
                ]);

                event(new EscrowReleased($transaction, $transaction->quest));
            } elseif ($status === 'FAILED') {
                $transaction->update([
                    'status' => TransactionStatus::FAILED,
                    'payment_details' => array_merge($transaction->payment_details ?? [], [
                        'failure_callback' => $disbursementData,
                    ]),
                ]);
            }

            return $transaction;
        });
    }

    /**
     * Membatalkan quest dan mengembalikan dana ke poster (Refund)
     */
    public function refundEscrow(Quest $quest, string $reason): Transaction
    {
        return DB::transaction(function () use ($quest, $reason) {
            /** @var Quest $lockedQuest */
            $lockedQuest = Quest::where('id', $quest->id)->lockForUpdate()->firstOrFail();

            if (! in_array($lockedQuest->status, [QuestStatus::OPEN, QuestStatus::DISPUTED])) {
                throw new InvalidArgumentException("Quest tidak dalam status yang dapat di-refund.");
            }

            $deposit = $lockedQuest->depositTransaction;
            if (! $deposit || $deposit->status !== TransactionStatus::HELD) {
                throw new RuntimeException("Tidak ada dana rekber berstatus HELD untuk di-refund.");
            }

            $externalId = 'QUEST-REF-' . $lockedQuest->id . '-' . time();

            $refundTransaction = Transaction::create([
                'quest_id' => $lockedQuest->id,
                'user_id' => $lockedQuest->poster_id,
                'type' => TransactionType::REFUND,
                'amount' => $lockedQuest->total_amount,
                'currency' => $lockedQuest->currency,
                'status' => TransactionStatus::REFUNDED,
                'xendit_external_id' => $externalId,
                'payment_details' => [
                    'reason' => $reason,
                ],
                'released_at' => now(),
            ]);

            $deposit->update([
                'status' => TransactionStatus::REFUNDED,
            ]);

            $lockedQuest->update([
                'status' => QuestStatus::CANCELLED,
                'dispute_reason' => $reason,
            ]);

            event(new EscrowRefunded($refundTransaction, $lockedQuest));

            return $refundTransaction;
        });
    }
}
