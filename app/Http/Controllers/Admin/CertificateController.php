<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CertificateRequest;
use App\Models\Certificate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(): Response
    {
        $certificates = Certificate::orderBy('id', 'desc')->get()->map(function ($cert) {
            $path = $cert->file_path;
            if ($path) {
                if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $cert->file_url = $path;
                    $filename = basename($path);
                    $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';
                    $thumbnailPath = 'images/Sertifikat/thumbnails/' . $thumbnailName;
                    $cert->thumbnail_url = file_exists(public_path($thumbnailPath)) ? '/' . $thumbnailPath : $cert->file_url;
                } else {
                    $cert->file_url = Storage::disk('public')->url($path);
                    $extension = pathinfo($path, PATHINFO_EXTENSION);
                    $thumbPathStorage = str_replace('.' . $extension, '_thumb.webp', $path);
                    $cert->thumbnail_url = Storage::disk('public')->exists($thumbPathStorage)
                        ? Storage::disk('public')->url($thumbPathStorage)
                        : $cert->file_url;
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

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('certificates', 'public');
        }
        unset($data['file']);

        Certificate::create($data);

        return redirect()->route('admin.certificates.index')->with('success', 'Sertifikat berhasil ditambahkan.');
    }

    public function edit(Certificate $certificate): Response
    {
        $path = $certificate->file_path;
        if ($path) {
            $certificate->file_url = str_starts_with($path, 'http') || str_starts_with($path, '/')
                ? $path
                : Storage::disk('public')->url($path);
        }

        return Inertia::render('admin/certificates/edit', [
            'certificate' => $certificate,
        ]);
    }

    public function update(CertificateRequest $request, Certificate $certificate): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('file')) {
            // Delete old file and thumbnail
            if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
                Storage::disk('public')->delete($certificate->file_path);
                $extension = pathinfo($certificate->file_path, PATHINFO_EXTENSION);
                $oldThumb = str_replace('.' . $extension, '_thumb.webp', $certificate->file_path);
                if (Storage::disk('public')->exists($oldThumb)) {
                    Storage::disk('public')->delete($oldThumb);
                }
            }

            $data['file_path'] = $request->file('file')->store('certificates', 'public');
        }
        unset($data['file']);

        $certificate->update($data);

        return redirect()->route('admin.certificates.index')->with('success', 'Sertifikat berhasil diperbarui.');
    }

    public function destroy(Certificate $certificate): RedirectResponse
    {
        if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
            Storage::disk('public')->delete($certificate->file_path);
            $extension = pathinfo($certificate->file_path, PATHINFO_EXTENSION);
            $oldThumb = str_replace('.' . $extension, '_thumb.webp', $certificate->file_path);
            if (Storage::disk('public')->exists($oldThumb)) {
                Storage::disk('public')->delete($oldThumb);
            }
        }

        $certificate->delete();

        return redirect()->route('admin.certificates.index')->with('success', 'Sertifikat berhasil dihapus.');
    }
}
