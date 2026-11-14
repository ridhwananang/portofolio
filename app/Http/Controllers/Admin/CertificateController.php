<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CertificateRequest;
use App\Models\Certificate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(): Response
    {
        $disk = config('filesystems.default');
        $certificates = Certificate::orderBy('id', 'desc')->get()->map(function ($cert) use ($disk) {
            $path = $cert->file_path;
            if ($path) {
                $filename = basename($path);
                $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';

                // 1. Storage disk certificates/thumbnails (Cloud Storage / S3 ready)
                if (Storage::disk($disk)->exists('certificates/thumbnails/' . $thumbnailName)) {
                    $cert->thumbnail_url = Storage::disk($disk)->url('certificates/thumbnails/' . $thumbnailName);
                } elseif (!str_starts_with($path, '/') && !str_starts_with($path, 'http')) {
                    $extension = pathinfo($path, PATHINFO_EXTENSION);
                    $thumbPathStorage = str_replace('.' . $extension, '_thumb.webp', $path);
                    if (Storage::disk($disk)->exists($thumbPathStorage)) {
                        $cert->thumbnail_url = Storage::disk($disk)->url($thumbPathStorage);
                    }
                } elseif (file_exists(public_path('images/Sertifikat/thumbnails/' . $thumbnailName))) {
                    $cert->thumbnail_url = '/images/Sertifikat/thumbnails/' . $thumbnailName;
                }

                if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $cert->file_url = $path;
                } else {
                    $cert->file_url = Storage::disk($disk)->url($path);
                }

                if (! $cert->thumbnail_url) {
                    $cert->thumbnail_url = $cert->file_url;
                }
            } else {
                $cert->file_url = null;
                $cert->thumbnail_url = null;
            }
            return $cert;
        });

        return Inertia::render('admin/certificates/index', [
            'certificates' => $certificates,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/certificates/create');
    }

    public function store(CertificateRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $disk = config('filesystems.default');

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('certificates', $disk);
        }
        unset($data['file']);

        Certificate::create($data);

        Cache::forget('portfolio_home_payload');

        return redirect()->route('admin.certificates.index')->with('success', 'Sertifikat berhasil ditambahkan.');
    }

    public function edit(Certificate $certificate): Response
    {
        $path = $certificate->file_path;
        $disk = config('filesystems.default');
        if ($path) {
            $certificate->file_url = str_starts_with($path, 'http') || str_starts_with($path, '/')
                ? $path
                : Storage::disk($disk)->url($path);
        }

        return Inertia::render('admin/certificates/edit', [
            'certificate' => $certificate,
        ]);
    }

    public function update(CertificateRequest $request, Certificate $certificate): RedirectResponse
    {
        $data = $request->validated();
        $disk = config('filesystems.default');

        if ($request->hasFile('file')) {
            // Delete old file and thumbnail
            if ($certificate->file_path && !str_starts_with($certificate->file_path, '/') && !str_starts_with($certificate->file_path, 'http') && Storage::disk($disk)->exists($certificate->file_path)) {
                Storage::disk($disk)->delete($certificate->file_path);
                $extension = pathinfo($certificate->file_path, PATHINFO_EXTENSION);
                $oldThumb = str_replace('.' . $extension, '_thumb.webp', $certificate->file_path);
                if (Storage::disk($disk)->exists($oldThumb)) {
                    Storage::disk($disk)->delete($oldThumb);
                }
            }

            $data['file_path'] = $request->file('file')->store('certificates', $disk);
        }
        unset($data['file']);

        $certificate->update($data);

        Cache::forget('portfolio_home_payload');

        return redirect()->route('admin.certificates.index')->with('success', 'Sertifikat berhasil diperbarui.');
    }

    public function destroy(Certificate $certificate): RedirectResponse
    {
        $disk = config('filesystems.default');
        if ($certificate->file_path && !str_starts_with($certificate->file_path, '/') && !str_starts_with($certificate->file_path, 'http') && Storage::disk($disk)->exists($certificate->file_path)) {
            Storage::disk($disk)->delete($certificate->file_path);
            $extension = pathinfo($certificate->file_path, PATHINFO_EXTENSION);
            $oldThumb = str_replace('.' . $extension, '_thumb.webp', $certificate->file_path);
            if (Storage::disk($disk)->exists($oldThumb)) {
                Storage::disk($disk)->delete($oldThumb);
            }
        }

        $certificate->delete();

        Cache::forget('portfolio_home_payload');

        return redirect()->route('admin.certificates.index')->with('success', 'Sertifikat berhasil dihapus.');
    }
}
