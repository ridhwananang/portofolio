<?php
 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = [
        'title',
        'category',
        'issuer',
        'credential_id',
        'date',
        'duration',
        'skills',
        'file_path',
    ];

    protected $casts = [
        'skills' => 'array',
    ];

    /**
     * Bootstrap the model and register events.
     */
    protected static function booted(): void
    {
        static::saved(function (Certificate $certificate) {
            if ($certificate->wasChanged('file_path')) {
                $path = $certificate->file_path;
                
                // Only process PDF files
                if ($path && strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'pdf') {
                    // Check if Imagick is available (default on Laravel Cloud/Vapor PHP runtime)
                    if (class_exists('Imagick')) {
                        try {
                            $disk = 'public'; // disk configured in Filament
                            
                            // Check if file exists on disk
                            if (\Illuminate\Support\Facades\Storage::disk($disk)->exists($path)) {
                                $pdfContent = \Illuminate\Support\Facades\Storage::disk($disk)->get($path);
                                
                                // Write to a temporary file (Vapor /tmp is writable)
                                $tempPdf = tempnam(sys_get_temp_dir(), 'pdf_');
                                file_put_contents($tempPdf, $pdfContent);
                                
                                // Initialize Imagick and render first page
                                $imagick = new \Imagick();
                                $imagick->setResolution(150, 150); // 150 DPI
                                $imagick->readImage($tempPdf . '[0]'); // '[0]' means first page
                                $imagick->setImageFormat('webp');
                                $imagick->setImageCompressionQuality(80);
                                
                                // Get WebP image blob
                                $webpContent = $imagick->getImageBlob();
                                
                                // Define thumbnail path
                                $thumbnailPath = str_replace('.pdf', '_thumb.webp', $path);
                                
                                // Save WebP to the same storage disk
                                \Illuminate\Support\Facades\Storage::disk($disk)->put($thumbnailPath, $webpContent);
                                
                                // Cleanup
                                $imagick->clear();
                                $imagick->destroy();
                                @unlink($tempPdf);
                                
                                \Illuminate\Support\Facades\Log::info("Generated WebP thumbnail: {$path} -> {$thumbnailPath}");
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error("Failed to generate PDF thumbnail: " . $e->getMessage());
                        }
                    } else {
                        \Illuminate\Support\Facades\Log::warning("Imagick extension is not installed. Dynamic PDF thumbnail generation skipped.");
                    }
                }
            }
        });
    }
}
