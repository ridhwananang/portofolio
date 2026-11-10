<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsFinance;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsSprint;
use App\Models\Pms\PmsTask;
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

        // Tasks Scoping:
        if ($isAdmin) {
            $totalTasks = PmsTask::count();
            $openTasks = PmsTask::whereIn('status', ['todo', 'in_progress', 'review'])->count();
            $completedTasks = PmsTask::where('status', 'done')->count();
            $activeSprints = PmsSprint::where('status', 'active')->count();
        } else {
            // For member: focus on their assigned jobdesk tasks
            $totalTasks = $user ? PmsTask::where('assigned_to', $user->id)->count() : 0;
            $openTasks = $user ? PmsTask::where('assigned_to', $user->id)->whereIn('status', ['todo', 'in_progress', 'review'])->count() : 0;
            $completedTasks = $user ? PmsTask::where('assigned_to', $user->id)->where('status', 'done')->count() : 0;
            $activeSprints = PmsSprint::whereIn('project_id', $projectIds)->where('status', 'active')->count();
        }

        // 3. Project Health Array
        $projectHealth = $projects->map(function (PmsProject $project) use ($isAdmin) {
            $daysLeft = null;
            if ($project->end_date) {
                $daysLeft = now()->diffInDays($project->end_date, false);
            }

            return [
                'id' => $project->id,
                'name' => $project->name,
                'code' => $project->code,
                'client' => $project->client,
                'status' => $project->status,
                'priority' => $project->priority,
                'progress' => $project->progress_percentage,
                'active_sprints' => $project->sprints->where('status', 'active')->count(),
                'open_tasks' => $project->tasks->whereIn('status', ['todo', 'in_progress', 'review'])->count(),
                'total_tasks' => $project->tasks->count(),
                'days_left' => $daysLeft,
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

        // 5. Upcoming Deadlines
        $deadlinesQuery = PmsTask::with(['project', 'assignee'])
            ->where('status', '!=', 'done')
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now()->subDays(1), now()->addDays(14)]);
        if (! $isAdmin && $user) {
            $deadlinesQuery->where('assigned_to', $user->id);
        }
        $upcomingDeadlines = $deadlinesQuery->orderBy('due_date', 'asc')
            ->limit(8)
            ->get()
            ->map(function (PmsTask $task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'project_name' => $task->project->name ?? '-',
                    'due_date' => $task->due_date?->format('Y-m-d'),
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'assignee' => $task->assignee ? [
                        'name' => $task->assignee->name,
                        'avatar' => $task->assignee->avatar,
                    ] : null,
                ];
            });

        // 6. Recent Activity Logs
        $logsQuery = PmsActivityLog::with(['user', 'project']);
        if (! $isAdmin) {
            $logsQuery->whereIn('project_id', $projectIds);
        }
        $recentLogs = $logsQuery->latest('created_at')->limit(10)->get();

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
                'active_sprints' => $activeSprints,
            ],
            'projectHealth' => $projectHealth,
            'timelineTasks' => $timelineTasks,
            'upcomingDeadlines' => $upcomingDeadlines,
            'recentLogs' => $recentLogs,
            'projects' => $projects,
        ]);
    }
}
