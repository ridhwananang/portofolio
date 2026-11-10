<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplyMessageRequest;
use App\Mail\ContactReplyMailable;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $threads = $this->getThreadsData($request);
        $paginatedMessages = Message::query()->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/messages/index', [
            'threads' => $threads,
            'messages' => $paginatedMessages,
            'filters' => $request->only(['search', 'filter']),
            'unreadCount' => Message::where('is_read', false)->count(),
        ]);
    }

    /**
     * Real-time polling endpoint for Studio Messages.
     * Returns JSON of updated threads and unread count without full page load.
     */
    public function sync(Request $request): \Illuminate\Http\JsonResponse
    {
        $threads = $this->getThreadsData($request);

        return response()->json([
            'threads' => $threads,
            'unreadCount' => Message::where('is_read', false)->count(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Helper to retrieve and format conversation threads.
     */
    protected function getThreadsData(Request $request)
    {
        $query = Message::query()->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('reply_content', 'like', "%{$search}%");
            });
        }

        $allMatchingMessages = $query->get();

        // Group messages by sender email into unified conversation threads
        $grouped = $allMatchingMessages->groupBy(function ($msg) {
            return strtolower(trim($msg->email));
        });

        $threads = $grouped->map(function ($msgs, $email) {
            $sortedMsgs = $msgs->sortBy('created_at')->values();
            $latestMsg = $sortedMsgs->last();
            $firstMsg = $sortedMsgs->first();

            $unreadCount = $msgs->where('is_read', false)->count();

            // Build chronological chat history items (visitor messages & Ridhwan replies)
            $items = [];
            foreach ($sortedMsgs as $m) {
                if (!empty(trim($m->message ?? ''))) {
                    $items[] = [
                        'id' => 'msg_' . $m->id,
                        'message_id' => $m->id,
                        'sender' => 'visitor',
                        'sender_name' => $m->name ?: 'Pengunjung',
                        'text' => $m->message,
                        'subject' => $m->subject,
                        'created_at' => $m->created_at->toISOString(),
                        'time' => $m->created_at->format('H.i'),
                        'date' => $m->created_at->translatedFormat('d M Y'),
                        'is_read' => $m->is_read,
                    ];
                }

                if (!empty(trim($m->reply_content ?? ''))) {
                    $repliedAt = $m->replied_at ?? $m->updated_at;
                    $items[] = [
                        'id' => 'reply_' . $m->id,
                        'message_id' => $m->id,
                        'sender' => 'admin',
                        'sender_name' => 'Ridhwan (Anda)',
                        'text' => $m->reply_content,
                        'subject' => $m->subject,
                        'created_at' => $repliedAt->toISOString(),
                        'time' => $repliedAt->format('H.i'),
                        'date' => $repliedAt->translatedFormat('d M Y'),
                        'is_read' => true,
                    ];
                }
            }

            usort($items, fn($a, $b) => strcmp($a['created_at'], $b['created_at']));

            $latestItem = !empty($items) ? end($items) : null;

            return [
                'id' => $latestMsg->id,
                'email' => $email,
                'name' => $firstMsg->name ?: 'Pengunjung',
                'subject' => $firstMsg->subject ?: ($latestMsg->subject ?: 'Percakapan Portofolio'),
                'latest_message' => $latestItem ? $latestItem['text'] : $latestMsg->message,
                'latest_sender' => $latestItem ? $latestItem['sender'] : 'visitor',
                'latest_time' => $latestMsg->created_at->format('d M H:i'),
                'latest_timestamp' => $latestMsg->created_at->toISOString(),
                'unread_count' => $unreadCount,
                'has_unread' => $unreadCount > 0,
                'is_read' => $unreadCount === 0,
                'total_messages' => count($items),
                'items' => $items,
                'raw_ids' => $msgs->pluck('id')->all(),
            ];
        })->values();

        // Apply filter tab
        if ($request->filled('filter')) {
            if ($request->filter === 'unread') {
                $threads = $threads->filter(fn ($t) => $t['unread_count'] > 0)->values();
            } elseif ($request->filter === 'read') {
                $threads = $threads->filter(fn ($t) => $t['unread_count'] === 0)->values();
            }
        }

        // Sort threads by latest message timestamp descending
        return $threads->sortByDesc('latest_timestamp')->values();
    }

    public function reply(ReplyMessageRequest $request, Message $message): RedirectResponse
    {
        $email = $message->email;
        $latestInThread = Message::where('email', $email)->latest()->first() ?? $message;
        $subject = $request->input('subject') ?: ('Balasan: ' . ($latestInThread->subject ?? 'Percakapan Portofolio'));

        if (empty($latestInThread->reply_content)) {
            $targetMessage = $latestInThread;
            $targetMessage->update([
                'reply_content' => $request->reply_content,
                'replied_at' => now(),
                'is_read' => true,
            ]);
        } else {
            $targetMessage = Message::create([
                'name' => $latestInThread->name,
                'email' => $latestInThread->email,
                'subject' => $latestInThread->subject ?: $subject,
                'message' => '',
                'reply_content' => $request->reply_content,
                'replied_at' => now(),
                'is_read' => true,
            ]);
        }

        // Mark all messages in this thread as read
        Message::where('email', $email)->update(['is_read' => true]);

        try {
            Mail::to($email)->send(new ContactReplyMailable(
                originalName: $latestInThread->name,
                originalSubject: $subject,
                originalMessage: $latestInThread->message ?: 'Pesan percakapan',
                replyContent: $request->reply_content
            ));
        } catch (\Throwable $e) {
            Log::warning('Email delivery failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Balasan berhasil dikirimkan.');
    }

    public function toggleRead(Message $message): RedirectResponse
    {
        $newStatus = !$message->is_read;
        Message::where('email', $message->email)->update([
            'is_read' => $newStatus,
        ]);

        return back()->with('success', 'Status pesan berhasil diperbarui.');
    }

    public function destroy(Message $message, Request $request): RedirectResponse
    {
        if ($request->boolean('all_thread') || $request->input('thread') === 'all') {
            Message::where('email', $message->email)->delete();
            return back()->with('success', 'Seluruh riwayat percakapan berhasil dihapus.');
        }

        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}
