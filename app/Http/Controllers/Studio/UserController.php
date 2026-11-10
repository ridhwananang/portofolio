<?php

namespace App\Http\Controllers\Studio;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of all system users.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $statusFilter = $request->input('status');

        $usersQuery = User::query()
            ->withCount(['pmsProjects', 'assignedPmsTasks'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%")
                        ->orWhere('role_title', 'ilike', "%{$search}%");
                });
            })
            ->when($roleFilter, function ($query, $role) {
                if ($role === 'admin') {
                    $query->where('is_admin', true);
                } else {
                    $query->where('role_title', 'ilike', "%{$role}%");
                }
            })
            ->when($statusFilter, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('is_admin', 'desc')
            ->orderBy('name', 'asc');

        $users = $usersQuery->paginate(15)->withQueryString();

        // Extract unique existing role titles for quick filter chips
        $existingRoles = User::whereNotNull('role_title')
            ->where('role_title', '!=', '')
            ->distinct()
            ->pluck('role_title');

        return Inertia::render('studio/users/index', [
            'users' => $users,
            'existingRoles' => $existingRoles,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Store a newly created dynamic user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Password::defaults()],
            'role_title' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_admin' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_title' => $validated['role_title'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_admin' => (bool) ($validated['is_admin'] ?? false),
            'status' => $validated['status'] ?? 'active',
            'avatar' => $avatarPath,
            'email_verified_at' => now(),
        ]);

        PmsActivityLog::log(
            action: 'created',
            entityType: 'user',
            description: "Menambahkan anggota tim baru: {$user->name} ({$user->role_title})",
            properties: ['user_id' => $user->id, 'email' => $user->email]
        );

        return back()->with('success', 'Anggota tim baru berhasil ditambahkan secara profesional.');
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'role_title' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_admin' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role_title = $validated['role_title'] ?? null;
        $user->phone = $validated['phone'] ?? null;
        $user->status = $validated['status'] ?? 'active';

        // Don't remove admin rights from the root account
        if ($user->email !== 'ridhwananang@gmail.com') {
            $user->is_admin = (bool) ($validated['is_admin'] ?? false);
        }

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        PmsActivityLog::log(
            action: 'updated',
            entityType: 'user',
            description: "Memperbarui data anggota tim: {$user->name}",
            properties: ['user_id' => $user->id]
        );

        return back()->with('success', 'Data anggota tim berhasil diperbarui.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->email === 'ridhwananang@gmail.com') {
            return back()->with('error', 'Akun master administrator tidak dapat dihapus.');
        }

        $userName = $user->name;

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'user',
            description: "Menghapus anggota tim: {$userName}"
        );

        return back()->with('success', 'Anggota tim berhasil dihapus dari sistem.');
    }
}
