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

        if ($user && !$user->isAdmin()) {
            $projectId = $validated['project_id'] ?? null;
            if ($projectId) {
                $isMember = \App\Models\Pms\PmsProjectMember::where('project_id', $projectId)
                    ->where('user_id', $user->id)
                    ->exists();
                if (!$isMember) {
                    abort(403, 'Akses ditolak. Anda bukan anggota dari proyek ini.');
                }
            }
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileType = $file->getClientOriginalExtension();
        $filePath = $file->store('pms_attachments', 'public');

        $attachment = PmsAttachment::create([
            'project_id' => $validated['project_id'] ?? null,
            'task_id' => $validated['task_id'] ?? null,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'file_type' => $fileType,
            'uploaded_by' => auth()->id(),
        ]);

        PmsActivityLog::log(
            action: 'created',
            entityType: 'attachment',
            description: "Mengunggah lampiran berkas: {$fileName}",
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

        if ($attachment->file_path) {
            Storage::disk('public')->delete($attachment->file_path);
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
