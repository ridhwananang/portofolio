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
            'messages.*.sender' => 'required|in:user,bot',
            'messages.*.text' => 'required|string',
        ]);

        $responseText = $this->chatService->getChatResponse($request->input('messages'));

        return response()->json(['text' => $responseText]);
    }
}
