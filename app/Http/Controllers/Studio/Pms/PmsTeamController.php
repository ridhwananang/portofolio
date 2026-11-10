<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsProjectMember;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PmsTeamController extends Controller
{
    /**
     * Assign a user to a project with dynamic role.
     */
    public function assignMember(Request $request, PmsProject $project): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menugaskan anggota tim.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role_in_project' => ['required', 'string', 'max:100'], // Dynamic role e.g. "Senior Fullstack", "UI/UX Lead"
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
        ]);

        $existing = PmsProjectMember::where('project_id', $project->id)
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existing) {
            $existing->update([
                'role_in_project' => $validated['role_in_project'],
                'hourly_rate' => $validated['hourly_rate'] ?? $existing->hourly_rate,
            ]);
            $member = $existing;
        } else {
            $member = PmsProjectMember::create([
                'project_id' => $project->id,
                'user_id' => $validated['user_id'],
                'role_in_project' => $validated['role_in_project'],
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'joined_at' => now()->toDateString(),
            ]);
        }

        $user = User::find($validated['user_id']);

        PmsActivityLog::log(
            action: 'assigned',
            entityType: 'member',
            description: "Menugaskan {$user->name} sebagai '{$member->role_in_project}' pada proyek {$project->name}",
            projectId: $project->id
        );

        return back()->with('success', "{$user->name} berhasil ditugaskan ke dalam tim proyek.");
    }

    /**
     * Update an assigned member's role or rate.
     */
    public function updateMember(Request $request, PmsProjectMember $member): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat memperbarui peran anggota tim.');
        }

        $validated = $request->validate([
            'role_in_project' => ['required', 'string', 'max:100'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
        ]);

        $member->update($validated);

        return back()->with('success', 'Peran anggota proyek berhasil diperbarui.');
    }

    /**
     * Remove member from a project.
     */
    public function removeMember(Request $request, PmsProjectMember $member): RedirectResponse
    {
        if (! $request->user()?->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya Administrator yang dapat menghapus penugasan anggota tim.');
        }

        $userName = $member->user?->name ?? 'Anggota';
        $projectId = $member->project_id;
        $member->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'member',
            description: "Menghapus penugasan {$userName} dari proyek",
            projectId: $projectId
        );

        return back()->with('success', "Penugasan {$userName} telah dihapus dari proyek.");
    }
}
