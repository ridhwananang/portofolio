<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Mail\PmsPortalInviteMail;
use App\Mail\PmsProgressReportMail;
use App\Models\Pms\PmsProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PmsClientPortalController extends Controller
{
    /**
     * Display the confidential client portal page.
     */
    public function show(Request $request, string $token): Response
    {
        $project = PmsProject::where('portal_token', $token)->firstOrFail();

        // 1. If portal is deactivated by studio
        if (! $project->is_portal_active) {
            return Inertia::render('portal/pms/show', [
                'is_deactivated' => true,
                'requires_pin' => false,
                'is_verified' => false,
                'project_summary' => [
                    'name' => $project->name,
                    'code' => $project->code,
                    'client' => $project->client,
                ],
                'token' => $token,
            ]);
        }

        // 2. PIN Protection Check
        $requiresPin = ! empty($project->portal_pin);
        $sessionKey = "portal_pms_verified_{$project->id}";
        $isVerified = $requiresPin ? (bool) $request->session()->get($sessionKey, false) : true;

        if ($requiresPin && ! $isVerified) {
            return Inertia::render('portal/pms/show', [
                'is_deactivated' => false,
                'requires_pin' => true,
                'is_verified' => false,
                'project_summary' => [
                    'name' => $project->name,
                    'code' => $project->code,
                    'client' => $project->client,
                ],
                'token' => $token,
            ]);
        }

        // 3. Update last accessed timestamp
        $project->update(['portal_last_accessed_at' => now()]);

        // 4. Load client-safe data (NO finances, NO internal notes, NO team salaries)
        $project->load([
            'creator:id,name',
            'detail:id,project_id,background,objective,scope,deliverables,live_demo_url,tech_stack',
            'sprints' => fn ($q) => $q->orderBy('start_date', 'asc')->orderBy('id', 'asc'),
            'sprints.tasks' => fn ($q) => $q->orderBy('order_index', 'asc')->orderBy('id', 'asc')->with([
                'subtasks' => fn ($sq) => $sq->select('id', 'task_id', 'title', 'is_done', 'completed_at')->orderBy('id', 'asc'),
                'attachments' => fn ($aq) => $aq->select('id', 'project_id', 'task_id', 'file_name', 'file_path', 'file_type', 'file_size', 'uploaded_by', 'created_at')->with('uploader:id,name'),
                'assignee:id,name,role_title,avatar',
            ]),
            'tasks' => fn ($q) => $q->orderBy('order_index', 'asc')->orderBy('id', 'asc')->with([
                'sprint:id,name,status',
                'subtasks' => fn ($sq) => $sq->select('id', 'task_id', 'title', 'is_done', 'completed_at')->orderBy('id', 'asc'),
                'attachments' => fn ($aq) => $aq->select('id', 'project_id', 'task_id', 'file_name', 'file_path', 'file_type', 'file_size', 'uploaded_by', 'created_at')->with('uploader:id,name'),
                'assignee:id,name,role_title,avatar',
            ]),
            'members.user:id,name,role_title,avatar,is_admin',
            'attachments' => fn ($q) => $q->select('id', 'project_id', 'task_id', 'file_name', 'file_path', 'file_size', 'file_type', 'uploaded_by', 'created_at')
                ->with(['uploader:id,name', 'task:id,title'])
                ->latest(),
        ]);

        // Build member role lookup for public view
        $memberRoles = [];
        foreach ($project->members as $m) {
            if ($m->user_id) {
                $memberRoles[$m->user_id] = $m->role_in_project;
            }
        }

        $formatAttachment = fn ($att) => [
            'id' => $att->id,
            'task_id' => $att->task_id,
            'task_title' => $att->task?->title,
            'file_name' => $att->file_name,
            'file_path' => $att->file_path,
            'file_url' => $att->file_url,
            'file_size' => $att->file_size,
            'file_type' => $att->file_type,
            'uploader_name' => $att->uploader?->name ?? 'Tim Studio',
            'created_at' => $att->created_at ? $att->created_at->format('Y-m-d') : null,
        ];

        // Transform tasks to attach sanitized role in project
        $sanitizedTasks = $project->tasks->map(function ($t) use ($memberRoles, $formatAttachment) {
            return [
                'id' => $t->id,
                'project_id' => $t->project_id,
                'sprint_id' => $t->sprint_id,
                'assigned_to' => $t->assigned_to,
                'title' => $t->title,
                'description' => $t->description,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date ? $t->due_date->format('Y-m-d') : null,
                'created_at' => $t->created_at ? $t->created_at->format('Y-m-d') : null,
                'sprint' => $t->sprint ? [
                    'id' => $t->sprint->id,
                    'name' => $t->sprint->name,
                    'status' => $t->sprint->status,
                ] : null,
                'assignee_role' => $t->assigned_to ? ($memberRoles[$t->assigned_to] ?? $t->assignee?->role_title ?? 'Tim Teknis') : 'Tim Studio',
                'assignee_name' => $t->assignee?->name ?? 'Tim Studio',
                'assignee_avatar' => $t->assignee?->avatar,
                'subtasks' => $t->subtasks ?? [],
                'attachments' => $t->attachments ? $t->attachments->map($formatAttachment)->values() : [],
            ];
        });

        // Client-safe team members list (NO email, phone, or hourly rate)
        $sanitizedMembers = $project->members->map(function ($m) {
            return [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'name' => $m->user?->name ?? 'Anggota Tim',
                'role_in_project' => $m->role_in_project,
                'role_title' => $m->user?->role_title,
                'avatar' => $m->user?->avatar,
                'is_admin' => (bool) ($m->user?->is_admin ?? false),
            ];
        })->values();

        $sanitizedAttachments = $project->attachments->map($formatAttachment)->values();

        // Compute sprint progress
        $sanitizedSprints = $project->sprints->map(function ($s) {
            $totalTasks = $s->tasks->count();
            $doneTasks = $s->tasks->where('status', 'done')->count();
            $percent = $totalTasks > 0 ? (int) round(($doneTasks / $totalTasks) * 100) : ($s->status === 'completed' ? 100 : 0);

            return [
                'id' => $s->id,
                'name' => $s->name,
                'goal' => $s->goal,
                'status' => $s->status,
                'start_date' => $s->start_date ? $s->start_date->format('Y-m-d') : null,
                'end_date' => $s->end_date ? $s->end_date->format('Y-m-d') : null,
                'tasks_count' => $totalTasks,
                'done_tasks_count' => $doneTasks,
                'progress_percentage' => $percent,
            ];
        });

        // Compute total stats
        $allTasks = $sanitizedTasks;
        $totalTasksCount = $allTasks->count();
        $doneTasksCount = $allTasks->where('status', 'done')->count();
        $inProgressCount = $allTasks->where('status', 'in_progress')->count();
        $reviewCount = $allTasks->where('status', 'review')->count();
        $todoCount = $allTasks->where('status', 'todo')->count();

        $allSubtasks = $allTasks->flatMap(fn ($t) => $t['subtasks'] ?? []);
        $totalSubtasksCount = $allSubtasks->count();
        $doneSubtasksCount = $allSubtasks->where('is_done', true)->count();

        // Build interactive timelineData matching studio Gantt schema
        $timelineData = [];

        // 1. Master project bar
        $timelineData[] = [
            'type' => 'project',
            'id' => "proj-{$project->id}",
            'project_id' => $project->id,
            'name' => $project->name,
            'code' => $project->code,
            'status' => $project->status,
            'start_date' => $project->start_date?->format('Y-m-d') ?? now()->subDays(7)->format('Y-m-d'),
            'end_date' => $project->end_date?->format('Y-m-d') ?? now()->addDays(21)->format('Y-m-d'),
            'progress' => $project->progress_percentage,
        ];

        // 2. Sprint bars
        foreach ($project->sprints as $sprint) {
            $sprintTotalTasks = $sprint->tasks->count();
            $sprintDoneTasks = $sprint->tasks->where('status', 'done')->count();
            $sprintPercent = $sprintTotalTasks > 0 ? (int) round(($sprintDoneTasks / $sprintTotalTasks) * 100) : ($sprint->status === 'completed' ? 100 : 0);

            $timelineData[] = [
                'type' => 'sprint',
                'id' => "sprint-{$sprint->id}",
                'project_id' => $project->id,
                'name' => $sprint->name,
                'status' => $sprint->status,
                'start_date' => $sprint->start_date?->format('Y-m-d') ?? $project->start_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
                'end_date' => $sprint->end_date?->format('Y-m-d') ?? now()->addDays(14)->format('Y-m-d'),
                'tasks_count' => $sprintTotalTasks,
                'done_tasks_count' => $sprintDoneTasks,
                'progress' => $sprintPercent,
            ];
        }

        // 3. Task bars
        foreach ($project->tasks as $task) {
            $taskStartDate = $task->sprint?->start_date?->format('Y-m-d') 
                ?? $task->created_at?->format('Y-m-d') 
                ?? $project->start_date?->format('Y-m-d') 
                ?? now()->format('Y-m-d');

            $taskEndDate = $task->due_date?->format('Y-m-d')
                ?? $task->sprint?->end_date?->format('Y-m-d')
                ?? $project->end_date?->format('Y-m-d')
                ?? now()->addDays(7)->format('Y-m-d');

            $timelineData[] = [
                'type' => 'task',
                'id' => "task-{$task->id}",
                'project_id' => $project->id,
                'name' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority,
                'start_date' => $taskStartDate,
                'end_date' => $taskEndDate,
                'assignee_name' => $task->assignee?->name ?? 'Tim Studio',
                'assignee_role' => $task->assigned_to ? ($memberRoles[$task->assigned_to] ?? $task->assignee?->role_title ?? 'Tim Teknis') : 'Tim Studio',
            ];
        }

        return Inertia::render('portal/pms/show', [
            'is_deactivated' => false,
            'requires_pin' => false,
            'is_verified' => true,
            'token' => $token,
            'timelineData' => $timelineData,
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'code' => $project->code,
                'client' => $project->client,
                'creator_name' => $project->creator?->name ?? 'Studio Lead',
                'description' => $project->description,
                'status' => $project->status,
                'priority' => $project->priority,
                'start_date' => $project->start_date ? $project->start_date->format('Y-m-d') : null,
                'end_date' => $project->end_date ? $project->end_date->format('Y-m-d') : null,
                'progress_percentage' => $project->progress_percentage,
                'detail' => $project->detail,
                'sprints' => $sanitizedSprints,
                'tasks' => $sanitizedTasks,
                'members' => $sanitizedMembers,
                'attachments' => $sanitizedAttachments,
            ],
            'metrics' => [
                'total_tasks' => $totalTasksCount,
                'done_tasks' => $doneTasksCount,
                'in_progress_tasks' => $inProgressCount,
                'review_tasks' => $reviewCount,
                'todo_tasks' => $todoCount,
                'total_subtasks' => $totalSubtasksCount,
                'done_subtasks' => $doneSubtasksCount,
                'subtask_percentage' => $totalSubtasksCount > 0 ? (int) round(($doneSubtasksCount / $totalSubtasksCount) * 100) : 0,
            ],
        ]);
    }

    /**
     * Verify client portal PIN.
     */
    public function verifyPin(Request $request, string $token): RedirectResponse
    {
        $request->validate([
            'pin' => 'required|string',
        ]);

        $project = PmsProject::where('portal_token', $token)
            ->where('is_portal_active', true)
            ->firstOrFail();

        if (trim((string) $project->portal_pin) === trim((string) $request->pin)) {
            $request->session()->put("portal_pms_verified_{$project->id}", true);
            return back()->with('success', 'PIN terverifikasi. Selamat datang di Portal Pantau Proyek!');
        }

        return back()->withErrors([
            'pin' => 'PIN akses salah. Harap periksa kembali PIN rahasia di email Anda.',
        ]);
    }

    /**
     * Toggle client portal active status (Admin only).
     */
    public function toggle(Request $request, PmsProject $project): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $project->update([
            'is_portal_active' => ! $project->is_portal_active,
        ]);

        $statusStr = $project->is_portal_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Portal klien berhasil {$statusStr}.");
    }

    /**
     * Regenerate client portal token & PIN (Admin only).
     */
    public function regenerate(Request $request, PmsProject $project): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $project->update([
            'portal_token' => Str::random(32),
            'portal_pin' => null,
        ]);

        return back()->with('success', 'Tautan portal klien berhasil diperbarui.');
    }

    /**
     * Update client portal settings (PIN, client email, active state) (Admin only).
     */
    public function updateSettings(Request $request, PmsProject $project): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'client_email' => 'nullable|email|max:255',
            'portal_pin' => 'nullable|string|max:20',
            'is_portal_active' => 'boolean',
        ]);

        $project->update($validated);

        return back()->with('success', 'Pengaturan portal klien berhasil disimpan.');
    }

    /**
     * Send portal invitation email with secret link & PIN (Admin only).
     */
    public function sendInvite(Request $request, PmsProject $project): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'client_email' => 'required|email|max:255',
        ]);

        // Save email if updated
        $project->update([
            'client_email' => $validated['client_email'],
            'portal_last_email_sent_at' => now(),
        ]);

        $portalUrl = url("/portal/pms/{$project->portal_token}");

        try {
            Mail::to($validated['client_email'])->send(
                new PmsPortalInviteMail($project, $portalUrl, null)
            );
            return back()->with('success', "Undangan akses portal berhasil dikirim ke {$validated['client_email']}.");
        } catch (\Throwable $e) {
            return back()->withErrors(['email' => 'Gagal mengirim email: ' . $e->getMessage()]);
        }
    }

    /**
     * Send progress report email to client (Admin only).
     */
    public function sendReport(Request $request, PmsProject $project): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'client_email' => 'required|email|max:255',
        ]);

        $portalUrl = url("/portal/pms/{$project->portal_token}");

        // Build summary data
        $project->load(['tasks.subtasks', 'sprints']);
        $totalTasks = $project->tasks->count();
        $doneTasks = $project->tasks->where('status', 'done')->count();

        $allSubtasks = $project->tasks->flatMap(fn ($t) => $t->subtasks ?? []);
        $totalSubtasks = $allSubtasks->count();
        $doneSubtasks = $allSubtasks->where('is_done', true)->count();

        $activeSprint = $project->sprints->firstWhere('status', 'active')?->name ?? 'Semua Sprint Terencana';

        $recentAchievements = $project->tasks
            ->where('status', 'done')
            ->take(5)
            ->pluck('title')
            ->toArray();

        $summaryData = [
            'total_tasks' => $totalTasks,
            'done_tasks' => $doneTasks,
            'total_subtasks' => $totalSubtasks,
            'done_subtasks' => $doneSubtasks,
            'active_sprint' => $activeSprint,
            'recent_achievements' => $recentAchievements,
        ];

        $project->update([
            'client_email' => $validated['client_email'],
            'portal_last_email_sent_at' => now(),
        ]);

        try {
            Mail::to($validated['client_email'])->send(
                new PmsProgressReportMail($project, $portalUrl, $summaryData)
            );
            return back()->with('success', "Laporan progres berhasil dikirim ke {$validated['client_email']}.");
        } catch (\Throwable $e) {
            return back()->withErrors(['email' => 'Gagal mengirim email: ' . $e->getMessage()]);
        }
    }

    /**
     * Authorize that the current user is an administrator.
     */
    protected function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user || ! $user->isAdmin()) {
            abort(403, 'Aksi ini hanya dapat dilakukan oleh Administrator.');
        }
    }
}
