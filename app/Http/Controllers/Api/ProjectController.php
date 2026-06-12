<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index(): JsonResponse
    {
        $projects = Project::orderBy('id', 'asc')->get();

        return response()->json($projects);
    }
}
