<?php

namespace App\Http\Controllers\Admin;

use App\Enums\QuestStatus;
use App\Enums\TransactionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProjectOrderRequest;
use App\Models\ProjectOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ProjectOrder::query()
            ->with([
                'quest.depositTransaction',
                'quest.dpDepositTransaction',
                'quest.finalDepositTransaction',
                'quest.payoutTransaction',
                'quest.poster:id,name,email',
                'dpTransaction',
                'finalTransaction',
            ])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%")
                    ->orWhere('client_email', 'like', "%{$search}%")
                    ->orWhere('project_type', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(15)->withQueryString();

        // Ensure default milestones are present if null & auto-sync payment stage from held transactions
        $orders->getCollection()->transform(function ($order) {
            $dpTx = $order->dpTransaction ?? $order->quest?->dpDepositTransaction ?? $order->quest?->depositTransaction;
            if ($dpTx && in_array($dpTx->status, [TransactionStatus::HELD, TransactionStatus::RELEASED])) {
                if (!in_array($order->payment_stage, ['dp_paid', 'awaiting_final', 'fully_paid']) || empty($order->dp_paid_at)) {
                    $order->update([
                        'payment_stage' => 'dp_paid',
                        'dp_paid_at' => $order->dp_paid_at ?? ($dpTx->paid_at ?? now()),
                        'dp_transaction_id' => $dpTx->id,
                        'status' => in_array($order->status, ['pending_payment', 'awaiting_dp']) ? 'in_progress' : ($order->status ?: 'in_progress'),
                    ]);
                }
            }
            if (empty($order->milestone_progress)) {
                $order->milestone_progress = ProjectOrder::getDefaultMilestones($order->status);
            }
            return $order;
        });

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function update(UpdateProjectOrderRequest $request, ProjectOrder $order): RedirectResponse
    {
        $validated = $request->validated();

        // Calculate DP and remaining amounts if admin customized dp_percentage
        if (isset($validated['dp_percentage']) && is_numeric($validated['dp_percentage'])) {
            $total = (float) $order->total_amount;
            $dpPct = (float) $validated['dp_percentage'];
            $dpAmount = round(($total * $dpPct) / 100);
            $remaining = $total - $dpAmount;

            $validated['dp_amount'] = $dpAmount;
            $validated['remaining_amount'] = $remaining;

            // Sync deposit transaction amount if DP has not been paid yet
            if (!$order->isDpPaid()) {
                $depositTx = $order->dpTransaction ?? $order->quest?->dpDepositTransaction ?? $order->quest?->depositTransaction;
                if ($depositTx && ! in_array($depositTx->status, ['held', 'completed'])) {
                    $depositTx->update(['amount' => $dpAmount]);
                }
            }
        }

        // Jangan pernah reset status payment_stage ke awaiting_dp jika DP sudah dibayar/held
        if ($order->isDpPaid() && isset($validated['payment_stage']) && in_array($validated['payment_stage'], ['awaiting_dp', 'dp_unpaid'])) {
            unset($validated['payment_stage']);
        }

        // Jika DP telah terbayar, pastikan milestone deposit selalu berstatus completed
        if ($order->isDpPaid() && !empty($validated['milestone_progress'])) {
            foreach ($validated['milestone_progress'] as &$m) {
                if ($m['id'] === 'deposit') {
                    $m['status'] = 'completed';
                    if (empty($m['updated_at'])) {
                        $m['updated_at'] = ($order->dp_paid_at ?? now())->toIso8601String();
                    }
                }
            }
        }

        $order->update($validated);

        // Sync with underlying Quest status if quest exists
        if ($order->quest) {
            $questStatus = match ($validated['status']) {
                'in_progress' => QuestStatus::IN_PROGRESS,
                'in_review' => QuestStatus::UNDER_REVIEW,
                'completed' => QuestStatus::COMPLETED,
                'cancelled' => QuestStatus::CANCELLED,
                default => null,
            };

            if ($questStatus) {
                $questUpdate = ['status' => $questStatus];
                if (!empty($validated['staging_url']) && $questStatus === QuestStatus::UNDER_REVIEW) {
                    $questUpdate['submitted_work_notes'] = "Preview staging: " . $validated['staging_url'];
                    $questUpdate['submitted_at'] = now();
                }
                $order->quest->update($questUpdate);
            }
        }

        return back()->with('success', 'Pesanan proyek berhasil diperbarui.');
    }
}
