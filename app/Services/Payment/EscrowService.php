<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\EscrowFunded;
use App\Events\EscrowRefunded;
use App\Events\EscrowReleased;
use App\Models\ProjectOrder;
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
     * Memulai proses transaksi pembayaran DP (Uang Muka) untuk Project Order
     */
    public function initiateProjectDpDeposit(ProjectOrder $order): Transaction
    {
        return DB::transaction(function () use ($order) {
            $quest = $order->quest;
            if (! $quest) {
                throw new InvalidArgumentException("Project order #{$order->id} tidak memiliki relasi Quest.");
            }

            $dpPct = (float) ($order->dp_percentage > 0 ? $order->dp_percentage : 50.0);
            $dpAmount = (float) ($order->dp_amount > 0
                ? $order->dp_amount
                : ($order->payment_scheme === 'down_payment'
                    ? round(($order->total_amount * $dpPct) / 100)
                    : $order->total_amount));

            // Jika sudah ada transaksi DP pending dengan invoice url valid dan nominal sesuai, gunakan itu
            if ($order->dp_transaction_id) {
                $existing = Transaction::find($order->dp_transaction_id);
                if ($existing && $existing->status === TransactionStatus::PENDING && (float) $existing->amount === (float) $dpAmount && ! empty($existing->payment_details['invoice_url'])) {
                    return $existing;
                }
            }

            $externalId = 'QUEST-DP-' . $order->id . '-' . time();

            $transaction = Transaction::create([
                'quest_id' => $quest->id,
                'user_id' => $quest->poster_id,
                'type' => TransactionType::DEPOSIT,
                'amount' => $dpAmount,
                'currency' => $order->currency ?? 'IDR',
                'status' => TransactionStatus::PENDING,
                'xendit_external_id' => $externalId,
                'payment_details' => [
                    'stage' => 'dp',
                    'order_tracking' => $order->tracking_code,
                    'dp_percentage' => (float) $order->dp_percentage,
                ],
            ]);

            $invoiceResponse = $this->gateway->createInvoice($transaction, $quest);

            $transaction->update([
                'xendit_id' => $invoiceResponse['id'] ?? null,
                'payment_details' => array_merge($transaction->payment_details ?? [], [
                    'invoice_url' => $invoiceResponse['invoice_url'] ?? null,
                    'token' => $invoiceResponse['token'] ?? null,
                    'expiry_date' => $invoiceResponse['expiry_date'] ?? null,
                ]),
            ]);

            $order->update([
                'dp_transaction_id' => $transaction->id,
                'payment_stage' => 'awaiting_dp',
            ]);

            $quest->update([
                'status' => QuestStatus::PENDING_PAYMENT,
            ]);

            return $transaction;
        });
    }

    /**
     * Memulai transaksi pembayaran akhir / pelunasan setelah kesepakatan akhir tercapai
     */
    public function initiateProjectFinalDeposit(ProjectOrder $order): Transaction
    {
        return DB::transaction(function () use ($order) {
            $quest = $order->quest;
            if (! $quest) {
                throw new InvalidArgumentException("Project order #{$order->id} tidak memiliki relasi Quest.");
            }

            if ($order->isFullyPaid()) {
                throw new InvalidArgumentException("Pesanan #{$order->tracking_code} sudah lunas.");
            }

            // Jika sudah ada transaksi pelunasan pending yang masih aktif
            if ($order->final_transaction_id) {
                $existing = Transaction::find($order->final_transaction_id);
                if ($existing && $existing->status === TransactionStatus::PENDING && ! empty($existing->payment_details['invoice_url'])) {
                    return $existing;
                }
            }

            $externalId = 'QUEST-FINAL-' . $order->id . '-' . time();
            $remainingAmount = (float) $order->remaining_amount;

            // Jika remaining amount 0 (misal bayar full di awal), maka langsung tandai lunas
            if ($remainingAmount <= 0) {
                $order->update([
                    'payment_stage' => 'fully_paid',
                    'final_paid_at' => now(),
                    'status' => 'completed',
                ]);
                throw new InvalidArgumentException("Pesanan ini tidak memiliki sisa tagihan pelunasan.");
            }

            $transaction = Transaction::create([
                'quest_id' => $quest->id,
                'user_id' => $quest->poster_id,
                'type' => TransactionType::DEPOSIT,
                'amount' => $remainingAmount,
                'currency' => $order->currency ?? 'IDR',
                'status' => TransactionStatus::PENDING,
                'xendit_external_id' => $externalId,
                'payment_details' => [
                    'stage' => 'final',
                    'order_tracking' => $order->tracking_code,
                    'remaining_amount' => $remainingAmount,
                ],
            ]);

            $invoiceResponse = $this->gateway->createInvoice($transaction, $quest);

            $transaction->update([
                'xendit_id' => $invoiceResponse['id'] ?? null,
                'payment_details' => array_merge($transaction->payment_details ?? [], [
                    'invoice_url' => $invoiceResponse['invoice_url'] ?? null,
                    'token' => $invoiceResponse['token'] ?? null,
                    'expiry_date' => $invoiceResponse['expiry_date'] ?? null,
                ]),
            ]);

            $order->update([
                'final_transaction_id' => $transaction->id,
                'payment_stage' => 'awaiting_final',
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

            // Jika status sudah HELD, tetap pastikan ProjectOrder sinkron sebelum return
            if ($transaction->status === TransactionStatus::HELD) {
                $this->syncOrderForTransaction($transaction);
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

            // Sinkronisasi status ProjectOrder jika transaksi ini milik ProjectOrder
            $this->syncOrderForTransaction($transaction);

            // Dispatch domain event untuk memicu listener
            event(new EscrowFunded($transaction, $transaction->quest));

            return $transaction;
        });
    }

    /**
     * Sinkronisasi status ProjectOrder dan Milestones berdasarkan transaksi deposit yang berhasil
     */
    public function syncOrderForTransaction(Transaction $transaction): void
    {
        $order = $transaction->quest?->projectOrder;
        if (! $order) {
            return;
        }

        $externalId = $transaction->xendit_external_id ?? '';
        $stage = $transaction->payment_details['stage'] ?? null;
        $isFinal = ($stage === 'final') || str_contains($externalId, '-FINAL-') || ($order->final_transaction_id === $transaction->id);

        if ($isFinal) {
            $milestones = $order->milestone_progress ?? ProjectOrder::getDefaultMilestones();
            foreach ($milestones as &$m) {
                $m['status'] = 'completed';
                if (empty($m['updated_at'])) {
                    $m['updated_at'] = ($transaction->paid_at ?? now())->toIso8601String();
                }
            }

            $order->update([
                'status' => 'completed',
                'payment_stage' => 'fully_paid',
                'final_paid_at' => $transaction->paid_at ?? now(),
                'final_transaction_id' => $transaction->id,
                'milestone_progress' => $milestones,
            ]);

            $transaction->quest->update([
                'status' => QuestStatus::COMPLETED,
                'completed_at' => $transaction->paid_at ?? now(),
            ]);
        } else {
            // Transaksi DP
            $milestones = $order->milestone_progress ?? ProjectOrder::getDefaultMilestones();
            foreach ($milestones as &$m) {
                if ($m['id'] === 'deposit') {
                    $m['status'] = 'completed';
                    if (empty($m['updated_at'])) {
                        $m['updated_at'] = ($transaction->paid_at ?? now())->toIso8601String();
                    }
                }
            }

            $order->update([
                'status' => in_array($order->status, ['pending_payment', 'awaiting_dp']) ? 'in_progress' : ($order->status ?: 'in_progress'),
                'payment_stage' => in_array($order->payment_stage, ['awaiting_final', 'fully_paid']) ? $order->payment_stage : 'dp_paid',
                'dp_paid_at' => $order->dp_paid_at ?? ($transaction->paid_at ?? now()),
                'dp_transaction_id' => $transaction->id,
                'milestone_progress' => $milestones,
            ]);

            if (in_array($transaction->quest->status, [QuestStatus::DRAFT, QuestStatus::PENDING_PAYMENT])) {
                $transaction->quest->update([
                    'status' => QuestStatus::OPEN,
                ]);
            }
        }
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

            if (! in_array($lockedQuest->status, [QuestStatus::UNDER_REVIEW, QuestStatus::COMPLETED])) {
                throw new InvalidArgumentException("Hanya quest berstatus 'under_review' atau 'completed' yang dapat disetujui untuk pencairan dana.");
            }

            if (! $lockedQuest->worker_id) {
                throw new InvalidArgumentException("Quest belum memiliki worker yang ditugaskan.");
            }

            // Pastikan setidaknya satu dana deposit sudah berstatus HELD
            $hasHeldDeposit = $lockedQuest->transactions()
                ->where('type', TransactionType::DEPOSIT)
                ->where('status', TransactionStatus::HELD)
                ->exists();

            if (! $hasHeldDeposit) {
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
