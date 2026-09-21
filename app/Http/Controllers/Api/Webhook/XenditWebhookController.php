<?php

namespace App\Http\Controllers\Api\Webhook;

use App\Contracts\PaymentGatewayInterface;
use App\Enums\PaymentLogStatus;
use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use App\Services\Payment\EscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class XenditWebhookController extends Controller
{
    public function __construct(
        protected PaymentGatewayInterface $gateway,
        protected EscrowService $escrowService
    ) {}

    /**
     * Webhook penerima event Invoice (Pembayaran Deposit oleh Poster)
     */
    public function handleInvoice(Request $request): JsonResponse
    {
        $callbackToken = $request->header('x-callback-token');
        $payload = $request->all();
        $externalId = $payload['external_id'] ?? null;
        $xenditId = $payload['id'] ?? null;
        $status = strtoupper($payload['status'] ?? 'UNKNOWN');

        // 1. Catat raw payload ke payment_logs untuk audit trail
        $paymentLog = PaymentLog::create([
            'event' => 'invoice.' . strtolower($status),
            'xendit_id' => $xenditId,
            'external_id' => $externalId,
            'payload' => $payload,
            'ip_address' => $request->ip(),
            'status' => PaymentLogStatus::RECEIVED,
        ]);

        // 2. Verifikasi Token Keamanan Callback
        if (! $this->gateway->verifyWebhookToken($callbackToken)) {
            $paymentLog->update([
                'status' => PaymentLogStatus::FAILED,
                'error_message' => 'Invalid x-callback-token header',
            ]);

            Log::warning('Xendit Webhook Invoice Ditolak: Token callback tidak valid.', [
                'ip' => $request->ip(),
                'external_id' => $externalId,
            ]);

            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 3. Proses Pembayaran jika status PAID / SETTLED
        if (in_array($status, ['PAID', 'SETTLED'])) {
            try {
                $this->escrowService->holdEscrow($externalId, $payload);

                $paymentLog->update([
                    'status' => PaymentLogStatus::PROCESSED,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Invoice payment processed and escrow held successfully',
                ]);
            } catch (Throwable $e) {
                $paymentLog->update([
                    'status' => PaymentLogStatus::FAILED,
                    'error_message' => $e->getMessage(),
                ]);

                Log::error('Gagal memproses penahanan dana escrow:', [
                    'error' => $e->getMessage(),
                    'external_id' => $externalId,
                ]);

                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        // Status lain (EXPIRED, PENDING, dsb)
        $paymentLog->update([
            'status' => PaymentLogStatus::IGNORED,
        ]);

        return response()->json([
            'status' => 'ignored',
            'message' => "Invoice status [{$status}] recorded without action",
        ]);
    }

    /**
     * Webhook penerima event Disbursement (Pencairan dana ke Worker)
     */
    public function handleDisbursement(Request $request): JsonResponse
    {
        $callbackToken = $request->header('x-callback-token');
        $payload = $request->all();
        $externalId = $payload['external_id'] ?? null;
        $xenditId = $payload['id'] ?? null;
        $status = strtoupper($payload['status'] ?? 'UNKNOWN');

        // 1. Audit trail log
        $paymentLog = PaymentLog::create([
            'event' => 'disbursement.' . strtolower($status),
            'xendit_id' => $xenditId,
            'external_id' => $externalId,
            'payload' => $payload,
            'ip_address' => $request->ip(),
            'status' => PaymentLogStatus::RECEIVED,
        ]);

        // 2. Verifikasi Token Callback
        if (! $this->gateway->verifyWebhookToken($callbackToken)) {
            $paymentLog->update([
                'status' => PaymentLogStatus::FAILED,
                'error_message' => 'Invalid x-callback-token header',
            ]);

            Log::warning('Xendit Webhook Disbursement Ditolak: Token callback tidak valid.');

            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 3. Proses Hasil Pencairan
        try {
            $this->escrowService->completeDisbursement($externalId, $payload);

            $paymentLog->update([
                'status' => PaymentLogStatus::PROCESSED,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Disbursement webhook processed successfully',
            ]);
        } catch (Throwable $e) {
            $paymentLog->update([
                'status' => PaymentLogStatus::FAILED,
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Gagal memproses callback disbursement:', [
                'error' => $e->getMessage(),
                'external_id' => $externalId,
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
