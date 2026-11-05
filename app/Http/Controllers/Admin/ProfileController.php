<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProfileRequest;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        $profile = Profile::first();

        if ($profile) {
            if ($profile->image && !str_starts_with($profile->image, '/') && !str_starts_with($profile->image, 'http')) {
                $profile->image = Storage::disk('public')->url($profile->image);
            }
        }

        return Inertia::render('admin/profile/index', [
            'profile' => $profile,
        ]);
    }

    public function update(ProfileRequest $request): RedirectResponse
    {
        $profile = Profile::first() ?? new Profile();
        $data = $request->validated();

        // 1. Handle avatar image (upload, remove, or keep)
        if ($request->boolean('remove_image')) {
            if ($profile->image && Storage::disk('public')->exists($profile->image)) {
                Storage::disk('public')->delete($profile->image);
            }
            $data['image'] = null;
        } elseif ($request->hasFile('image')) {
            if ($profile->image && Storage::disk('public')->exists($profile->image)) {
                Storage::disk('public')->delete($profile->image);
            }
            $data['image'] = $request->file('image')->store('profiles', 'public');
        } else {
            unset($data['image']);
        }

        // 2. All text fields: if empty, set to null (true nullable architecture)
        foreach (['name', 'role', 'bio', 'location', 'email', 'github_url', 'linkedin_url'] as $field) {
            if (array_key_exists($field, $data)) {
                $val = is_string($data[$field]) ? trim($data[$field]) : $data[$field];
                $data[$field] = ($val === '' || $val === null) ? null : $val;
            }
        }

        // 3. Handle education array: if empty or only blanks, set to null / empty array
        $rawEducation = $request->input('education', []);
        if (is_array($rawEducation)) {
            $filtered = array_values(array_filter($rawEducation, function ($item) {
                if (!is_array($item)) return false;
                $school = trim($item['school'] ?? '');
                $major = trim($item['major'] ?? '');
                $period = trim($item['period'] ?? '');
                return $school !== '' || $major !== '' || $period !== '';
            }));
            $data['education'] = count($filtered) > 0 ? $filtered : null;
        } else {
            $data['education'] = null;
        }

        $profile->fill($data);
        $profile->save();

        Cache::forget('portfolio_home_payload');
        Cache::forget('portfolio_gemini_system_prompt');

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
