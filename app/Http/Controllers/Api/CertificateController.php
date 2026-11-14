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
            if ($path) {
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $cert->file_url = $path;
                    $cert->download_url = $path;
                    $cert->thumbnail_url = $path;
                } else {
                    $cert->file_url = route('certificates.view', $cert->id);
                    $cert->download_url = route('certificates.download', $cert->id);
                    $cert->thumbnail_url = route('certificates.thumbnail', $cert->id);
                }
            } else {
                $cert->file_url = null;
                $cert->download_url = null;
                $cert->thumbnail_url = null;
            }
            return $cert;
        });

        return response()->json($certificates);
    }
}
