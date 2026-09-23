<?php

namespace App\Http\Controllers;

use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\ProjectOrder;
use App\Models\Quest;
use App\Models\ServiceAddon;
use App\Models\ServicePackage;
use App\Models\ServiceSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Payment\EscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectOrderController extends Controller
{
    public function __construct(
        protected EscrowService $escrowService
    ) {}

    /**
     * Menampilkan halaman kalkulator biaya website & pemesanan
     */
    public function calculator(): Response
    {
        $packages = ServicePackage::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        $addons = ServiceAddon::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        $settings = ServiceSetting::all()->pluck('value', 'key')->toArray();

        if (empty($settings['default_dp_percentage'])) {
            $settings['default_dp_percentage'] = '50';
        }

        return Inertia::render('services-calculator', [
            'initialPackages' => $packages,
            'initialAddons' => $addons,
            'initialSettings' => $settings,
        ]);
    }

    /**
     * Menyimpan pesanan jasa pembuatan website dari kalkulator interaktif dengan DP
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => ['required', 'string', 'max:100'],
            'client_email' => ['required', 'email', 'max:100'],
            'client_phone' => ['nullable', 'string', 'max:30'],
            'project_type' => ['required', 'string'],
            'selected_features' => ['nullable', 'array'],
            'delivery_speed' => ['required', 'string', 'in:standard,express'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'total_amount' => ['required', 'numeric', 'min:10000'],
            'payment_scheme' => ['nullable', 'string', 'in:down_payment,full_payment'],
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Dapatkan atau buat akun klien (Poster)
            $clientUser = User::firstOrCreate(
                ['email' => strtolower($validated['client_email'])],
                [
                    'name' => $validated['client_name'],
                    'password' => bcrypt(Str::random(24)),
                ]
            );

            // 2. Dapatkan akun Ridhwan Anang (Developer / Worker)
            $developerUser = User::where('email', 'ridhwananang@gmail.com')->first()
                ?? User::where('email', 'test@example.com')->first()
                ?? User::first();

            if (! $developerUser) {
                $developerUser = User::create([
                    'name' => "Ridhwan Anang Ma'ruf",
                    'email' => 'ridhwananang@gmail.com',
                    'password' => bcrypt(Str::random(24)),
                ]);
            }

            $totalAmount = (float) $validated['total_amount'];
            $paymentScheme = $validated['payment_scheme'] ?? 'down_payment';

            // Hitung DP berdasarkan setting admin
            $defaultDpPct = (float) ServiceSetting::getVal('default_dp_percentage', '50');
            if ($paymentScheme === 'down_payment') {
                $dpPercentage = $defaultDpPct > 0 ? $defaultDpPct : 50.00;
                $dpAmount = round(($totalAmount * $dpPercentage) / 100);
                $remainingAmount = $totalAmount - $dpAmount;
            } else {
                $dpPercentage = 100.00;
                $dpAmount = $totalAmount;
                $remainingAmount = 0.00;
            }

            $projectTypeName = ucwords(str_replace('_', ' ', $validated['project_type']));

            // 3. Buat Quest Rekber
            $quest = Quest::create([
                'poster_id' => $clientUser->id,
                'worker_id' => $developerUser->id,
                'title' => "Jasa Pembuatan Website: {$projectTypeName} ({$validated['client_name']})",
                'description' => $validated['notes'] ?? "Pesanan pembuatan website {$projectTypeName} oleh {$validated['client_name']}.",
                'reward_amount' => $totalAmount,
                'fee_amount' => 0.00,
                'total_amount' => $totalAmount,
                'currency' => 'IDR',
                'status' => QuestStatus::DRAFT,
            ]);

            // 4. Buat Project Order dengan pembagian DP
            $order = ProjectOrder::create([
                'client_name' => $validated['client_name'],
                'client_email' => $validated['client_email'],
                'client_phone' => $validated['client_phone'],
                'project_type' => $validated['project_type'],
                'selected_features' => $validated['selected_features'] ?? [],
                'delivery_speed' => $validated['delivery_speed'],
                'notes' => $validated['notes'],
                'total_amount' => $totalAmount,
                'currency' => 'IDR',
                'payment_scheme' => $paymentScheme,
                'dp_percentage' => $dpPercentage,
                'dp_amount' => $dpAmount,
                'remaining_amount' => $remainingAmount,
                'payment_stage' => 'awaiting_dp',
                'status' => 'pending_payment',
                'quest_id' => $quest->id,
            ]);

            // 5. Inisiasi Transaksi Tagihan DP via Midtrans
            $transaction = $this->escrowService->initiateProjectDpDeposit($order);
            $invoiceUrl = $transaction->payment_details['invoice_url'] ?? null;
            $snapToken = $transaction->payment_details['token'] ?? null;

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat! Mengalihkan ke pembayaran DP aman (escrow)...',
                'tracking_code' => $order->tracking_code,
                'invoice_url' => $invoiceUrl,
                'snap_token' => $snapToken,
                'dp_amount' => $dpAmount,
                'remaining_amount' => $remainingAmount,
                'redirect_url' => route('project.tracker', $order->tracking_code),
            ], 201);
        });
    }

    /**
     * Menampilkan halaman live client project tracker
     */
    public function track(string $tracking_code): Response
    {
        $order = ProjectOrder::with([
            'quest.poster:id,name,email',
            'quest.worker:id,name,email',
            'quest.depositTransaction',
            'quest.dpDepositTransaction',
            'quest.finalDepositTransaction',
            'quest.payoutTransaction',
            'dpTransaction',
            'finalTransaction',
        ])
        ->where('tracking_code', $tracking_code)
        ->firstOrFail();

        $needsSave = false;

        // 0. Auto-healing / Sinkronisasi status pembayaran dari database & Midtrans Core API
        $dpTx = $order->dpTransaction ?? $order->quest?->dpDepositTransaction ?? $order->quest?->depositTransaction;

        // Jika status transaksi di database masih pending, periksa status terkini ke Midtrans API
        if (!$order->isDpPaid() && $dpTx && $dpTx->status === TransactionStatus::PENDING && !empty($dpTx->xendit_external_id)) {
            try {
                /** @var \App\Services\Payment\Midtrans\MidtransClient $midtransClient */
                $midtransClient = app(\App\Services\Payment\Midtrans\MidtransClient::class);
                $statusResp = $midtransClient->getTransactionStatus($dpTx->xendit_external_id);
                $txStatus = strtolower($statusResp['transaction_status'] ?? '');
                if (in_array($txStatus, ['settlement', 'capture'])) {
                    $this->escrowService->holdEscrow($dpTx->xendit_external_id, [
                        'id' => $statusResp['transaction_id'] ?? null,
                        'order_id' => $dpTx->xendit_external_id,
                        'transaction_status' => $txStatus,
                        'gross_amount' => $statusResp['gross_amount'] ?? (string) $dpTx->amount,
                        'payment_type' => $statusResp['payment_type'] ?? 'qris',
                        'payment_channel' => $statusResp['payment_type'] ?? 'qris',
                    ]);
                    $order->refresh();
                    $dpTx = $order->dpTransaction;
                }
            } catch (\Throwable $e) {
                // Silently continue if API is unreachable
            }
        }

        // Jika transaksi DP berstatus HELD / RELEASED, pastikan order dan milestone konsisten
        if ($dpTx && in_array($dpTx->status, [TransactionStatus::HELD, TransactionStatus::RELEASED])) {
            if (!in_array($order->payment_stage, ['dp_paid', 'awaiting_final', 'fully_paid']) || empty($order->dp_paid_at)) {
                $order->payment_stage = 'dp_paid';
                $order->dp_paid_at = $order->dp_paid_at ?? ($dpTx->paid_at ?? now());
                $order->dp_transaction_id = $dpTx->id;
                if (in_array($order->status, ['pending_payment', 'awaiting_dp'])) {
                    $order->status = 'in_progress';
                }
                $needsSave = true;
            }
        }

        // Cek transaksi final jika ada
        $finalTx = $order->finalTransaction ?? $order->quest?->finalDepositTransaction;
        if (!$order->isFullyPaid() && $finalTx && $finalTx->status === TransactionStatus::PENDING && !empty($finalTx->xendit_external_id)) {
            try {
                /** @var \App\Services\Payment\Midtrans\MidtransClient $midtransClient */
                $midtransClient = app(\App\Services\Payment\Midtrans\MidtransClient::class);
                $statusResp = $midtransClient->getTransactionStatus($finalTx->xendit_external_id);
                $txStatus = strtolower($statusResp['transaction_status'] ?? '');
                if (in_array($txStatus, ['settlement', 'capture'])) {
                    $this->escrowService->holdEscrow($finalTx->xendit_external_id, [
                        'id' => $statusResp['transaction_id'] ?? null,
                        'order_id' => $finalTx->xendit_external_id,
                        'transaction_status' => $txStatus,
                        'gross_amount' => $statusResp['gross_amount'] ?? (string) $finalTx->amount,
                        'payment_type' => $statusResp['payment_type'] ?? 'qris',
                        'payment_channel' => $statusResp['payment_type'] ?? 'qris',
                    ]);
                    $order->refresh();
                    $finalTx = $order->finalTransaction;
                }
            } catch (\Throwable $e) {
                // Silently continue
            }
        }

        if ($finalTx && in_array($finalTx->status, [TransactionStatus::HELD, TransactionStatus::RELEASED])) {
            if ($order->payment_stage !== 'fully_paid' || empty($order->final_paid_at)) {
                $order->payment_stage = 'fully_paid';
                $order->final_paid_at = $order->final_paid_at ?? ($finalTx->paid_at ?? now());
                $order->final_transaction_id = $finalTx->id;
                $order->status = 'completed';
                $needsSave = true;
            }
        }

        // 1. Sinkronisasi & Auto-kalkulasi DP jika order lama belum memiliki dp_amount
        if ((float) $order->dp_amount <= 0 && (float) $order->total_amount > 0) {
            $dpPct = (float) ($order->dp_percentage > 0 ? $order->dp_percentage : 50.00);
            if ($order->payment_scheme === 'down_payment' || empty($order->payment_scheme)) {
                $order->payment_scheme = 'down_payment';
                $order->dp_percentage = $dpPct;
                $order->dp_amount = round(((float) $order->total_amount * $dpPct) / 100);
                $order->remaining_amount = (float) $order->total_amount - (float) $order->dp_amount;
            } else {
                $order->dp_amount = (float) $order->total_amount;
                $order->remaining_amount = 0.00;
            }
            $needsSave = true;
        }

        // 2. Normalisasi payment stage bila proyek telah rampung
        if ($order->status === 'completed' && $order->payment_stage !== 'fully_paid') {
            $order->payment_stage = 'fully_paid';
            $needsSave = true;
        }

        // 3. Normalisasi status milestone agar selaras dengan status pembayaran riil
        if (empty($order->milestone_progress)) {
            $order->milestone_progress = ProjectOrder::getDefaultMilestones($order->status);
            $needsSave = true;
        } else {
            $milestones = $order->milestone_progress;
            $updated = false;
            foreach ($milestones as &$m) {
                if ($m['id'] === 'deposit') {
                    if (!$order->isDpPaid() && $m['status'] === 'completed') {
                        $m['status'] = 'pending';
                        $m['updated_at'] = null;
                        $updated = true;
                    } elseif ($order->isDpPaid() && $m['status'] !== 'completed') {
                        $m['status'] = 'completed';
                        $m['updated_at'] = $order->dp_paid_at ? $order->dp_paid_at->toIso8601String() : now()->toIso8601String();
                        $updated = true;
                    }
                }
            }
            if ($updated) {
                $order->milestone_progress = $milestones;
                $needsSave = true;
            }
        }

        // 4. Pastikan transaksi DP Midtrans aktif dan nominalnya sesuai jika belum lunas
        if (!$order->isDpPaid() && $order->payment_scheme === 'down_payment' && (float) $order->dp_amount > 0) {
            if (!$order->dp_transaction_id) {
                try {
                    $dpTx = $this->escrowService->initiateProjectDpDeposit($order);
                    $order->dp_transaction_id = $dpTx->id;
                    $needsSave = true;
                } catch (\Throwable $e) {
                    // Fail gracefully
                }
            }
        }

        if ($needsSave) {
            $order->save();
            $order->load(['dpTransaction', 'finalTransaction']);
        }

        // Mask kredensial sensitif bila belum lunas sepenuhnya
        if ($order->status !== 'completed' && ! empty($order->handover_data)) {
            $handover = $order->handover_data;
            if (! empty($handover['admin_password'])) {
                $handover['admin_password'] = '•••••••• (Terkunci sampai pelunasan akhir lunas)';
            }
            if (! empty($handover['repo_url'])) {
                $handover['repo_url'] = '(Terkunci sampai pelunasan akhir lunas)';
            }
            $order->handover_data = $handover;
        }

        return Inertia::render('project-tracker', [
            'order' => $order,
        ]);
    }

    /**
     * Menerbitkan tagihan pelunasan akhir ketika kesepakatan akhir tercapai
     */
    public function requestSettlement(string $tracking_code): JsonResponse
    {
        $order = ProjectOrder::with('quest')->where('tracking_code', $tracking_code)->firstOrFail();

        if (! $order->isDpPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran DP belum terverifikasi.',
            ], 422);
        }

        if ($order->isFullyPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah lunas.',
            ], 422);
        }

        try {
            $transaction = $this->escrowService->initiateProjectFinalDeposit($order);
            $invoiceUrl = $transaction->payment_details['invoice_url'] ?? null;
            $token = $transaction->payment_details['token'] ?? null;

            return response()->json([
                'success' => true,
                'message' => 'Tagihan pelunasan akhir berhasil diterbitkan.',
                'invoice_url' => $invoiceUrl,
                'token' => $token,
                'amount' => (float) $order->remaining_amount,
                'remaining_amount' => (float) $order->remaining_amount,
                'tracking_code' => $order->tracking_code,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tagihan pelunasan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Klien menyetujui hasil pengerjaan website & merilis dana rekber ke Ridhwan
     */
    public function approve(Request $request, string $tracking_code): RedirectResponse
    {
        $order = ProjectOrder::with('quest')->where('tracking_code', $tracking_code)->firstOrFail();
        $quest = $order->quest;

        if ($order->remaining_amount > 0 && ! $order->isFullyPaid()) {
            return back()->with('error', 'Silakan selesaikan pembayaran pelunasan sisa terlebih dahulu sebelum menyetujui serah terima final.');
        }

        try {
            // Rilis dana rekber ke rekening Ridhwan Anang
            $this->escrowService->releaseEscrow($quest, [
                'bank_code' => 'BCA',
                'account_number' => '1234567890',
                'account_holder_name' => "Ridhwan Anang Ma'ruf",
                'description' => "Pencairan Jasa Pembuatan Website {$order->tracking_code}",
            ]);

            $milestones = $order->milestone_progress ?? ProjectOrder::getDefaultMilestones();
            foreach ($milestones as &$m) {
                $m['status'] = 'completed';
                if (empty($m['updated_at'])) {
                    $m['updated_at'] = now()->toIso8601String();
                }
            }

            $order->update([
                'status' => 'completed',
                'milestone_progress' => $milestones,
            ]);

            return back()->with('success', 'Selamat! Website telah Anda setujui dan dana rekber telah dicairkan ke Ridhwan Anang.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memproses persetujuan: ' . $e->getMessage());
        }
    }

    /**
     * Klien mengirim catatan revisi untuk perbaikan website
     */
    public function submitRevision(Request $request, string $tracking_code): RedirectResponse
    {
        $validated = $request->validate([
            'revision_text' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $order = ProjectOrder::where('tracking_code', $tracking_code)->firstOrFail();

        $revisions = $order->revision_notes ?? [];
        $revisions[] = [
            'id' => Str::uuid()->toString(),
            'text' => $validated['revision_text'],
            'created_at' => now()->toIso8601String(),
            'status' => 'pending',
        ];

        // Ensure development/staging milestone reflects rework
        $milestones = $order->milestone_progress ?? ProjectOrder::getDefaultMilestones();
        foreach ($milestones as &$m) {
            if ($m['id'] === 'staging' || $m['id'] === 'handover') {
                $m['status'] = 'pending';
            } elseif ($m['id'] === 'development') {
                $m['status'] = 'in_progress';
                $m['updated_at'] = now()->toIso8601String();
            }
        }

        $order->update([
            'revision_notes' => $revisions,
            'status' => 'in_progress',
            'milestone_progress' => $milestones,
        ]);

        if ($order->quest) {
            $order->quest->update([
                'status' => QuestStatus::IN_PROGRESS,
            ]);
        }

        return back()->with('success', 'Catatan revisi Anda telah berhasil dikirim ke Ridhwan Anang. Kami akan segera melakukan penyesuaian!');
    }

    /**
     * Ridhwan memperbarui link staging demo untuk direview klien
     */
    public function updateStaging(Request $request, string $tracking_code): RedirectResponse
    {
        $request->validate([
            'staging_url' => ['required', 'url'],
        ]);

        $order = ProjectOrder::with('quest')->where('tracking_code', $tracking_code)->firstOrFail();

        $milestones = $order->milestone_progress ?? ProjectOrder::getDefaultMilestones();
        foreach ($milestones as &$m) {
            if ($m['id'] === 'deposit' || $m['id'] === 'design' || $m['id'] === 'development') {
                $m['status'] = 'completed';
                if (empty($m['updated_at'])) {
                    $m['updated_at'] = now()->toIso8601String();
                }
            } elseif ($m['id'] === 'staging') {
                $m['status'] = 'completed';
                $m['updated_at'] = now()->toIso8601String();
            }
        }

        $order->update([
            'staging_url' => $request->staging_url,
            'status' => 'in_review',
            'milestone_progress' => $milestones,
        ]);

        $order->quest->update([
            'status' => QuestStatus::UNDER_REVIEW,
            'submitted_work_notes' => "Preview website siap diuji coba di: " . $request->staging_url,
            'submitted_at' => now(),
        ]);

        return back()->with('success', 'Link preview staging website berhasil diperbarui.');
    }
}
