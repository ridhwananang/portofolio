<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TechStackRequest;
use App\Models\TechStack;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TechStackController extends Controller
{
    public function index(): Response
    {
        $techStacks = TechStack::orderBy('id', 'desc')->get();

        return Inertia::render('admin/tech-stacks/index', [
            'techStacks' => $techStacks,
        ]);
    }

    public function store(TechStackRequest $request): RedirectResponse
    {
        TechStack::create($request->validated());

        return back()->with('success', 'Tech stack berhasil ditambahkan.');
    }

    public function update(TechStackRequest $request, TechStack $techStack): RedirectResponse
    {
        $techStack->update($request->validated());

        return back()->with('success', 'Tech stack berhasil diperbarui.');
    }

    public function destroy(TechStack $techStack): RedirectResponse
    {
        $techStack->delete();

        return back()->with('success', 'Tech stack berhasil dihapus.');
    }
}
