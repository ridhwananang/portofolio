<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Enums\PaymentLogStatus;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use App\Models\Transaction;
use App\Services\Payment\EscrowService;
use App\Services\Payment\Mayar\MayarClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class MayarWebhookController extends Controller
{
    public function __construct(
        protected MayarClient $mayarClient,
        protected EscrowService $escrowService
    ) {}

    /**
     * Menerima HTTP POST Webhook dari Mayar.id (event: payment.received)
     */
    public function handleNotification(Request $request): JsonResponse
    {
        if ($request->isMethod('get') || $request->isMethod('head')) {
            return response()->json([
                'status' => 'success',
                'message' => 'Mayar webhook endpoint is active and reachable',
            ], 200);
        }

        $payload = $request->all();
        $event = strtolower((string) ($payload['event'] ?? $payload['type'] ?? 'payment.received'));
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : $payload;

        $mayarId = $data['id'] ?? $data['paymentLinkId'] ?? null;
        $transactionId = $data['transactionId'] ?? $data['transaction_id'] ?? $mayarId;
        $externalId = $data['external_id'] ?? $data['reference'] ?? null;

        // Ekstrak kode referensi [Ref: QUEST-...] dari description jika ada
        if (empty($externalId) && ! empty($data['description']) && is_string($data['description'])) {
            if (preg_match('/\[Ref:\s*([A-Za-z0-9\-_]+)\]/i', $data['description'], $matches)) {
                $externalId = $matches[1];
            }
        }

        // 1. Handle test ping dari dashboard Mayar jika payload kosong / testing
        if (empty($mayarId) && empty($transactionId) && empty($externalId)) {
            Log::info('Mayar Webhook: Test ping notification received.');

            return response()->json([
                'status' => 'success',
                'message' => 'Mayar webhook URL is active and reachable',
            ], 200);
        }

        // 2. Catat raw payload ke payment_logs untuk audit trail
        $paymentLog = null;
        try {
            $paymentLog = PaymentLog::create([
                'event' => 'mayar.' . $event,
                'xendit_id' => (string) ($mayarId ?? $transactionId),
                'external_id' => (string) ($externalId ?? $mayarId ?? $transactionId),
                'payload' => $payload,
                'ip_address' => $request->ip(),
                'status' => PaymentLogStatus::RECEIVED,
            ]);
        } catch (Throwable $e) {
            Log::warning('Gagal mencatat payment_log Mayar: ' . $e->getMessage());
        }

        // 3. Verifikasi Webhook Token jika MAYAR_WEBHOOK_TOKEN dikonfigurasi di .env
        if ($this->mayarClient->hasWebhookTokenConfigured()) {
            $callbackToken = $request->header('x-callback-token')
                ?? $request->header('X-Webhook-Token')
                ?? $request->bearerToken();

            if (! $this->mayarClient->verifyWebhookToken($callbackToken)) {
                $paymentLog?->update([
                    'status' => PaymentLogStatus::FAILED,
                    'error_message' => 'Invalid Mayar webhook callback token',
                ]);

                Log::warning('Mayar Webhook Ditolak: Token callback tidak valid.', [
                    'ip' => $request->ip(),
                    'mayar_id' => $mayarId,
                ]);

                return response()->json(['error' => 'Invalid webhook token'], 403);
            }
        }

        // 4. Cari transaksi deposit yang cocok di database
        $transaction = Transaction::where('type', TransactionType::DEPOSIT)
            ->where(function ($query) use ($mayarId, $transactionId, $externalId) {
                if (! empty($externalId)) {
                    $query->orWhere('xendit_external_id', $externalId);
                }
                if (! empty($mayarId)) {
                    $query->orWhere('xendit_id', $mayarId)
                        ->orWhere('payment_details->token', $mayarId);
                }
                if (! empty($transactionId) && $transactionId !== $mayarId) {
                    $query->orWhere('xendit_id', $transactionId)
                        ->orWhere('payment_details->token', $transactionId);
                }
            })
            ->latest()
            ->first();

        if (! $transaction) {
            Log::info("Mayar Webhook: Transaksi untuk ID [{$mayarId}] / Ref [{$externalId}] tidak ditemukan di database.");

            return response()->json([
                'status' => 'success',
                'message' => 'Notification acknowledged',
            ], 200);
        }

        // Pastikan external_id di payment_log terisi dengan benar
        if ($paymentLog && $paymentLog->external_id !== $transaction->xendit_external_id) {
            $paymentLog->update(['external_id' => $transaction->xendit_external_id]);
        }

        // 5. Cek apakah status pembayaran sukses (payment.received & status true / paid / settled)
        $rawStatus = $data['status'] ?? null;
        $isPaidStatus = ($rawStatus === true)
            || ($rawStatus === 1)
            || in_array(strtolower((string) $rawStatus), ['true', '1', 'paid', 'settled', 'success', 'completed'], true);

        $isSuccess = ($event === 'payment.received' && ($rawStatus === null || $isPaidStatus)) || $isPaidStatus;

        if ($isSuccess) {
            try {
                $paymentData = array_merge($data, [
                    'id' => $transactionId ?? $mayarId,
                    'payer_email' => $data['customerEmail'] ?? $data['customer_email'] ?? null,
                    'payment_method' => $data['paymentMethod'] ?? $data['payment_method'] ?? 'MAYAR_CHECKOUT',
                    'payment_channel' => $data['paymentChannel'] ?? $data['payment_channel'] ?? 'MAYAR',
                ]);

                $this->escrowService->holdEscrow($transaction->xendit_external_id, $paymentData);

                $paymentLog?->update([
                    'status' => PaymentLogStatus::PROCESSED,
                ]);

                Log::info("Mayar Webhook Sukses: Dana deposit rekber untuk {$transaction->xendit_external_id} berhasil berstatus HELD.");

                return response()->json([
                    'status' => 'success',
                    'message' => 'Mayar payment.received processed and escrow held successfully',
                ]);
            } catch (Throwable $e) {
                $paymentLog?->update([
                    'status' => PaymentLogStatus::FAILED,
                    'error_message' => $e->getMessage(),
                ]);

                Log::error("Mayar Webhook Gagal untuk {$transaction->xendit_external_id}: " . $e->getMessage());

                return response()->json([
                    'error' => 'Gagal memproses escrow: ' . $e->getMessage(),
                ], 500);
            }
        }

        $paymentLog?->update([
            'status' => PaymentLogStatus::IGNORED,
        ]);

        return response()->json([
            'status' => 'ignored',
            'message' => "Mayar event [{$event}] recorded without action",
        ]);
    }
}
