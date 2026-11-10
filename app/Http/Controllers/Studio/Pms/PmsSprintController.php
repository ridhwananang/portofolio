<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsSprint;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PmsSprintController extends Controller
{
    /**
     * Display all sprints across projects or by selected project.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();
        $projectId = $request->input('project_id');

        $projectsQuery = PmsProject::select('id', 'name', 'code', 'status')->latest();
        if (!$isAdmin) {
            $projectsQuery->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
        }
        $projects = $projectsQuery->get();
        $allowedProjectIds = $projects->pluck('id')->toArray();

        $sprintsQuery = PmsSprint::with(['project', 'tasks.assignee', 'tasks.subtasks'])
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when(!$isAdmin, fn ($q) => $q->whereIn('project_id', $allowedProjectIds))
            ->latest('start_date');

        $sprints = $sprintsQuery->paginate(10)->withQueryString();

        return Inertia::render('studio/pms/sprints/index', [
            'sprints' => $sprints,
            'projects' => $projects,
            'selectedProjectId' => $projectId ? (int) $projectId : null,
            'is_admin' => $isAdmin,
        ]);
    }

    /**
     * Store a new sprint.
     */
    public function store(Request $request): RedirectResponse
    {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Hanya Administrator yang memiliki wewenang untuk membuat siklus sprint.');
        }

        $validated = $request->validate([
            'project_id' => ['required', 'exists:pms_projects,id'],
            'name' => ['required', 'string', 'max:255'],
            'goal' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:planned,active,completed'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $sprint = PmsSprint::create($validated);

        PmsActivityLog::log(
            action: 'created',
            entityType: 'sprint',
            description: "Membuat siklus sprint baru: {$sprint->name}",
            projectId: $sprint->project_id
        );

        return back()->with('success', "Sprint {$sprint->name} berhasil ditambahkan.");
    }

    /**
     * Update sprint.
     */
    public function update(Request $request, PmsSprint $sprint): RedirectResponse
    {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Hanya Administrator yang memiliki wewenang untuk memperbarui siklus sprint.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'goal' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:planned,active,completed'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        $sprint->update($validated);

        PmsActivityLog::log(
            action: 'updated',
            entityType: 'sprint',
            description: "Memperbarui sprint {$sprint->name} ({$sprint->status})",
            projectId: $sprint->project_id
        );

        return back()->with('success', 'Data sprint berhasil diperbarui.');
    }

    /**
     * Remove the specified sprint.
     */
    public function destroy(Request $request, PmsSprint $sprint): RedirectResponse
    {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Hanya Administrator yang memiliki wewenang untuk menghapus siklus sprint.');
        }

        $name = $sprint->name;
        $projectId = $sprint->project_id;

        // Unlink tasks from this sprint so tasks aren't accidentally deleted
        $sprint->tasks()->update(['sprint_id' => null]);
        $sprint->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'sprint',
            description: "Menghapus sprint {$name}",
            projectId: $projectId
        );

        return back()->with('success', "Sprint {$name} berhasil dihapus.");
    }
}
