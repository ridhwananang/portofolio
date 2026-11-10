<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsProject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PmsActivityLogController extends Controller
{
    /**
     * Display full audit trail of PMS activities.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();
        $projectId = $request->input('project_id');
        $action = $request->input('action');
        $entityType = $request->input('entity_type');

        $projectsQuery = PmsProject::select('id', 'name', 'code')->latest();
        if (!$isAdmin) {
            $projectsQuery->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
        }
        $projects = $projectsQuery->get();
        $allowedProjectIds = $projects->pluck('id')->toArray();

        $logsQuery = PmsActivityLog::with(['project', 'user'])
            ->when($projectId, fn ($q) => $q->where('project_id', $projectId))
            ->when(!$isAdmin, fn ($q) => $q->whereIn('project_id', $allowedProjectIds))
            ->when($action, fn ($q) => $q->where('action', $action))
            ->when($entityType, fn ($q) => $q->where('entity_type', $entityType))
            ->latest('created_at');

        $logs = $logsQuery->paginate(25)->withQueryString();

        return Inertia::render('studio/pms/activity-logs/index', [
            'logs' => $logs,
            'projects' => $projects,
            'is_admin' => $isAdmin,
            'filters' => [
                'project_id' => $projectId ? (int) $projectId : null,
                'action' => $action,
                'entity_type' => $entityType,
            ],
        ]);
    }
}
