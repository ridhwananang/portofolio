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
                if (str_starts_with($path, '/') || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $cert->file_url = $path;
                } else {
                    $cert->file_url = \Illuminate\Support\Facades\Storage::url($path);
                }
            } else {
                $cert->file_url = null;
            }
            return $cert;
        });

        return response()->json($certificates);
    }
}
