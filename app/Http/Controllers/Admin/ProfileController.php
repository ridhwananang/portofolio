<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProfileRequest;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
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
                $profile->image_url = Storage::disk('public')->url($profile->image);
            } else {
                $profile->image_url = $profile->image;
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

        if ($request->hasFile('image')) {
            if ($profile->image && Storage::disk('public')->exists($profile->image)) {
                Storage::disk('public')->delete($profile->image);
            }
            $data['image'] = $request->file('image')->store('profiles', 'public');
        } else {
            unset($data['image']);
        }

        $profile->fill($data);
        $profile->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
