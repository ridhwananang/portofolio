<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        $disk = config('filesystems.default');
        $projects = Project::orderBy('id', 'desc')->get()->map(function ($project) use ($disk) {
            if ($project->image && !str_starts_with($project->image, '/') && !str_starts_with($project->image, 'http')) {
                $project->image_url = Storage::disk($disk)->url($project->image);
            } else {
                $project->image_url = $project->image;
            }
            return $project;
        });

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/projects/create');
    }

    public function store(ProjectRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $disk = config('filesystems.default');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('projects', $disk);
        }

        Project::create($data);

        Cache::forget('portfolio_home_payload');
        Cache::forget('portfolio_gemini_system_prompt');

        return redirect()->route('admin.projects.index')->with('success', 'Proyek berhasil ditambahkan.');
    }

    public function edit(Project $project): Response
    {
        $disk = config('filesystems.default');
        if ($project->image && !str_starts_with($project->image, '/') && !str_starts_with($project->image, 'http')) {
            $project->image_url = Storage::disk($disk)->url($project->image);
        } else {
            $project->image_url = $project->image;
        }

        return Inertia::render('admin/projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        $data = $request->validated();
        $disk = config('filesystems.default');

        if ($request->hasFile('image')) {
            if ($project->image && !str_starts_with($project->image, '/') && !str_starts_with($project->image, 'http') && Storage::disk($disk)->exists($project->image)) {
                Storage::disk($disk)->delete($project->image);
            }
            $data['image'] = $request->file('image')->store('projects', $disk);
        } else {
            unset($data['image']);
        }

        $project->update($data);

        Cache::forget('portfolio_home_payload');
        Cache::forget('portfolio_gemini_system_prompt');

        return redirect()->route('admin.projects.index')->with('success', 'Proyek berhasil diperbarui.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $disk = config('filesystems.default');
        if ($project->image && !str_starts_with($project->image, '/') && !str_starts_with($project->image, 'http') && Storage::disk($disk)->exists($project->image)) {
            Storage::disk($disk)->delete($project->image);
        }

        $project->delete();

        Cache::forget('portfolio_home_payload');
        Cache::forget('portfolio_gemini_system_prompt');

        return redirect()->route('admin.projects.index')->with('success', 'Proyek berhasil dihapus.');
    }
}
