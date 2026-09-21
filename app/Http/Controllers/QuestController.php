<?php

namespace App\Http\Controllers;

use App\Enums\QuestStatus;
use App\Http\Requests\ApproveQuestRequest;
use App\Http\Requests\StoreQuestRequest;
use App\Models\Quest;
use App\Services\Payment\EscrowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestController extends Controller
{
    public function __construct(
        protected EscrowService $escrowService
    ) {}

    /**
     * Menampilkan daftar quest yang tersedia
     */
    public function index(Request $request): Response
    {
        $tab = $request->query('tab', 'all');
        $userId = $request->user()?->id;

        $query = Quest::with(['poster:id,name,email', 'worker:id,name,email', 'depositTransaction'])
            ->latest();

        if ($tab === 'open') {
            $query->where('status', QuestStatus::OPEN);
        } elseif ($tab === 'my_created' && $userId) {
            $query->where('poster_id', $userId);
        } elseif ($tab === 'my_taken' && $userId) {
            $query->where('worker_id', $userId);
        }

        $quests = $query->paginate(12)->withQueryString();

        return Inertia::render('quests/index', [
            'quests' => $quests,
            'filters' => ['tab' => $tab],
        ]);
    }

    /**
     * Form pembuatan quest baru
     */
    public function create(): Response
    {
        return Inertia::render('quests/create', [
            'platformFeeFixed' => 5000, // Biaya platform tetap (Rp 5.000)
        ]);
    }

    /**
     * Menyimpan quest baru dan membuat invoice pembayaran deposit rekber
     */
    public function store(StoreQuestRequest $request): RedirectResponse
    {
        $platformFee = 5000.00;
        $rewardAmount = (float) $request->reward_amount;
        $totalAmount = $rewardAmount + $platformFee;

        $quest = Quest::create([
            'poster_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'reward_amount' => $rewardAmount,
            'fee_amount' => $platformFee,
            'total_amount' => $totalAmount,
            'currency' => 'IDR',
            'status' => QuestStatus::DRAFT,
        ]);

        // Inisiasi Deposit Rekber via Xendit
        $transaction = $this->escrowService->initiateQuestDeposit($quest);

        $invoiceUrl = $transaction->payment_details['invoice_url'] ?? null;

        return redirect()->route('quests.show', $quest->id)->with([
            'success' => 'Quest berhasil dibuat! Silakan selesaikan pembayaran untuk mengaktifkan Rekber.',
            'invoice_url' => $invoiceUrl,
        ]);
    }

    /**
     * Menampilkan detail quest dan status rekber
     */
    public function show(Request $request, Quest $quest): Response
    {
        $quest->load([
            'poster:id,name,email',
            'worker:id,name,email',
            'transactions' => fn ($q) => $q->latest(),
            'depositTransaction',
            'payoutTransaction',
        ]);

        return Inertia::render('quests/show', [
            'quest' => $quest,
            'authUserId' => $request->user()?->id,
            'availableBanks' => [
                ['code' => 'BCA', 'name' => 'Bank Central Asia (BCA)'],
                ['code' => 'BRI', 'name' => 'Bank Rakyat Indonesia (BRI)'],
                ['code' => 'BNI', 'name' => 'Bank Negara Indonesia (BNI)'],
                ['code' => 'MANDIRI', 'name' => 'Bank Mandiri'],
                ['code' => 'OVO', 'name' => 'OVO E-Wallet'],
                ['code' => 'DANA', 'name' => 'DANA E-Wallet'],
            ],
        ]);
    }

    /**
     * Worker mengambil quest untuk dikerjakan
     */
    public function take(Request $request, Quest $quest): RedirectResponse
    {
        $user = $request->user();

        if (! $quest->canBeTakenBy($user)) {
            return back()->with('error', 'Quest ini tidak dapat diambil.');
        }

        $quest->update([
            'worker_id' => $user->id,
            'status' => QuestStatus::IN_PROGRESS,
        ]);

        return back()->with('success', 'Selamat! Anda telah mengambil quest ini. Silakan kerjakan dan kirim hasilnya.');
    }

    /**
     * Worker mengirimkan bukti penyelesaian tugas
     */
    public function submitWork(Request $request, Quest $quest): RedirectResponse
    {
        $user = $request->user();

        if (! $quest->canBeSubmittedBy($user)) {
            return back()->with('error', 'Anda tidak memiliki akses untuk submit hasil kerja pada quest ini.');
        }

        $request->validate([
            'work_notes' => ['required', 'string', 'min:10'],
        ], [
            'work_notes.required' => 'Catatan atau tautan hasil kerja wajib diisi.',
            'work_notes.min' => 'Catatan hasil kerja minimal 10 karakter.',
        ]);

        $quest->update([
            'submitted_work_notes' => $request->work_notes,
            'submitted_at' => now(),
            'status' => QuestStatus::UNDER_REVIEW,
        ]);

        return back()->with('success', 'Hasil kerja berhasil dikirim! Menunggu review dan persetujuan dari poster.');
    }

    /**
     * Poster menyetujui hasil kerja dan merilis dana rekber ke worker
     */
    public function approve(ApproveQuestRequest $request, Quest $quest): RedirectResponse
    {
        $user = $request->user();

        if (! $quest->canBeApprovedBy($user)) {
            return back()->with('error', 'Anda tidak dapat menyetujui quest ini.');
        }

        try {
            $this->escrowService->releaseEscrow($quest, $request->validated());

            return back()->with('success', 'Pekerjaan disetujui! Pencairan dana ke worker sedang diproses oleh sistem Rekber Midtrans.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal merilis dana rekber: ' . $e->getMessage());
        }
    }

    /**
     * Poster membatalkan quest dan me-refund dana rekber (jika belum ada worker)
     */
    public function cancel(Request $request, Quest $quest): RedirectResponse
    {
        $user = $request->user();

        if ($quest->poster_id !== $user->id) {
            return back()->with('error', 'Hanya poster yang dapat membatalkan quest ini.');
        }

        if ($quest->status === QuestStatus::OPEN) {
            try {
                $this->escrowService->refundEscrow($quest, $request->input('reason', 'Dibatalkan oleh poster'));

                return back()->with('success', 'Quest dibatalkan dan dana rekber telah dikembalikan.');
            } catch (\Throwable $e) {
                return back()->with('error', 'Gagal membatalkan quest: ' . $e->getMessage());
            }
        } elseif ($quest->status === QuestStatus::DRAFT || $quest->status === QuestStatus::PENDING_PAYMENT) {
            $quest->update(['status' => QuestStatus::CANCELLED]);

            return back()->with('success', 'Quest berhasil dibatalkan.');
        }

        return back()->with('error', 'Quest yang sedang dikerjakan atau sudah selesai tidak dapat langsung dibatalkan.');
    }

    /**
     * Mengajukan sengketa jika terjadi konflik antara poster dan worker
     */
    public function dispute(Request $request, Quest $quest): RedirectResponse
    {
        $user = $request->user();

        if ($quest->poster_id !== $user->id && $quest->worker_id !== $user->id) {
            return back()->with('error', 'Anda tidak terlibat dalam transaksi quest ini.');
        }

        $request->validate([
            'dispute_reason' => ['required', 'string', 'min:15'],
        ], [
            'dispute_reason.required' => 'Alasan sengketa wajib diisi.',
            'dispute_reason.min' => 'Alasan sengketa minimal 15 karakter.',
        ]);

        $quest->update([
            'status' => QuestStatus::DISPUTED,
            'dispute_reason' => $request->dispute_reason,
        ]);

        return back()->with('warning', 'Sengketa telah diajukan. Tim rekber akan menengahi penyelesaian dana transaksi.');
    }
}
