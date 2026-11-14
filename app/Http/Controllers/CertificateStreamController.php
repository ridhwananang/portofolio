<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CertificateStreamController extends Controller
{
    /**
     * Download the certificate PDF securely with a clean filename.
     * Keeps the raw Object Storage (FLS / S3) bucket URL completely hidden from the public.
     */
    public function download(Certificate $certificate)
    {
        $path = $certificate->file_path;
        if (! $path) {
            abort(404, 'Berkas sertifikat tidak ditemukan.');
        }

        // If it is an external URL (e.g. credential verification external link)
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return redirect()->away($path);
        }

        $disk = $this->resolveDisk($path);

        if (! Storage::disk($disk)->exists($path)) {
            abort(404, 'Berkas fisik sertifikat tidak ditemukan di penyimpanan.');
        }

        $cleanTitle = preg_replace('/[^\p{L}\p{N}\s\-_()]/u', '', $certificate->title);
        $cleanTitle = trim(preg_replace('/\s+/', ' ', $cleanTitle));
        $downloadFilename = ($cleanTitle ?: 'Sertifikat') . '.pdf';

        return Storage::disk($disk)->download($path, $downloadFilename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * View/stream the certificate PDF inline for browser viewing / new tab.
     */
    public function view(Certificate $certificate)
    {
        $path = $certificate->file_path;
        if (! $path) {
            abort(404, 'Berkas sertifikat tidak ditemukan.');
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return redirect()->away($path);
        }

        $disk = $this->resolveDisk($path);

        if (! Storage::disk($disk)->exists($path)) {
            abort(404, 'Berkas fisik sertifikat tidak ditemukan di penyimpanan.');
        }

        $cleanTitle = preg_replace('/[^\p{L}\p{N}\s\-_()]/u', '', $certificate->title);
        $cleanTitle = trim(preg_replace('/\s+/', ' ', $cleanTitle));
        $inlineFilename = ($cleanTitle ?: 'Sertifikat') . '.pdf';

        return Storage::disk($disk)->response($path, $inlineFilename, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . addslashes($inlineFilename) . '"',
        ]);
    }

    /**
     * Stream the certificate thumbnail WebP with public caching headers.
     */
    public function thumbnail(Certificate $certificate)
    {
        $path = $certificate->file_path;
        if (! $path) {
            abort(404);
        }

        $filename = basename($path);
        $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';
        $thumbPath = 'certificates/thumbnails/' . $thumbnailName;

        $disk = $this->resolveDisk($thumbPath);

        if (! Storage::disk($disk)->exists($thumbPath)) {
            abort(404);
        }

        return Storage::disk($disk)->response($thumbPath, $thumbnailName, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=86400, stale-while-revalidate=604800',
        ]);
    }

    /**
     * Resolve the active storage disk where the file exists.
     */
    protected function resolveDisk(string $path): string
    {
        $defaultDisk = config('filesystems.default');

        if (Storage::disk($defaultDisk)->exists($path)) {
            return $defaultDisk;
        }

        if (Storage::disk('public')->exists($path)) {
            return 'public';
        }

        if (Storage::disk('s3')->exists($path)) {
            return 's3';
        }

        return $defaultDisk;
    }
}
