<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsSprint;
use App\Models\Pms\PmsTask;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PmsTimelineController extends Controller
{
    /**
     * Display interactive timeline Gantt chart across active projects.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();
        $projectId = $request->input('project_id');

        $projectsQuery = PmsProject::select('id', 'name', 'code', 'status', 'start_date', 'end_date')->latest();
        if (!$isAdmin) {
            $projectsQuery->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
        }
        $projects = $projectsQuery->get();
        $allowedProjectIds = $projects->pluck('id')->toArray();

        $timelineProjects = PmsProject::with([
            'sprints' => fn ($q) => $q->orderBy('start_date', 'asc'),
            'tasks' => fn ($q) => $q->orderBy('due_date', 'asc')->with('assignee'),
        ])
            ->when($projectId, fn ($q) => $q->where('id', $projectId))
            ->when(!$isAdmin, fn ($q) => $q->whereIn('id', $allowedProjectIds))
            ->whereIn('status', ['in_progress', 'planning', 'review'])
            ->get();

        // Flatten for the timeline data format
        $timelineData = [];

        foreach ($timelineProjects as $proj) {
            // Add project master bar
            $timelineData[] = [
                'type' => 'project',
                'id' => "proj-{$proj->id}",
                'project_id' => $proj->id,
                'name' => $proj->name,
                'code' => $proj->code,
                'status' => $proj->status,
                'start_date' => $proj->start_date?->format('Y-m-d') ?? now()->subDays(7)->format('Y-m-d'),
                'end_date' => $proj->end_date?->format('Y-m-d') ?? now()->addDays(21)->format('Y-m-d'),
                'progress' => $proj->progress_percentage,
            ];

            // Add sprints
            foreach ($proj->sprints as $sprint) {
                $timelineData[] = [
                    'type' => 'sprint',
                    'id' => "sprint-{$sprint->id}",
                    'project_id' => $proj->id,
                    'project_name' => $proj->name,
                    'name' => $sprint->name,
                    'status' => $sprint->status,
                    'start_date' => $sprint->start_date?->format('Y-m-d') ?? $proj->start_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
                    'end_date' => $sprint->end_date?->format('Y-m-d') ?? now()->addDays(7)->format('Y-m-d'),
                    'tasks_count' => $sprint->tasks_count,
                ];
            }

            // Add tasks with due date
            foreach ($proj->tasks as $task) {
                if ($task->due_date) {
                    $timelineData[] = [
                        'type' => 'task',
                        'id' => "task-{$task->id}",
                        'project_id' => $proj->id,
                        'project_name' => $proj->name,
                        'name' => $task->title,
                        'status' => $task->status,
                        'priority' => $task->priority,
                        'start_date' => $task->created_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
                        'end_date' => $task->due_date->format('Y-m-d'),
                        'assignee_name' => $task->assignee->name ?? 'Belum Ditugaskan',
                        'assignee_avatar' => $task->assignee->avatar ?? null,
                    ];
                }
            }
        }

        return Inertia::render('studio/pms/timeline/index', [
            'timelineData' => $timelineData,
            'projects' => $projects,
            'selectedProjectId' => $projectId ? (int) $projectId : null,
            'is_admin' => $isAdmin,
        ]);
    }
}
