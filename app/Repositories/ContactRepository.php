<?php

namespace App\Repositories;

use App\Models\Message;

class ContactRepository implements ContactRepositoryInterface
{
    /**
     * Store a new contact message.
     *
     * @param array $data
     * @return Message
     */
    public function store(array $data): Message
    {
        return Message::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'is_read' => false,
        ]);
    }
}
