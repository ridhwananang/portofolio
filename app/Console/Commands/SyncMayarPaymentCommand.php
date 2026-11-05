<?php

namespace App\Console\Commands;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\ProjectOrder;
use App\Services\Payment\EscrowService;
use App\Services\Payment\Mayar\MayarClient;
use Illuminate\Console\Command;
use Throwable;

class SyncMayarPaymentCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mayar:sync
                            {tracking_code? : Kode tracking pesanan (misal: PRJ-XDL3BTXY)}
                            {--force : Paksa tandai lunas (simulasi sukses di localhost)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi status pembayaran dari Mayar.id API atau simulasikan pembayaran sukses di localhost';

    /**
     * Execute the console command.
     */
    public function handle(MayarClient $client, EscrowService $escrowService): int
    {
        $trackingCode = $this->argument('tracking_code');
        $force = (bool) $this->option('force');

        if (! $trackingCode) {
            $order = ProjectOrder::latest()->first();
            if (! $order) {
                $this->error('Tidak ada pesanan ditemukan.');
                return self::FAILURE;
            }
        } else {
            $order = ProjectOrder::where('tracking_code', $trackingCode)->first();
            if (! $order) {
                $this->error("Pesanan dengan kode [{$trackingCode}] tidak ditemukan.");
                return self::FAILURE;
            }
        }

        $this->info("Memeriksa pesanan: #{$order->tracking_code} (Status: {$order->status}, Tahap: {$order->payment_stage})");

        $transaction = null;
        if (! $order->isDpPaid() || $order->payment_stage === 'awaiting_dp' || $order->status === 'pending_payment') {
            $transaction = $order->dpTransaction
                ?? $order->quest?->transactions()
                    ->where('type', TransactionType::DEPOSIT)
                    ->latest()
                    ->first();
        } elseif ($order->final_transaction_id || $order->payment_stage === 'awaiting_final' || $order->status === 'in_review') {
            $transaction = $order->finalTransaction
                ?? $order->quest?->transactions()
                    ->where('type', TransactionType::DEPOSIT)
                    ->where('id', '!=', $order->dp_transaction_id)
                    ->latest()
                    ->first();
        } else {
            $transaction = $order->dpTransaction ?? $order->finalTransaction;
        }

        if (! $transaction) {
            $this->warn("Tidak ada transaksi terkait untuk pesanan #{$order->tracking_code}.");
            return self::SUCCESS;
        }

        $externalId = $transaction->xendit_external_id;
        $mayarId = $transaction->xendit_id ?: $externalId;

        if ($transaction->status === TransactionStatus::HELD) {
            $escrowService->syncOrderForTransaction($transaction);
            $this->info('✅ Status transaksi di database berstatus HELD. Pesanan dan milestone telah diselaraskan.');
            $this->displaySummary($order->fresh());
            return self::SUCCESS;
        }

        $this->line("Memeriksa transaksi Mayar ID: {$mayarId} | Ref: {$externalId} (Nominal: Rp " . number_format((float) $transaction->amount, 0, ',', '.') . ')');

        if ($force) {
            $this->info('Mode --force aktif: mensimulasikan pembayaran Mayar sukses...');
            $mockResponse = [
                'id' => $mayarId ?: ('MAYAR-MOCK-' . time()),
                'external_id' => $externalId,
                'status' => 'paid',
                'amount' => (float) $transaction->amount,
                'payment_method' => 'MAYAR_QRIS',
                'payment_channel' => 'QRIS',
            ];
            $escrowService->holdEscrow($externalId, $mockResponse);
            $this->info('✅ Berhasil! Pembayaran Mayar telah diverifikasi secara instan.');
            $this->displaySummary($order->fresh());
            return self::SUCCESS;
        }

        try {
            $response = $client->getPaymentStatus($mayarId);
            $data = $response['data'] ?? $response;
            $rawStatus = $data['status'] ?? 'unknown';
            $statusStr = is_bool($rawStatus) ? ($rawStatus ? 'paid' : 'unpaid') : strtolower((string) $rawStatus);

            $this->line("Status dari Mayar API: [{$statusStr}]");

            if ($rawStatus === true || in_array($statusStr, ['paid', 'settled', 'completed', 'success', 'true', '1'], true)) {
                $escrowService->holdEscrow($externalId, [
                    'id' => $data['id'] ?? $mayarId,
                    'external_id' => $externalId,
                    'status' => 'paid',
                    'amount' => $data['amount'] ?? (float) $transaction->amount,
                    'payment_method' => $data['paymentMethod'] ?? 'MAYAR_CHECKOUT',
                    'payment_channel' => $data['paymentChannel'] ?? 'MAYAR',
                ]);
                $this->info('✅ Sukses! Pembayaran dari Mayar API terverifikasi.');
                $this->displaySummary($order->fresh());
            } else {
                $this->warn("Transaksi masih berstatus [{$statusStr}] di Mayar.");
                $this->line('Atau jalankan perintah ini dengan opsi --force untuk simulasi instan di lokal:');
                $this->comment("php artisan mayar:sync {$order->tracking_code} --force");
            }
        } catch (Throwable $e) {
            $this->error('Gagal memeriksa status ke Mayar API: ' . $e->getMessage());
            $this->line('Tip: Jalankan simulasi lokal dengan opsi --force:');
            $this->comment("php artisan mayar:sync {$order->tracking_code} --force");
        }

        return self::SUCCESS;
    }

    protected function displaySummary(ProjectOrder $order): void
    {
        $this->table(
            ['Atribut', 'Nilai'],
            [
                ['Tracking Code', $order->tracking_code],
                ['Status Proyek', $order->status],
                ['Tahapan Pembayaran', $order->payment_stage],
                ['DP Terbayar', 'Rp ' . number_format((float) $order->dp_amount, 0, ',', '.')],
                ['Sisa Pelunasan', 'Rp ' . number_format((float) $order->remaining_amount, 0, ',', '.')],
                ['Waktu Bayar DP', $order->dp_paid_at ? $order->dp_paid_at->toDateTimeString() : '-'],
            ]
        );
    }
}
