<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsFinance;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsProjectMember;
use App\Models\Pms\PmsSprint;
use App\Models\Pms\PmsTask;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PmsDashboardController extends Controller
{
    /**
     * Display executive PMS cockpit.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user ? $user->isAdmin() : false;

        // 1. Projects Query Scoping
        $projectsQuery = PmsProject::with(['creator', 'members.user', 'tasks.assignee', 'sprints']);
        if (! $isAdmin && $user) {
            $projectsQuery->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
        }
        $projects = $projectsQuery->latest()->get();
        $projectIds = $projects->pluck('id');

        // 2. High-Level Metrics
        $totalProjects = $projects->count();
        $activeProjects = $projects->whereIn('status', ['in_progress', 'planning', 'review'])->count();
        $completedProjects = $projects->where('status', 'completed')->count();

        // Financials: Only visible to Admin (hidden/0 for non-admins)
        $totalBudget = $isAdmin ? (float) $projects->sum('budget') : 0;
        $totalIncome = $isAdmin ? (float) PmsFinance::where('type', 'income')->sum('amount') : 0;
        $totalExpenses = $isAdmin ? (float) PmsFinance::whereIn('type', ['project_expense', 'general_expense'])->sum('amount') : 0;
        $remainingBudget = max(0, $totalBudget - $totalExpenses);

        // Tasks & Sprints Scoping:
        $taskBaseQuery = PmsTask::query()->when(! $isAdmin, fn ($q) => $q->whereIn('project_id', $projectIds));
        $totalTasks = (clone $taskBaseQuery)->count();
        $todoTasks = (clone $taskBaseQuery)->where('status', 'todo')->count();
        $inProgressTasks = (clone $taskBaseQuery)->where('status', 'in_progress')->count();
        $reviewTasks = (clone $taskBaseQuery)->where('status', 'review')->count();
        $completedTasks = (clone $taskBaseQuery)->where('status', 'done')->count();
        $openTasks = $todoTasks + $inProgressTasks + $reviewTasks;
        $completionRate = $totalTasks > 0 ? (int) round(($completedTasks / $totalTasks) * 100) : 0;

        $sprintBaseQuery = PmsSprint::query()->when(! $isAdmin, fn ($q) => $q->whereIn('project_id', $projectIds));
        $activeSprintsCount = (clone $sprintBaseQuery)->where('status', 'active')->count();
        $totalSprintsCount = (clone $sprintBaseQuery)->count();

        // 3. Project Health Array
        $projectHealth = $projects->map(function (PmsProject $project) use ($isAdmin) {
            $daysLeft = $project->end_date ? $this->calculateDaysLeft($project->end_date) : null;
            $activeSprint = $project->sprints->where('status', 'active')->first();

            return [
                'id' => $project->id,
                'name' => $project->name,
                'code' => $project->code,
                'client' => $project->client,
                'status' => $project->status,
                'priority' => $project->priority,
                'progress' => $project->progress_percentage,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'end_date' => $project->end_date?->format('Y-m-d'),
                'active_sprints' => $project->sprints->where('status', 'active')->count(),
                'total_sprints' => $project->sprints->count(),
                'active_sprint_name' => $activeSprint?->name,
                'todo_tasks' => $project->tasks->where('status', 'todo')->count(),
                'in_progress_tasks' => $project->tasks->where('status', 'in_progress')->count(),
                'review_tasks' => $project->tasks->where('status', 'review')->count(),
                'completed_tasks' => $project->tasks->where('status', 'done')->count(),
                'open_tasks' => $project->tasks->whereIn('status', ['todo', 'in_progress', 'review'])->count(),
                'total_tasks' => $project->tasks->count(),
                'days_left' => $daysLeft,
                'members' => $project->members
                    ->take(5)
                    ->map(fn (PmsProjectMember $member) => [
                        'id' => $member->id,
                        'user_id' => $member->user_id,
                        'name' => $member->user?->name ?? 'Anggota Tim',
                        'avatar' => $member->user?->avatar,
                        'role_in_project' => $member->role_in_project,
                    ])
                    ->values()
                    ->all(),
                'budget' => $isAdmin ? (float) $project->budget : 0,
                'spent' => $isAdmin ? $project->total_expense : 0,
                'burn_rate' => $isAdmin ? $project->budget_burn_rate : 0,
            ];
        });

        // 4. Timeline Tasks
        $timelineQuery = PmsTask::with(['project', 'sprint', 'assignee'])
            ->whereNotNull('due_date');
        if (! $isAdmin && $user) {
            $timelineQuery->where(function ($q) use ($user, $projectIds) {
                $q->where('assigned_to', $user->id)
                    ->orWhereIn('project_id', $projectIds);
            });
        }
        $timelineTasks = $timelineQuery->orderBy('due_date', 'asc')
            ->limit(30)
            ->get()
            ->map(function (PmsTask $task) {
                return [
                    'task_id' => $task->id,
                    'task_title' => $task->title,
                    'task_status' => $task->status,
                    'task_priority' => $task->priority,
                    'due_date' => $task->due_date?->format('Y-m-d'),
                    'project_id' => $task->project_id,
                    'project_name' => $task->project->name ?? 'Untitled Project',
                    'project_code' => $task->project->code ?? '',
                    'sprint_name' => $task->sprint->name ?? null,
                    'assignee_name' => $task->assignee->name ?? 'Belum Ditugaskan',
                    'assignee_avatar' => $task->assignee->avatar ?? null,
                ];
            });

        // 5. Upcoming Deadlines (Next 14 Days + up to 7 Days Overdue)
        $deadlinesQuery = PmsTask::with(['project', 'sprint', 'assignee'])
            ->where('status', '!=', 'done')
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now()->copy()->subDays(7)->startOfDay(), now()->copy()->addDays(14)->endOfDay()])
            ->when(! $isAdmin, fn ($q) => $q->whereIn('project_id', $projectIds));

        $upcomingDeadlines = $deadlinesQuery->orderBy('due_date', 'asc')
            ->limit(10)
            ->get()
            ->map(fn (PmsTask $task) => $this->formatCockpitTask($task));

        // 6. Actionable Tasks for Interactive Cockpit Radar
        $actionableTasks = PmsTask::with(['project', 'sprint', 'assignee'])
            ->when(! $isAdmin, fn ($q) => $q->whereIn('project_id', $projectIds))
            ->where('status', '!=', 'done')
            ->orderByRaw("CASE WHEN status = 'in_progress' THEN 1 WHEN status = 'review' THEN 2 WHEN status = 'todo' THEN 3 ELSE 4 END")
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC')
            ->limit(15)
            ->get()
            ->map(fn (PmsTask $task) => $this->formatCockpitTask($task));

        // 7. Active & Planned Sprints Spotlight
        $activeSprints = PmsSprint::with(['project'])
            ->when(! $isAdmin, fn ($q) => $q->whereIn('project_id', $projectIds))
            ->orderByRaw("CASE WHEN status = 'active' THEN 1 WHEN status = 'planned' THEN 2 ELSE 3 END")
            ->latest('start_date')
            ->limit(6)
            ->get()
            ->map(function (PmsSprint $sprint) {
                return [
                    'id' => $sprint->id,
                    'project_id' => $sprint->project_id,
                    'project_name' => $sprint->project->name ?? '-',
                    'project_code' => $sprint->project->code ?? '',
                    'name' => $sprint->name,
                    'goal' => $sprint->goal,
                    'status' => $sprint->status,
                    'start_date' => $sprint->start_date?->format('Y-m-d'),
                    'end_date' => $sprint->end_date?->format('Y-m-d'),
                    'days_left' => $sprint->end_date ? $this->calculateDaysLeft($sprint->end_date) : null,
                    'tasks_count' => $sprint->tasks_count,
                    'completed_tasks_count' => $sprint->completed_tasks_count,
                    'progress_percentage' => $sprint->progress_percentage,
                ];
            });

        return Inertia::render('studio/pms/dashboard', [
            'is_admin' => $isAdmin,
            'stats' => [
                'total_projects' => $totalProjects,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'total_budget' => $totalBudget,
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'remaining_budget' => $remainingBudget,
                'total_tasks' => $totalTasks,
                'open_tasks' => $openTasks,
                'completed_tasks' => $completedTasks,
                'todo_tasks' => $todoTasks,
                'in_progress_tasks' => $inProgressTasks,
                'review_tasks' => $reviewTasks,
                'completion_rate' => $completionRate,
                'active_sprints' => $activeSprintsCount,
                'total_sprints' => $totalSprintsCount,
            ],
            'projectHealth' => $projectHealth,
            'timelineTasks' => $timelineTasks,
            'upcomingDeadlines' => $upcomingDeadlines,
            'actionableTasks' => $actionableTasks,
            'activeSprints' => $activeSprints,
            'projects' => $projects,
        ]);
    }

    /**
     * Calculate whole calendar days remaining relative to today.
     */
    private function calculateDaysLeft(CarbonInterface $targetDate): int
    {
        return (int) round(now()->startOfDay()->diffInDays($targetDate->copy()->startOfDay(), false));
    }

    /**
     * Format a task record for the interactive Cockpit task radar.
     */
    private function formatCockpitTask(PmsTask $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status,
            'priority' => $task->priority,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'days_until_due' => $task->due_date ? $this->calculateDaysLeft($task->due_date) : null,
            'project_id' => $task->project_id,
            'project_name' => $task->project->name ?? '-',
            'project_code' => $task->project->code ?? '',
            'sprint_name' => $task->sprint?->name,
            'assignee' => $task->assignee ? [
                'id' => $task->assignee->id,
                'name' => $task->assignee->name,
                'avatar' => $task->assignee->avatar,
            ] : null,
        ];
    }
}
