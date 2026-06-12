<?php

namespace App\Repositories;

use App\Models\Message;

interface ContactRepositoryInterface
{
    /**
     * Store a new contact message.
     *
     * @param array $data
     * @return Message
     */
    public function store(array $data): Message;
}
