<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;

class CertificateController extends Controller
{
    /**
     * Display a listing of the certificates.
     */
    public function index(): JsonResponse
    {
        $certificates = Certificate::orderBy('id', 'asc')->get()->map(function ($cert) {
            $path = $cert->file_path;
            $disk = config('filesystems.default');
            if ($path) {
                $filename = basename($path);
                $thumbnailName = pathinfo($filename, PATHINFO_FILENAME) . '.webp';

                // 1. Storage disk certificates/thumbnails (Cloud Storage / S3 ready)
                if (\Illuminate\Support\Facades\Storage::disk($disk)->exists('certificates/thumbnails/' . $thumbnailName)) {
                    $cert->thumbnail_url = \Illuminate\Support\Facades\Storage::disk($disk)->url('certificates/thumbnails/' . $thumbnailName);
                } elseif (!str_starts_with($path, '/') && !str_starts_with($path, 'http')) {
                    $extension = pathinfo($path, PATHINFO_EXTENSION);
                    $thumbPathStorage = str_replace('.' . $extension, '_thumb.webp', $path);
                    if (\Illuminate\Support\Facades\Storage::disk($disk)->exists($thumbPathStorage)) {
                        $cert->thumbnail_url = \Illuminate\Support\Facades\Storage::disk($disk)->url($thumbPathStorage);
                    }
                } elseif (file_exists(public_path('images/Sertifikat/thumbnails/' . $thumbnailName))) {
                    $cert->thumbnail_url = '/images/Sertifikat/thumbnails/' . $thumbnailName;
                }

                if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $cert->file_url = $path;
                } else {
                    $cert->file_url = \Illuminate\Support\Facades\Storage::disk($disk)->url($path);
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

        return response()->json($certificates);
    }
}
