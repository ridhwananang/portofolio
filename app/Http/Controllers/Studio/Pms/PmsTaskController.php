<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsSubtask;
use App\Models\Pms\PmsTask;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PmsTaskController extends Controller
{
    /**
     * Display Kanban board / Tasks workspace.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        $projectId = $request->input('project_id');
        $sprintId = $request->input('sprint_id');
        $assignedTo = $request->input('assigned_to');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $search = $request->input('search');

        // Non-admin can only access projects they belong to
        $projectsQuery = PmsProject::query();
        if (! $isAdmin && $user) {
            $projectsQuery->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
        }
        $projects = $projectsQuery->select('id', 'name', 'code')->latest()->get();
        $userProjectIds = $projects->pluck('id');

        $users = User::where('status', 'active')->select('id', 'name', 'email', 'avatar', 'role_title')->orderBy('name')->get();

        $tasksQuery = PmsTask::with(['project', 'sprint', 'assignee', 'subtasks'])
            ->when(! $isAdmin, function ($q) use ($userProjectIds) {
                $q->whereIn('project_id', $userProjectIds);
            })
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when($sprintId, fn ($q) => $q->where('sprint_id', $sprintId))
            ->when($assignedTo, fn ($q) => $q->where('assigned_to', $assignedTo))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($priority, fn ($q) => $q->where('priority', $priority))
            ->when($search, function ($q, $search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            })
            ->orderBy('order_index', 'asc')
            ->orderBy('id', 'desc');

        $tasks = $tasksQuery->get();

        return Inertia::render('studio/pms/tasks/index', [
            'is_admin' => $isAdmin,
            'current_user_id' => $user?->id,
            'tasks' => $tasks,
            'projects' => $projects,
            'users' => $users,
            'filters' => [
                'project_id' => $projectId ? (int) $projectId : null,
                'sprint_id' => $sprintId ? (int) $sprintId : null,
                'assigned_to' => $assignedTo ? (int) $assignedTo : null,
                'status' => $status,
                'priority' => $priority,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        $validated = $request->validate([
            'project_id' => ['required', 'exists:pms_projects,id'],
            'sprint_id' => ['nullable', 'exists:pms_sprints,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:todo,in_progress,review,done'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
            'estimated_hours' => ['nullable', 'numeric', 'min:0'],
            'actual_hours' => ['nullable', 'numeric', 'min:0'],
        ]);

        if (! $isAdmin && $user) {
            $isMember = PmsProject::where('id', $validated['project_id'])
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->exists();
            if (! $isMember) {
                abort(403, 'Akses ditolak. Anda hanya dapat membuat tugas pada proyek yang ditugaskan kepada Anda.');
            }
        }

        $highestOrder = PmsTask::where('project_id', $validated['project_id'])
            ->where('status', $validated['status'])
            ->max('order_index') ?? 0;

        $task = PmsTask::create([
            ...$validated,
            'estimated_hours' => $validated['estimated_hours'] ?? 0,
            'actual_hours' => $validated['actual_hours'] ?? 0,
            'order_index' => $highestOrder + 1,
            'created_by' => auth()->id(),
        ]);

        PmsActivityLog::log(
            action: 'created',
            entityType: 'task',
            description: "Membuat tugas baru: {$task->title}",
            projectId: $task->project_id
        );

        return back()->with('success', "Tugas {$task->title} berhasil dibuat.");
    }

    /**
     * Update an existing task.
     */
    public function update(Request $request, PmsTask $task): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        if (! $isAdmin && $user) {
            $isMember = $task->project->members()->where('user_id', $user->id)->exists();
            if (! $isMember) {
                abort(403, 'Akses ditolak. Anda tidak berhak mengubah tugas pada proyek ini.');
            }
        }

        $validated = $request->validate([
            'sprint_id' => ['nullable', 'exists:pms_sprints,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:todo,in_progress,review,done'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
            'estimated_hours' => ['nullable', 'numeric', 'min:0'],
            'actual_hours' => ['nullable', 'numeric', 'min:0'],
        ]);

        $task->update([
            ...$validated,
            'estimated_hours' => $validated['estimated_hours'] ?? 0,
            'actual_hours' => $validated['actual_hours'] ?? 0,
        ]);

        PmsActivityLog::log(
            action: 'updated',
            entityType: 'task',
            description: "Memperbarui detail tugas {$task->title}",
            projectId: $task->project_id
        );

        return back()->with('success', 'Tugas berhasil diperbarui.');
    }

    /**
     * Quick patch status and ordering for Kanban drag & drop.
     */
    public function updateStatus(Request $request, PmsTask $task): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        if (! $isAdmin && $user) {
            $isMember = $task->project->members()->where('user_id', $user->id)->exists();
            if (! $isMember) {
                abort(403, 'Akses ditolak. Anda tidak berhak mengubah status tugas pada proyek ini.');
            }
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:todo,in_progress,review,done'],
            'order_index' => ['nullable', 'integer'],
        ]);

        $oldStatus = $task->status;
        $task->status = $validated['status'];
        if (isset($validated['order_index'])) {
            $task->order_index = $validated['order_index'];
        }
        $task->save();

        if ($oldStatus !== $task->status) {
            PmsActivityLog::log(
                action: 'status_changed',
                entityType: 'task',
                description: "Status tugas {$task->title} diubah dari {$oldStatus} ke {$task->status}",
                projectId: $task->project_id
            );
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'task' => $task]);
        }

        return back()->with('success', 'Status tugas diperbarui.');
    }

    /**
     * Delete a task.
     */
    public function destroy(Request $request, PmsTask $task): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        if (! $isAdmin && $user && $task->created_by !== $user->id) {
            abort(403, 'Akses ditolak. Hanya Administrator atau pembuat tugas yang dapat menghapus tugas ini.');
        }

        $title = $task->title;
        $projectId = $task->project_id;
        $task->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'task',
            description: "Menghapus tugas {$title}",
            projectId: $projectId
        );

        return back()->with('success', "Tugas {$title} berhasil dihapus.");
    }

    /**
     * Store subtask for a task.
     */
    public function storeSubtask(Request $request, PmsTask $task): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        if (! $isAdmin && $user) {
            $isMember = $task->project->members()->where('user_id', $user->id)->exists();
            if (! $isMember) {
                abort(403, 'Akses ditolak. Anda tidak berhak menambahkan subtask pada proyek ini.');
            }
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $task->subtasks()->create([
            'title' => $validated['title'],
            'is_done' => false,
        ]);

        return back()->with('success', 'Subtask berhasil ditambahkan.');
    }

    /**
     * Toggle subtask completed status.
     */
    public function toggleSubtask(Request $request, PmsSubtask $subtask): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        if (! $isAdmin && $user) {
            $isMember = $subtask->task->project->members()->where('user_id', $user->id)->exists();
            if (! $isMember) {
                abort(403, 'Akses ditolak. Anda tidak berhak mengubah subtask ini.');
            }
        }

        $subtask->is_done = ! $subtask->is_done;
        $subtask->completed_at = $subtask->is_done ? now() : null;
        $subtask->save();

        return back();
    }

    /**
     * Remove subtask.
     */
    public function destroySubtask(Request $request, PmsSubtask $subtask): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        if (! $isAdmin && $user && $subtask->task->created_by !== $user->id) {
            abort(403, 'Akses ditolak. Hanya Administrator atau pembuat tugas yang dapat menghapus subtask ini.');
        }

        $subtask->delete();

        return back()->with('success', 'Subtask berhasil dihapus.');
    }
}
