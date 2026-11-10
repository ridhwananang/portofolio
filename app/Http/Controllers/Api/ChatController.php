<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected GeminiChatService $chatService;

    /**
     * Inject GeminiChatService dependency.
     */
    public function __construct(GeminiChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Handle the incoming chat message and delegate logic to GeminiChatService.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.sender' => 'required|in:user,bot,ridhwan,system',
            'messages.*.text' => 'required|string',
            'user_email' => 'nullable|email',
        ]);

        $responseText = $this->chatService->getChatResponse(
            $request->input('messages'),
            $request->input('user_email')
        );

        if (str_starts_with($responseText, '|||human_takeover|||')) {
            $payload = json_decode(substr($responseText, strlen('|||human_takeover|||')), true);

            return response()->json([
                'text' => $payload['text'] ?? '',
                'reply' => null,
                'human_takeover' => true,
                'whatsapp_url' => $payload['whatsapp_url'] ?? null,
            ]);
        }

        $parts = explode('|||reply|||', $responseText);

        return response()->json([
            'text' => trim($parts[0]),
            'reply' => isset($parts[1]) ? trim($parts[1]) : null,
            'human_takeover' => false,
        ]);
    }

    /**
     * Lightweight real-time sync endpoint for public chat widget.
     * Silently polls for new replies from Ridhwan without rate limits.
     */
    public function sync(Request $request): JsonResponse
    {
        $email = $request->query('email');
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'replies' => [],
                'latest_reply' => null,
            ]);
        }

        $records = \App\Models\Message::where('email', $email)
            ->whereNotNull('reply_content')
            ->where('reply_content', '!=', '')
            ->orderBy('replied_at', 'asc')
            ->get();

        $replies = $records->map(function ($r) {
            $time = $r->replied_at ?? $r->updated_at;
            return [
                'id' => 'reply_' . $r->id,
                'sender' => 'ridhwan',
                'text' => $r->reply_content,
                'time' => $time->format('H.i'),
                'created_at' => $time->toISOString(),
            ];
        })->values();

        $latest = $records->last();

        return response()->json([
            'replies' => $replies,
            'latest_reply' => $latest ? $latest->reply_content : null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
