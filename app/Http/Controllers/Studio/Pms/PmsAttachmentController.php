<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsAttachment;
use App\Models\Pms\PmsProjectMember;
use App\Models\Pms\PmsTask;
use App\Services\Pms\PmsAttachmentStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PmsAttachmentController extends Controller
{
    public function __construct(private readonly PmsAttachmentStorage $storage)
    {
    }

    /**
     * Store one or multiple file attachments in S3 bucket storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'project_id' => ['nullable', 'exists:pms_projects,id'],
            'task_id' => ['nullable', 'exists:pms_tasks,id'],
            'file' => ['nullable', 'file', 'max:20480', 'required_without:files'],
            'files' => ['nullable', 'array', 'min:1', 'max:20', 'required_without:file'],
            'files.*' => ['required', 'file', 'max:20480'],
        ]);

        $projectId = $validated['project_id'] ?? null;
        $taskId = $validated['task_id'] ?? null;
        $task = $taskId ? PmsTask::find($taskId) : null;

        if (! $projectId && $task) {
            $projectId = $task->project_id;
            $validated['project_id'] = $projectId;
        }

        if ($user && ! $user->isAdmin()) {
            if ($projectId) {
                $isMember = PmsProjectMember::where('project_id', $projectId)
                    ->where('user_id', $user->id)
                    ->exists();
                if (! $isMember) {
                    abort(403, 'Akses ditolak. Anda bukan anggota dari proyek ini.');
                }
            }

            // WORKFLOW RULE: Tugas anggota tim lain bersifat Read-Only.
            // Bukti pengerjaan / deliverable hanya dapat diunggah oleh penanggung jawab tugas terkait.
            if ($task && $task->assigned_to !== null && $task->assigned_to !== $user->id) {
                abort(403, 'Akses ditolak. Tugas milik anggota tim lain bersifat Read-Only dan bukti pengerjaan hanya dapat diunggah oleh penanggung jawab tugas.');
            }
        }

        $uploadedFiles = [];
        if ($request->hasFile('files')) {
            foreach ((array) $request->file('files') as $item) {
                if ($item) {
                    $uploadedFiles[] = $item;
                }
            }
        }
        if ($request->hasFile('file') && $request->file('file')) {
            $uploadedFiles[] = $request->file('file');
        }

        $disk = PmsAttachment::storageDisk();
        $createdNames = [];

        foreach ($uploadedFiles as $file) {
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('pms_attachments', $disk);

            PmsAttachment::create([
                'project_id' => $validated['project_id'] ?? null,
                'task_id' => $validated['task_id'] ?? null,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientOriginalExtension(),
                'uploaded_by' => auth()->id(),
            ]);

            $createdNames[] = $fileName;
        }

        $count = count($createdNames);
        $namesSummary = implode(', ', array_slice($createdNames, 0, 3)) . ($count > 3 ? ' (+' . ($count - 3) . ' lainnya)' : '');
        $taskTitle = $task?->title;
        $description = $taskTitle
            ? "Mengunggah {$count} berkas bukti tugas #{$task->id} ({$taskTitle}): {$namesSummary}"
            : "Mengunggah {$count} lampiran berkas proyek: {$namesSummary}";

        PmsActivityLog::log(
            action: 'created',
            entityType: 'attachment',
            description: $description,
            projectId: $projectId ? (int) $projectId : null
        );

        $flash = $count > 1
            ? "{$count} berkas berhasil diunggah ke cloud storage."
            : "Berkas {$createdNames[0]} berhasil diunggah ke cloud storage.";

        return back()->with('success', $flash);
    }

    /**
     * Stream attachment inline for responsive preview without S3 CORS/iframe issues.
     */
    public function preview(Request $request, PmsAttachment $attachment): StreamedResponse|RedirectResponse
    {
        $this->authorizeReadAccess($request, $attachment);

        return $this->storage->stream($attachment, 'inline');
    }

    /**
     * Stream attachment as download preserving the original file name.
     */
    public function download(Request $request, PmsAttachment $attachment): StreamedResponse|RedirectResponse
    {
        $this->authorizeReadAccess($request, $attachment);

        return $this->storage->stream($attachment, 'attachment');
    }

    /**
     * Delete an attachment from S3 / fallback disk and database.
     */
    public function destroy(Request $request, PmsAttachment $attachment): RedirectResponse
    {
        $user = $request->user();
        if ($user && ! $user->isAdmin() && $attachment->uploaded_by !== $user->id) {
            abort(403, 'Anda hanya dapat menghapus lampiran berkas yang Anda unggah sendiri.');
        }

        $fileName = $attachment->file_name;
        $projectId = $attachment->project_id;

        $this->storage->delete($attachment);
        $attachment->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'attachment',
            description: "Menghapus lampiran berkas: {$fileName}",
            projectId: $projectId
        );

        return back()->with('success', "Berkas {$fileName} berhasil dihapus.");
    }

    private function authorizeReadAccess(Request $request, PmsAttachment $attachment): void
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if ($user->isAdmin() || ! $attachment->project_id) {
            return;
        }

        $isMember = PmsProjectMember::where('project_id', $attachment->project_id)
            ->where('user_id', $user->id)
            ->exists();

        if (! $isMember) {
            abort(403, 'Akses ditolak. Anda bukan anggota dari proyek ini.');
        }
    }
}
