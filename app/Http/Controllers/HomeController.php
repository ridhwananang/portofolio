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
            if ($profile && $profile->image && ! str_starts_with($profile->image, '/') && ! str_starts_with($profile->image, 'http')) {
                $profile->image = Storage::disk($disk)->url($profile->image);
            }

            // 2. Daftar Karya & Proyek
            $projects = Project::orderBy('id', 'asc')->get();
            foreach ($projects as $project) {
                if ($project->image && ! str_starts_with($project->image, '/') && ! str_starts_with($project->image, 'http')) {
                    $project->image = Storage::disk($disk)->url($project->image);
                }
            }

            // 3. Keahlian & Tech Stack
            $techStacks = TechStack::all();

            // 4. Sertifikasi & Kelulusan (Cloud Bucket / Asset Storage Ready)
            $certificates = Certificate::orderBy('id', 'asc')->get()->map(function ($cert) use ($disk) {
                $path = $cert->file_path;
                if ($path) {
                    if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                        $cert->file_url = $path;

                        // Check local public folder thumbnails for static assets
                        $filename = basename($path);
                        $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';
                        $thumbnailPath = 'images/Sertifikat/thumbnails/' . $thumbnailName;
                        if (file_exists(public_path($thumbnailPath))) {
                            $cert->thumbnail_url = '/' . $thumbnailPath;
                        } else {
                            $cert->thumbnail_url = $cert->file_url;
                        }
                    } else {
                        $cert->file_url = Storage::disk($disk)->url($path);

                        // Check cloud bucket storage for _thumb.webp
                        $extension = pathinfo($path, PATHINFO_EXTENSION);
                        $thumbPathStorage = str_replace('.' . $extension, '_thumb.webp', $path);
                        if (Storage::disk($disk)->exists($thumbPathStorage)) {
                            $cert->thumbnail_url = Storage::disk($disk)->url($thumbPathStorage);
                        } else {
                            $cert->thumbnail_url = $cert->file_url;
                        }
                    }
                } else {
                    $cert->file_url = null;
                    $cert->thumbnail_url = null;
                }

                return $cert;
            });

            // 5. Paket Layanan Website Aktif
            $packages = ServicePackage::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();

            return [
                'initialProfile' => $profile,
                'initialProjects' => $projects,
                'initialTechStacks' => $techStacks,
                'initialCertificates' => $certificates,
                'initialPackages' => $packages,
            ];
        });

        return Inertia::render('welcome', $payload);
    }
}
