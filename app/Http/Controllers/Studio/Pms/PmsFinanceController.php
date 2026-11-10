<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsFinance;
use App\Models\Pms\PmsProject;
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

        $projects = PmsProject::select('id', 'name', 'code', 'budget', 'status')->latest()->get();

        $financesQuery = PmsFinance::with(['project', 'creator'])
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->latest('transaction_date');

        $finances = $financesQuery->paginate(20)->withQueryString();

        // Calculations
        $totalIncome = (float) PmsFinance::where('type', 'income')->sum('amount');
        $totalProjectExpenses = (float) PmsFinance::where('type', 'project_expense')->sum('amount');
        $totalGeneralExpenses = (float) PmsFinance::where('type', 'general_expense')->sum('amount');
        $totalExpenses = $totalProjectExpenses + $totalGeneralExpenses;
        $netMargin = $totalIncome - $totalExpenses;
        $totalProjectBudgets = (float) PmsProject::sum('budget');

        // Project Breakdown
        $projectFinancials = $projects->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'budget' => (float) $p->budget,
                'income' => $p->total_income,
                'expense' => $p->total_expense,
                'remaining' => $p->remaining_budget,
                'burn_rate' => $p->budget_burn_rate,
                'status' => $p->status,
            ];
        });

        return Inertia::render('studio/pms/finances/index', [
            'finances' => $finances,
            'projects' => $projects,
            'projectFinancials' => $projectFinancials,
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
            $receiptPath = $request->file('receipt')->store('pms_receipts', 'public');
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

        if ($finance->receipt_file) {
            Storage::disk('public')->delete($finance->receipt_file);
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
