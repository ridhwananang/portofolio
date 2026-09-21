<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Enums\PaymentLogStatus;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use App\Models\Transaction;
use App\Services\Payment\EscrowService;
use App\Services\Payment\Midtrans\MidtransClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class MidtransWebhookController extends Controller
{
    public function __construct(
        protected MidtransClient $midtransClient,
        protected EscrowService $escrowService
    ) {}

    /**
     * Menerima HTTP POST notification dari Midtrans (Snap / Core API)
     */
    public function handleNotification(Request $request): JsonResponse
    {
        $payload = $request->all();

        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';
        $transactionStatus = strtolower($payload['transaction_status'] ?? 'unknown');
        $fraudStatus = strtolower($payload['fraud_status'] ?? '');
        $transactionId = $payload['transaction_id'] ?? null;

        // 1. Handle Midtrans Dashboard "Test notification URL" ping / mock test
        $isTestPing = empty($orderId) ||
            str_contains(strtolower((string) $orderId), 'test') ||
            str_contains(strtolower((string) $orderId), 'dummy') ||
            str_contains(strtolower((string) $orderId), 'sample') ||
            empty($signatureKey);

        if ($isTestPing) {
            Log::info("Midtrans Webhook: Test ping notification received for order [{$orderId}].");

            return response()->json([
                'status' => 'success',
                'message' => 'Notification URL is active and reachable',
            ], 200);
        }

        // 2. Catat ke payment_logs
        $paymentLog = null;
        try {
            $paymentLog = PaymentLog::create([
                'event' => 'midtrans.' . $transactionStatus,
                'xendit_id' => $transactionId,
                'external_id' => $orderId,
                'payload' => $payload,
                'ip_address' => $request->ip(),
                'status' => PaymentLogStatus::RECEIVED,
            ]);
        } catch (Throwable $e) {
            Log::warning('Gagal mencatat payment_log Midtrans: ' . $e->getMessage());
        }

        // 3. Verifikasi apakah transaksi ini milik sistem rekber kita
        $transaction = Transaction::where('xendit_external_id', $orderId)
            ->where('type', TransactionType::DEPOSIT)
            ->first();

        if (! $transaction) {
            Log::info("Midtrans Webhook: Transaksi dengan order_id [{$orderId}] tidak ditemukan dalam database (kemungkinan test ping dashboard).");

            return response()->json([
                'status' => 'success',
                'message' => "Order [{$orderId}] acknowledged",
            ], 200);
        }

        // 4. Verifikasi Signature Key Midtrans (jika server key dikonfigurasi)
        if (! empty($this->midtransClient->getServerKey())) {
            $isValidSignature = $this->midtransClient->verifySignature(
                $orderId,
                $statusCode,
                $grossAmount,
                $signatureKey
            );

            if (! $isValidSignature) {
                $paymentLog?->update([
                    'status' => PaymentLogStatus::FAILED,
                    'error_message' => 'Invalid Midtrans signature_key',
                ]);

                Log::warning("Midtrans Webhook Ditolak: Signature key tidak valid untuk order {$orderId}");

                return response()->json(['error' => 'Invalid signature'], 403);
            }
        }

        // 5. Cek apakah transaksi berhasil (settlement atau capture dengan accept)
        $isSuccess = ($transactionStatus === 'settlement') ||
            ($transactionStatus === 'capture' && $fraudStatus === 'accept');

        if ($isSuccess) {
            try {
                $paymentData = array_merge($payload, [
                    'payment_method' => $payload['payment_type'] ?? ($payload['payment_method'] ?? null),
                    'payment_channel' => $payload['va_numbers'][0]['bank'] ?? ($payload['bank'] ?? ($payload['issuer'] ?? ($payload['payment_channel'] ?? null))),
                ]);

                $this->escrowService->holdEscrow($orderId, $paymentData);

                $paymentLog?->update([
                    'status' => PaymentLogStatus::PROCESSED,
                ]);

                Log::info("Midtrans Webhook Sukses: Dana deposit rekber untuk {$orderId} berhasil berstatus HELD.");

                return response()->json([
                    'status' => 'success',
                    'message' => 'Midtrans notification processed and escrow held successfully',
                ]);
            } catch (Throwable $e) {
                $paymentLog?->update([
                    'status' => PaymentLogStatus::FAILED,
                    'error_message' => $e->getMessage(),
                ]);

                Log::error("Midtrans Webhook Gagal untuk {$orderId}: " . $e->getMessage());

                return response()->json([
                    'error' => 'Gagal memproses escrow: ' . $e->getMessage(),
                ], 500);
            }
        }

        return response()->json([
            'status' => 'ignored',
            'message' => "Midtrans transaction status [{$transactionStatus}] recorded without action",
        ]);
    }
}
