<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplyMessageRequest;
use App\Mail\ContactReplyMailable;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Message::query()->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($request->filled('filter')) {
            if ($request->filter === 'unread') {
                $query->where('is_read', false);
            } elseif ($request->filter === 'replied') {
                $query->whereNotNull('replied_at');
            } elseif ($request->filter === 'unreplied') {
                $query->whereNull('replied_at');
            }
        }

        $messages = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/messages/index', [
            'messages' => $messages,
            'filters' => $request->only(['search', 'filter']),
            'unreadCount' => Message::where('is_read', false)->count(),
        ]);
    }

    public function reply(ReplyMessageRequest $request, Message $message): RedirectResponse
    {
        Mail::to($message->email)->send(new ContactReplyMailable(
            originalName: $message->name,
            originalSubject: $message->subject,
            originalMessage: $message->message,
            replyContent: $request->reply_content
        ));

        $message->update([
            'reply_content' => $request->reply_content,
            'replied_at' => now(),
            'is_read' => true,
        ]);

        return back()->with('success', 'Balasan berhasil dikirimkan ke email pengirim.');
    }

    public function toggleRead(Message $message): RedirectResponse
    {
        $message->update([
            'is_read' => !$message->is_read,
        ]);

        return back()->with('success', 'Status pesan berhasil diperbarui.');
    }

    public function destroy(Message $message): RedirectResponse
    {
        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
