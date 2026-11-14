<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SyncStorageToS3Command extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:sync-to-s3 {--force : Overwrite existing files on S3}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync all local public files from storage/app/public to the configured S3 / Laravel Cloud bucket';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting file synchronization from local "public" disk to "s3" disk...');

        $localDisk = Storage::disk('public');
        $s3Disk = Storage::disk('s3');

        $files = $localDisk->allFiles();

        if (empty($files)) {
            $this->warn('No files found in local storage/app/public.');
            return self::SUCCESS;
        }

        $this->info(sprintf('Found %d file(s) in local storage/app/public.', count($files)));

        $bar = $this->output->createProgressBar(count($files));
        $bar->start();

        $uploaded = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($files as $file) {
            try {
                if (! $this->option('force') && $s3Disk->exists($file)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $content = $localDisk->get($file);
                $mimeType = $localDisk->mimeType($file);

                $s3Disk->put($file, $content, [
                    'visibility' => 'public',
                    'ContentType' => $mimeType,
                ]);

                $uploaded++;
            } catch (\Throwable $e) {
                $failed++;
                $this->newLine();
                $this->error(sprintf('Failed to upload "%s": %s', $file, $e->getMessage()));
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Files', count($files)],
                ['Uploaded', $uploaded],
                ['Skipped (already exists)', $skipped],
                ['Failed', $failed],
            ]
        );

        $this->info('Storage synchronization completed successfully.');

        return self::SUCCESS;
    }
}
