<?php

namespace App\Console\Commands;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\ProjectOrder;
use App\Models\Transaction;
use App\Services\Payment\EscrowService;
use App\Services\Payment\Midtrans\MidtransClient;
use Illuminate\Console\Command;

class SyncMidtransPaymentCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'midtrans:sync
                            {tracking_code? : Kode tracking pesanan (misal: PRJ-XDL3BTXY)}
                            {--force : Paksa tandai lunas (simulasi sukses tanpa menunggu Midtrans)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi status pembayaran dari Midtrans Sandbox atau simulasikan pembayaran sukses di localhost';

    /**
     * Execute the console command.
     */
    public function handle(MidtransClient $client, EscrowService $escrowService): int
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

        // Cari transaksi yang relevan (DP atau Final)
        $transaction = null;
        if (!$order->isDpPaid() || $order->payment_stage === 'awaiting_dp' || $order->status === 'pending_payment') {
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

        // Jika transaksi di DB sudah HELD namun order belum sinkron
        if ($transaction->status === TransactionStatus::HELD) {
            $escrowService->syncOrderForTransaction($transaction);
            $this->info("✅ Status transaksi di database berstatus HELD. Pesanan dan milestone telah diselaraskan.");
            $this->displaySummary($order->fresh());
            return self::SUCCESS;
        }

        $externalId = $transaction->xendit_external_id;
        $this->line("Memeriksa transaksi Midtrans ID: {$externalId} (Nominal: Rp " . number_format($transaction->amount, 0, ',', '.') . ")");

        if ($force) {
            $this->info("Mode --force aktif: mensimulasikan pembayaran sukses...");
            $mockResponse = [
                'id' => 'MOCK-' . time(),
                'order_id' => $externalId,
                'transaction_status' => 'settlement',
                'gross_amount' => (string) $transaction->amount,
                'payment_type' => 'qris',
                'payment_channel' => 'qris_simulator',
            ];
            $escrowService->holdEscrow($externalId, $mockResponse);
            $this->info("✅ Berhasil! Pembayaran telah diverifikasi secara instan.");
            $this->displaySummary($order->fresh());
            return self::SUCCESS;
        }

        // Cek langsung ke Midtrans Core API
        try {
            $status = $client->getTransactionStatus($externalId);
            $midtransStatus = strtolower($status['transaction_status'] ?? '');
            $this->line("Status dari Midtrans Core API: [{$midtransStatus}]");

            if (in_array($midtransStatus, ['settlement', 'capture'])) {
                $escrowService->holdEscrow($externalId, [
                    'id' => $status['transaction_id'] ?? null,
                    'order_id' => $externalId,
                    'transaction_status' => $midtransStatus,
                    'gross_amount' => $status['gross_amount'] ?? (string) $transaction->amount,
                    'payment_type' => $status['payment_type'] ?? 'qris',
                    'payment_channel' => $status['payment_type'] ?? 'qris',
                ]);
                $this->info("✅ Sukses! Pembayaran dari Midtrans Sandbox terverifikasi.");
                $this->displaySummary($order->fresh());
            } elseif (in_array($midtransStatus, ['pending'])) {
                $this->warn("Transaksi masih berstatus PENDING di Midtrans.");
                $this->line("Silakan bayar melalui QRIS Simulator (https://simulator.sandbox.midtrans.com/qris/index)");
                $this->line("Atau jalankan perintah ini dengan opsi --force untuk simulasi instan:");
                $this->comment("php artisan midtrans:sync {$order->tracking_code} --force");
            } else {
                $this->warn("Status transaksi di Midtrans: {$midtransStatus}");
            }
        } catch (\Throwable $e) {
            $this->error("Gagal memeriksa status ke Midtrans API: " . $e->getMessage());
            $this->line("Tip: Jalankan simulasi lokal dengan opsi --force:");
            $this->comment("php artisan midtrans:sync {$order->tracking_code} --force");
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
                ['DP Terbayar', 'Rp ' . number_format($order->dp_amount, 0, ',', '.')],
                ['Sisa Pelunasan', 'Rp ' . number_format($order->remaining_amount, 0, ',', '.')],
                ['Waktu Bayar DP', $order->dp_paid_at ? $order->dp_paid_at->toDateTimeString() : '-'],
            ]
        );
    }
}
