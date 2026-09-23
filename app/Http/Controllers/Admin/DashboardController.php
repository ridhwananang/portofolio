<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Message;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectOrder;
use App\Models\TechStack;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalProjects = Project::count();
        $totalCertificates = Certificate::count();
        $totalTechStacks = TechStack::count();
        $totalMessages = Message::count();
        $unreadMessages = Message::where('is_read', false)->count();
        $totalOrders = ProjectOrder::count();

        $recentMessages = Message::latest()->take(5)->get();
        $recentProjects = Project::latest()->take(3)->get()->map(function ($project) {
            if ($project->image && !str_starts_with($project->image, '/') && !str_starts_with($project->image, 'http')) {
                $project->image_url = \Illuminate\Support\Facades\Storage::disk('public')->url($project->image);
            } else {
                $project->image_url = $project->image;
            }
            return $project;
        });
        $recentOrders = ProjectOrder::latest()->take(5)->get();

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalProjects' => $totalProjects,
                'totalCertificates' => $totalCertificates,
                'totalTechStacks' => $totalTechStacks,
                'totalMessages' => $totalMessages,
                'unreadMessages' => $unreadMessages,
                'totalOrders' => $totalOrders,
            ],
            'recentMessages' => $recentMessages,
            'recentProjects' => $recentProjects,
            'recentOrders' => $recentOrders,
        ]);
    }
}
