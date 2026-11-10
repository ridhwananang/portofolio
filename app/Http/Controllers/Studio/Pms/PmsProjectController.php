<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsProjectDetail;
use App\Models\Pms\PmsProjectMember;
use App\Models\Pms\PmsSprint;
use App\Models\ProjectOrder;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PmsProjectController extends Controller
{
    /**
     * Display listing of managed projects.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');

        $projectsQuery = PmsProject::query()
            ->with(['creator', 'members.user', 'tasks', 'sprints'])
            ->when(! $isAdmin && $user, function ($query) use ($user) {
                $query->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                        ->orWhere('code', 'ilike', "%{$search}%")
                        ->orWhere('client', 'ilike', "%{$search}%");
                });
            })
            ->when($status, fn ($query, $status) => $query->where('status', $status))
            ->when($priority, fn ($query, $priority) => $query->where('priority', $priority))
            ->latest();

        $projects = $projectsQuery->paginate(12)->withQueryString();

        $availableUsers = $isAdmin ? User::where('status', 'active')
            ->select('id', 'name', 'email', 'avatar', 'role_title')
            ->orderBy('name')
            ->get() : [];

        $eligibleOrders = $isAdmin ? ProjectOrder::whereDoesntHave('pmsProject')
            ->whereIn('status', ['in_progress', 'completed', 'in_review'])
            ->select('id', 'tracking_code', 'client_name', 'project_type', 'total_amount', 'status')
            ->latest()
            ->get() : [];

        return Inertia::render('studio/pms/projects/index', [
            'is_admin' => $isAdmin,
            'can_create_project' => $isAdmin,
            'projects' => $projects,
            'availableUsers' => $availableUsers,
            'eligibleOrders' => $eligibleOrders,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'priority' => $priority,
            ],
        ]);
    }

    /**
     * Show form to create a new PMS project (Comprehensive Dedicated Page).
     */
    public function create(Request $request): Response
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menginisialisasi proyek baru.');
        }

        $availableUsers = User::where('status', 'active')
            ->select('id', 'name', 'email', 'avatar', 'role_title')
            ->orderBy('name')
            ->get();

        $eligibleOrders = ProjectOrder::whereDoesntHave('pmsProject')
            ->whereIn('status', ['in_progress', 'completed', 'in_review'])
            ->select('id', 'tracking_code', 'client_name', 'project_type', 'total_amount', 'status', 'selected_features', 'client_brief', 'staging_url')
            ->latest()
            ->get();

        $latestId = (PmsProject::max('id') ?? 0) + 1;
        $proposedCode = 'PRJ-' . date('Y') . '-' . str_pad((string) $latestId, 3, '0', STR_PAD_LEFT);

        return Inertia::render('studio/pms/projects/create', [
            'availableUsers' => $availableUsers,
            'eligibleOrders' => $eligibleOrders,
            'proposedCode' => $proposedCode,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menginisialisasi proyek baru.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:pms_projects,code'],
            'client' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:planning,in_progress,review,completed,on_hold'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'project_order_id' => ['nullable', 'exists:project_orders,id'],

            // Blueprint Detail
            'background' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'scope' => ['nullable', 'string'],
            'tech_stack' => ['nullable', 'array'],
            'deliverables' => ['nullable', 'string'],
            'repository_url' => ['nullable', 'url'],
            'live_demo_url' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],

            // Initial Team Allocation
            'members' => ['nullable', 'array'],
            'members.*.user_id' => ['required_with:members', 'exists:users,id'],
            'members.*.role_in_project' => ['nullable', 'string', 'max:100'],
            'members.*.hours_per_week' => ['nullable', 'numeric', 'min:1'],

            // Initial Sprint
            'create_initial_sprint' => ['nullable', 'boolean'],
            'initial_sprint_name' => ['nullable', 'string', 'max:255'],
            'initial_sprint_goal' => ['nullable', 'string'],
            'initial_sprint_start_date' => ['nullable', 'date'],
            'initial_sprint_end_date' => ['nullable', 'date'],
        ]);

        $project = PmsProject::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'client' => $validated['client'],
            'description' => $validated['description'] ?? null,
            'budget' => $validated['budget'] ?? 0,
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'project_order_id' => $validated['project_order_id'] ?? null,
            'created_by' => auth()->id(),
        ]);

        PmsProjectDetail::create([
            'project_id' => $project->id,
            'background' => $validated['background'] ?? null,
            'objective' => $validated['objective'] ?? null,
            'scope' => $validated['scope'] ?? null,
            'tech_stack' => $validated['tech_stack'] ?? [],
            'deliverables' => $validated['deliverables'] ?? null,
            'repository_url' => $validated['repository_url'] ?? null,
            'live_demo_url' => $validated['live_demo_url'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Assign initial team members if provided
        if (! empty($validated['members']) && is_array($validated['members'])) {
            foreach ($validated['members'] as $m) {
                if (! empty($m['user_id'])) {
                    PmsProjectMember::create([
                        'project_id' => $project->id,
                        'user_id' => $m['user_id'],
                        'role_in_project' => $m['role_in_project'] ?? 'Team Member',
                        'hours_per_week' => $m['hours_per_week'] ?? 40,
                        'joined_at' => now()->toDateString(),
                    ]);
                }
            }
        }

        // Create initial sprint if toggled
        if (! empty($validated['create_initial_sprint']) && ! empty($validated['initial_sprint_name'])) {
            PmsSprint::create([
                'project_id' => $project->id,
                'name' => $validated['initial_sprint_name'],
                'goal' => $validated['initial_sprint_goal'] ?? null,
                'start_date' => $validated['initial_sprint_start_date'] ?? $project->start_date ?? now()->toDateString(),
                'end_date' => $validated['initial_sprint_end_date'] ?? now()->addDays(14)->toDateString(),
                'status' => 'active',
            ]);
        }

        PmsActivityLog::log(
            action: 'created',
            entityType: 'project',
            description: "Menginisialisasi proyek PMS baru: {$project->name} ({$project->code})",
            projectId: $project->id
        );

        return redirect()->route('studio.pms.projects.show', $project->id)
            ->with('success', "Proyek {$project->name} berhasil diinisialisasi secara lengkap.");
    }

    /**
     * Display detailed workspace for a project.
     */
    public function show(Request $request, PmsProject $project): Response
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        // Authorization check: If not admin, user MUST be an assigned member of this project
        if (! $isAdmin && $user) {
            $isMember = $project->members()->where('user_id', $user->id)->exists();
            if (! $isMember) {
                abort(403, 'Akses ditolak. Anda belum ditugaskan ke proyek ini oleh Admin.');
            }
        }

        $currentUserMembership = $user ? $project->members()->where('user_id', $user->id)->first() : null;
        $userRoleInProject = $currentUserMembership?->role_in_project ?? ($isAdmin ? 'Lead Architect / Admin' : 'Anggota Tim');

        $project->load([
            'creator',
            'detail',
            'members.user',
            'sprints' => fn ($q) => $q->orderBy('start_date', 'asc'),
            'sprints.tasks' => fn ($q) => $q->orderBy('order_index', 'asc')->with(['assignee', 'subtasks']),
            'tasks' => fn ($q) => $q->orderBy('order_index', 'asc')->with(['assignee', 'sprint', 'subtasks', 'attachments']),
            'finances' => $isAdmin ? fn ($q) => $q->latest('transaction_date') : fn ($q) => $q->whereRaw('1 = 0'),
            'attachments.uploader',
            'activityLogs.user' => fn ($q) => $q->latest('created_at')->limit(20),
            'projectOrder',
        ]);

        $availableUsers = $isAdmin ? User::where('status', 'active')
            ->select('id', 'name', 'email', 'avatar', 'role_title')
            ->orderBy('name')
            ->get() : [];

        return Inertia::render('studio/pms/projects/show', [
            'is_admin' => $isAdmin,
            'user_role_in_project' => $userRoleInProject,
            'current_user_id' => $user?->id,
            'project' => $project,
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * Update project basic attributes.
     */
    public function update(Request $request, PmsProject $project): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mengubah data master proyek.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:pms_projects,code,' . $project->id],
            'client' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:planning,in_progress,review,completed,on_hold'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $project->update($validated);

        PmsActivityLog::log(
            action: 'updated',
            entityType: 'project',
            description: "Memperbarui data proyek {$project->name}",
            projectId: $project->id
        );

        return back()->with('success', 'Data proyek berhasil diperbarui.');
    }

    /**
     * Update project technical blueprint.
     */
    public function updateDetail(Request $request, PmsProject $project): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat memperbarui cetak biru teknis proyek.');
        }

        $validated = $request->validate([
            'background' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'scope' => ['nullable', 'string'],
            'tech_stack' => ['nullable', 'array'],
            'deliverables' => ['nullable', 'string'],
            'repository_url' => ['nullable', 'url'],
            'live_demo_url' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
        ]);

        $project->detail()->updateOrCreate(
            ['project_id' => $project->id],
            $validated
        );

        PmsActivityLog::log(
            action: 'updated',
            entityType: 'project',
            description: "Memperbarui cetak biru teknis proyek {$project->name}",
            projectId: $project->id
        );

        return back()->with('success', 'Cetak biru teknis proyek berhasil disimpan.');
    }

    /**
     * Delete project and all associated components.
     */
    public function destroy(Request $request, PmsProject $project): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang berwenang menghapus proyek.');
        }

        $projectName = $project->name;
        $project->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'project',
            description: "Menghapus proyek {$projectName}"
        );

        return redirect()->route('studio.pms.projects.index')
            ->with('success', "Proyek {$projectName} berhasil dihapus.");
    }

    /**
     * Seamless bridge: Import a verified ProjectOrder into PMS.
     */
    public function importFromOrder(Request $request): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat mengimpor order ke PMS.');
        }

        $request->validate([
            'order_id' => ['required', 'exists:project_orders,id'],
        ]);

        $order = ProjectOrder::findOrFail($request->order_id);

        if ($order->pmsProject) {
            return redirect()->route('studio.pms.projects.show', $order->pmsProject->id)
                ->with('info', 'Proyek PMS untuk order ini sudah aktif.');
        }

        $project = PmsProject::create([
            'name' => "Order #{$order->tracking_code}: {$order->project_type}",
            'code' => 'ORD-' . strtoupper(substr($order->tracking_code, 0, 8)),
            'client' => $order->client_name,
            'description' => is_array($order->client_brief) ? json_encode($order->client_brief, JSON_PRETTY_PRINT) : ($order->notes ?? 'Order Klien dari Portal Layanan'),
            'budget' => $order->total_amount,
            'status' => 'in_progress',
            'priority' => 'high',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(21)->toDateString(),
            'project_order_id' => $order->id,
            'created_by' => auth()->id(),
        ]);

        PmsProjectDetail::create([
            'project_id' => $project->id,
            'background' => "Dibuat otomatis dari konfirmasi pembayaran Order #{$order->tracking_code}",
            'tech_stack' => $order->selected_features ?? [],
            'live_demo_url' => $order->staging_url ?? null,
            'deliverables' => 'Source Code Repositori, Panduan Penggunaan, Deployment Staging & Production.',
        ]);

        // Auto-create initial Sprint from Order Milestones if present
        $sprint = $project->sprints()->create([
            'name' => 'Sprint 1 - Inisialisasi & Core Engine',
            'goal' => 'Pengembangan fondasi arsitektur sesuai brief klien',
            'status' => 'active',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
        ]);

        // Auto-create tasks based on milestones
        if (is_array($order->milestone_progress)) {
            foreach ($order->milestone_progress as $idx => $ms) {
                $status = ($ms['status'] ?? '') === 'completed' ? 'done' : (($ms['status'] ?? '') === 'in_progress' ? 'in_progress' : 'todo');
                $project->tasks()->create([
                    'sprint_id' => $sprint->id,
                    'title' => $ms['title'] ?? "Milestone {$idx}",
                    'description' => $ms['description'] ?? null,
                    'status' => $status,
                    'priority' => 'high',
                    'created_by' => auth()->id(),
                    'order_index' => $idx,
                ]);
            }
        }

        PmsActivityLog::log(
            action: 'created',
            entityType: 'project',
            description: "Menjembatani Order Klien #{$order->tracking_code} menjadi Proyek PMS: {$project->name}",
            projectId: $project->id
        );

        return redirect()->route('studio.pms.projects.show', $project->id)
            ->with('success', "Proyek PMS berhasil dibuat dari Order #{$order->tracking_code}.");
    }
}
