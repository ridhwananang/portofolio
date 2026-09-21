<?php

namespace App\Http\Controllers;

use App\Enums\QuestStatus;
use App\Models\ProjectOrder;
use App\Models\Quest;
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
        return Inertia::render('services-calculator');
    }

    /**
     * Menyimpan pesanan jasa pembuatan website dari kalkulator interaktif
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

            // 4. Buat Project Order
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
                'status' => 'pending_payment',
                'quest_id' => $quest->id,
            ]);

            // 5. Inisiasi Deposit Rekber via Midtrans
            $transaction = $this->escrowService->initiateQuestDeposit($quest);
            $invoiceUrl = $transaction->payment_details['invoice_url'] ?? null;

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat! Mengalihkan ke pembayaran rekber Midtrans...',
                'tracking_code' => $order->tracking_code,
                'invoice_url' => $invoiceUrl,
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
            'quest.payoutTransaction',
        ])
        ->where('tracking_code', $tracking_code)
        ->firstOrFail();

        return Inertia::render('project-tracker', [
            'order' => $order,
        ]);
    }

    /**
     * Klien menyetujui hasil pengerjaan website & merilis dana rekber ke Ridhwan
     */
    public function approve(string $tracking_code): RedirectResponse
    {
        $order = ProjectOrder::with('quest')->where('tracking_code', $tracking_code)->firstOrFail();
        $quest = $order->quest;

        try {
            // Rilis dana rekber ke rekening Ridhwan Anang
            $this->escrowService->releaseEscrow($quest, [
                'bank_code' => 'BCA',
                'account_number' => '1234567890',
                'account_holder_name' => "Ridhwan Anang Ma'ruf",
                'description' => "Pencairan Jasa Pembuatan Website {$order->tracking_code}",
            ]);

            $order->update(['status' => 'completed']);

            return back()->with('success', 'Selamat! Website telah Anda setujui dan dana rekber telah dicairkan ke Ridhwan Anang.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memproses persetujuan: ' . $e->getMessage());
        }
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

        $order->update([
            'staging_url' => $request->staging_url,
            'status' => 'in_review',
        ]);

        $order->quest->update([
            'status' => QuestStatus::UNDER_REVIEW,
            'submitted_work_notes' => "Preview website siap diuji coba di: " . $request->staging_url,
            'submitted_at' => now(),
        ]);

        return back()->with('success', 'Link preview staging website berhasil diperbarui.');
    }
}
