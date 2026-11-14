<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ServicePackage;
use App\Models\TechStack;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Menampilkan halaman showcase portofolio publik dengan caching performa tinggi.
     */
    public function index(): Response
    {
        $payload = Cache::remember('portfolio_home_payload', 3600, function () {
            $disk = config('filesystems.default');

            // 1. Profil Pengembang
            $profile = Profile::first();
            $profileData = null;
            if ($profile) {
                $profileArray = $profile->toArray();
                $profileArray['image'] = ($profile->image && ! str_starts_with($profile->image, '/') && ! str_starts_with($profile->image, 'http'))
                    ? Storage::disk($disk)->url($profile->image)
                    : $profile->image;
                $profileData = $profileArray;
            }

            // 2. Daftar Karya & Proyek
            $projectsData = Project::orderBy('id', 'asc')->get()->map(function ($project) use ($disk) {
                $image = $project->image;
                if ($image && ! str_starts_with($image, '/') && ! str_starts_with($image, 'http')) {
                    $image = Storage::disk($disk)->url($image);
                }

                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'tags' => is_string($project->tech_stack)
                        ? (json_decode($project->tech_stack, true) ?: [])
                        : (is_array($project->tech_stack) ? $project->tech_stack : []),
                    'mockup_type' => $project->mockup_type ?? 'browser',
                    'image' => $image ?: '/images/finverra.png',
                    'image_url' => $image,
                ];
            })->values()->toArray();

            // 3. Keahlian & Tech Stack
            $techStacksData = TechStack::all()->map(function ($stack) {
                return [
                    'id' => $stack->id,
                    'name' => $stack->name,
                    'description' => $stack->description,
                    'badge' => $stack->badge,
                    'color' => $stack->color,
                    'text_color' => $stack->text_color,
                    'accent' => $stack->accent,
                    'icon_name' => $stack->icon_name,
                ];
            })->values()->toArray();

            // 4. Sertifikasi & Kelulusan (Cloud Bucket / Asset Storage Ready)
            $certificatesData = Certificate::orderBy('id', 'asc')->get()->map(function ($cert) use ($disk) {
                $path = $cert->file_path;
                $fileUrl = null;
                $thumbnailUrl = null;

                if ($path) {
                    $filename = basename($path);
                    $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';

                    // 1. Storage disk certificates/thumbnails (Cloud Storage / S3 ready)
                    if (Storage::disk($disk)->exists('certificates/thumbnails/' . $thumbnailName)) {
                        $thumbnailUrl = Storage::disk($disk)->url('certificates/thumbnails/' . $thumbnailName);
                    } elseif (!str_starts_with($path, '/') && !str_starts_with($path, 'http')) {
                        $extension = pathinfo($path, PATHINFO_EXTENSION);
                        $thumbPathStorage = str_replace('.' . $extension, '_thumb.webp', $path);
                        if (Storage::disk($disk)->exists($thumbPathStorage)) {
                            $thumbnailUrl = Storage::disk($disk)->url($thumbPathStorage);
                        }
                    } elseif (file_exists(public_path('images/Sertifikat/thumbnails/' . $thumbnailName))) {
                        $thumbnailUrl = '/images/Sertifikat/thumbnails/' . $thumbnailName;
                    }

                    if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                        $fileUrl = $path;
                    } else {
                        $fileUrl = Storage::disk($disk)->url($path);
                    }

                    if (! $thumbnailUrl) {
                        $thumbnailUrl = $fileUrl;
                    }
                }

                $skills = is_string($cert->skills)
                    ? (json_decode($cert->skills, true) ?: [])
                    : (is_array($cert->skills) ? $cert->skills : []);

                return [
                    'id' => $cert->id,
                    'title' => $cert->title,
                    'category' => $cert->category,
                    'issuer' => $cert->issuer,
                    'credential_id' => $cert->credential_id,
                    'date' => $cert->date,
                    'duration' => $cert->duration,
                    'skills' => $skills,
                    'file_path' => $cert->file_path,
                    'file_url' => $fileUrl,
                    'thumbnail_url' => $thumbnailUrl,
                ];
            })->values()->toArray();

            // 5. Paket Layanan Website Aktif
            $packagesData = ServicePackage::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->values()
                ->toArray();

            return [
                'initialProfile' => $profileData,
                'initialProjects' => $projectsData,
                'initialTechStacks' => $techStacksData,
                'initialCertificates' => $certificatesData,
                'initialPackages' => $packagesData,
            ];
        });

        return Inertia::render('welcome', $payload);
    }
}
