<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsFinance;
use App\Models\Pms\PmsProject;
use App\Models\ProjectOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PmsFinanceController extends Controller
{
    /**
     * Display executive finances overview.
     */
    public function index(Request $request): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Catatan keuangan dan budget hanya dapat diakses oleh Administrator.');
        }

        $projectId = $request->input('project_id');
        $type = $request->input('type');

        $projects = PmsProject::with(['projectOrder', 'finances'])
            ->select('id', 'name', 'code', 'client', 'budget', 'status', 'project_order_id', 'created_by')
            ->latest()
            ->get();

        // Ensure any linked ProjectOrder with verified DP/Final payments syncs automatically into project income
        $syncedAny = false;
        foreach ($projects as $p) {
            if ($p->projectOrder && $p->finances->where('type', 'income')->isEmpty()) {
                $p->syncOrderPaymentsToFinances($request->user()?->id);
                $syncedAny = true;
            }
        }
        if ($syncedAny) {
            $projects->load('finances');
        }

        $financesQuery = PmsFinance::with(['project', 'creator'])
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->latest('transaction_date')
            ->latest('id');

        $finances = $financesQuery->paginate(20)->withQueryString();

        // Calculations
        $totalIncome = (float) PmsFinance::where('type', 'income')->sum('amount');
        $totalProjectExpenses = (float) PmsFinance::where('type', 'project_expense')->sum('amount');
        $totalGeneralExpenses = (float) PmsFinance::where('type', 'general_expense')->sum('amount');
        $totalExpenses = $totalProjectExpenses + $totalGeneralExpenses;
        $netMargin = $totalIncome - $totalExpenses;
        $totalProjectBudgets = (float) PmsProject::sum('budget');

        // Project Breakdown (automatically displays all PMS projects with budgets & real-time realization)
        $projectFinancials = $projects->map(function (PmsProject $p) {
            $income = (float) $p->finances->where('type', 'income')->sum('amount');
            $expense = (float) $p->finances->where('type', 'project_expense')->sum('amount');
            $budget = (float) $p->budget;
            $remaining = max(0, $budget - $expense);
            $burnRate = $budget > 0 ? round(($expense / $budget) * 100, 1) : 0;

            return [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'client' => $p->client,
                'budget' => $budget,
                'income' => $income,
                'expense' => $expense,
                'remaining' => $remaining,
                'burn_rate' => $burnRate,
                'status' => $p->status,
                'transactions_count' => $p->finances->count(),
                'order_tracking_code' => $p->projectOrder?->tracking_code,
            ];
        });

        // Verified/Active client orders not yet bridged to PMS projects
        $unimportedOrders = ProjectOrder::whereDoesntHave('pmsProject')
            ->where(function ($q) {
                $q->whereIn('status', ['in_progress', 'in_review', 'completed'])
                    ->orWhereNotNull('dp_paid_at')
                    ->orWhereNotNull('final_paid_at');
            })
            ->select('id', 'tracking_code', 'client_name', 'project_type', 'total_amount', 'payment_stage', 'status')
            ->latest()
            ->get();

        return Inertia::render('studio/pms/finances/index', [
            'finances' => $finances,
            'projects' => $projects,
            'projectFinancials' => $projectFinancials,
            'unimportedOrders' => $unimportedOrders,
            'summary' => [
                'total_income' => $totalIncome,
                'total_project_expenses' => $totalProjectExpenses,
                'total_general_expenses' => $totalGeneralExpenses,
                'total_expenses' => $totalExpenses,
                'net_margin' => $netMargin,
                'total_budgets' => $totalProjectBudgets,
            ],
            'filters' => [
                'project_id' => $projectId ? (int) $projectId : null,
                'type' => $type,
            ],
        ]);
    }

    /**
     * Store new financial transaction.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mencatat transaksi keuangan.');
        }

        $validated = $request->validate([
            'project_id' => ['nullable', 'exists:pms_projects,id'],
            'type' => ['required', 'string', 'in:income,project_expense,general_expense'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0'],
            'transaction_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'receipt' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf,webp', 'max:5120'],
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $disk = config('filesystems.default');
            $receiptPath = $request->file('receipt')->store('pms_receipts', $disk);
        }

        $finance = PmsFinance::create([
            'project_id' => $validated['type'] === 'general_expense' ? null : ($validated['project_id'] ?? null),
            'type' => $validated['type'],
            'title' => $validated['title'],
            'category' => $validated['category'] ?? null,
            'amount' => $validated['amount'],
            'transaction_date' => $validated['transaction_date'],
            'notes' => $validated['notes'] ?? null,
            'receipt_file' => $receiptPath,
            'created_by' => auth()->id(),
        ]);

        PmsActivityLog::log(
            action: 'created',
            entityType: 'finance',
            description: "Mencatat transaksi keuangan: {$finance->title} (Rp " . number_format($finance->amount, 0, ',', '.') . ")",
            projectId: $finance->project_id
        );

        return back()->with('success', 'Transaksi keuangan berhasil dicatat.');
    }

    /**
     * Delete financial transaction.
     */
    public function destroy(Request $request, PmsFinance $finance): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menghapus transaksi keuangan.');
        }

        $title = $finance->title;
        $projectId = $finance->project_id;
        $disk = config('filesystems.default');

        if ($finance->receipt_file && !str_starts_with($finance->receipt_file, '/') && !str_starts_with($finance->receipt_file, 'http') && Storage::disk($disk)->exists($finance->receipt_file)) {
            Storage::disk($disk)->delete($finance->receipt_file);
        }

        $finance->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'finance',
            description: "Menghapus transaksi keuangan: {$title}",
            projectId: $projectId
        );

        return back()->with('success', 'Transaksi keuangan berhasil dihapus.');
    }
}
