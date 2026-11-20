<?php

namespace App\Services\Pms;

use App\Models\Pms\PmsAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PmsAttachmentStorage
{
    /**
     * Stream an attachment inline or as a forced download from S3 / fallback disk.
     */
    public function stream(PmsAttachment $attachment, string $disposition): StreamedResponse|RedirectResponse
    {
        $path = $attachment->file_path;
        if (! $path) {
            abort(404, 'Berkas lampiran tidak ditemukan.');
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return redirect()->away($path);
        }

        foreach ($this->candidateDisks() as $disk) {
            if (Storage::disk($disk)->exists($path)) {
                return Storage::disk($disk)->response(
                    $path,
                    $attachment->file_name,
                    [
                        'Cache-Control' => 'private, max-age=300',
                        'X-Content-Type-Options' => 'nosniff',
                    ],
                    $disposition
                );
            }
        }

        abort(404, 'Berkas lampiran tidak ditemukan di storage.');
    }

    /**
     * Delete physical file bytes from S3 and any fallback disk.
     */
    public function delete(PmsAttachment $attachment): void
    {
        $path = $attachment->file_path;
        if (! $path || str_starts_with($path, '/') || str_starts_with($path, 'http')) {
            return;
        }

        foreach ($this->candidateDisks() as $disk) {
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);
            }
        }
    }

    /**
     * @return list<string>
     */
    public function candidateDisks(): array
    {
        $disks = [PmsAttachment::storageDisk(), (string) config('filesystems.default'), 'local', 'public'];

        if (! app()->runningUnitTests() && filled(config('filesystems.disks.s3.bucket'))) {
            array_unshift($disks, 's3');
        }

        return array_values(array_unique(array_filter($disks)));
    }
}
