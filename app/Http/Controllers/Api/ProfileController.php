<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * Display the profile details.
     */
    public function index(): JsonResponse
    {
        $profile = Profile::first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $disk = config('filesystems.default');
        if ($profile->image && !str_starts_with($profile->image, '/') && !str_starts_with($profile->image, 'http')) {
            $profile->image = \Illuminate\Support\Facades\Storage::disk($disk)->url($profile->image);
        }

        return response()->json($profile);
    }
}
