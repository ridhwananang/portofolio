<?php

namespace App\Http\Controllers\Studio\Pms;

use App\Http\Controllers\Controller;
use App\Models\Pms\PmsActivityLog;
use App\Models\Pms\PmsAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PmsAttachmentController extends Controller
{
    /**
     * Store new file attachment.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'project_id' => ['nullable', 'exists:pms_projects,id'],
            'task_id' => ['nullable', 'exists:pms_tasks,id'],
            'file' => ['required', 'file', 'max:20480'], // max 20MB
        ]);

        $projectId = $validated['project_id'] ?? null;
        $taskId = $validated['task_id'] ?? null;
        if (! $projectId && $taskId) {
            $task = \App\Models\Pms\PmsTask::find($taskId);
            $projectId = $task?->project_id;
            $validated['project_id'] = $projectId;
        }

        if ($user && !$user->isAdmin()) {
            if ($projectId) {
                $isMember = \App\Models\Pms\PmsProjectMember::where('project_id', $projectId)
                    ->where('user_id', $user->id)
                    ->exists();
                if (!$isMember) {
                    abort(403, 'Akses ditolak. Anda bukan anggota dari proyek ini.');
                }
            }

            // WORKFLOW RULE: Tugas anggota tim lain bersifat Read-Only.
            // Bukti pengerjaan / deliverable hanya dapat diunggah oleh penanggung jawab tugas terkait.
            if ($taskId) {
                $task = \App\Models\Pms\PmsTask::find($taskId);
                if ($task && $task->assigned_to !== null && $task->assigned_to !== $user->id) {
                    abort(403, 'Akses ditolak. Tugas milik anggota tim lain bersifat Read-Only dan bukti pengerjaan hanya dapat diunggah oleh penanggung jawab tugas.');
                }
            }
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileType = $file->getClientOriginalExtension();
        $disk = config('filesystems.default');
        $filePath = $file->store('pms_attachments', $disk);

        $attachment = PmsAttachment::create([
            'project_id' => $validated['project_id'] ?? null,
            'task_id' => $validated['task_id'] ?? null,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'file_type' => $fileType,
            'uploaded_by' => auth()->id(),
        ]);

        $taskTitle = $attachment->task?->title;
        $description = $taskTitle
            ? "Mengunggah berkas bukti tugas #{$attachment->task_id} ({$taskTitle}): {$fileName}"
            : "Mengunggah lampiran berkas proyek: {$fileName}";

        PmsActivityLog::log(
            action: 'created',
            entityType: 'attachment',
            description: $description,
            projectId: $attachment->project_id
        );

        return back()->with('success', "Berkas {$fileName} berhasil diunggah.");
    }

    /**
     * Delete an attachment.
     */
    public function destroy(Request $request, PmsAttachment $attachment): RedirectResponse
    {
        $user = $request->user();
        if ($user && !$user->isAdmin() && $attachment->uploaded_by !== $user->id) {
            abort(403, 'Anda hanya dapat menghapus lampiran berkas yang Anda unggah sendiri.');
        }

        $fileName = $attachment->file_name;
        $projectId = $attachment->project_id;
        $disk = config('filesystems.default');

        if ($attachment->file_path && !str_starts_with($attachment->file_path, '/') && !str_starts_with($attachment->file_path, 'http') && Storage::disk($disk)->exists($attachment->file_path)) {
            Storage::disk($disk)->delete($attachment->file_path);
        }

        $attachment->delete();

        PmsActivityLog::log(
            action: 'deleted',
            entityType: 'attachment',
            description: "Menghapus lampiran berkas: {$fileName}",
            projectId: $projectId
        );

        return back()->with('success', "Berkas {$fileName} berhasil dihapus.");
    }
}
