<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Repositories\ContactRepositoryInterface;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    protected ContactRepositoryInterface $contactRepository;

    /**
     * Inject ContactRepositoryInterface dependency.
     */
    public function __construct(ContactRepositoryInterface $contactRepository)
    {
        $this->contactRepository = $contactRepository;
    }

    /**
     * Store a new contact message.
     *
     * @param ContactRequest $request
     * @return JsonResponse
     */
    public function store(ContactRequest $request): JsonResponse
    {
        $message = $this->contactRepository->store($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Pesan Anda berhasil dikirim!',
            'data' => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'subject' => $message->subject,
                'timestamp' => $message->created_at->toISOString(),
            ]
        ], 201);
    }
}
