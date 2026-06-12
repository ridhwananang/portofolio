<?php

use App\Models\Profile;

test('chat api requires messages array', function () {
    $response = $this->postJson('/api/chat', []);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['messages']);
});

test('chat api returns fallback response when gemini key is not configured', function () {
    // Seed profile data
    Profile::create([
        'name' => 'Ridhwan Anang Ma\'ruf',
        'role' => 'Fullstack Web Developer',
        'bio' => 'Membangun Laravel + React.',
        'location' => 'Tangerang',
        'email' => 'ridhwan@test.com',
    ]);

    $payload = [
        'messages' => [
            [
                'sender' => 'user',
                'text' => 'Halo Ridhwan, apakah kamu menguasai laravel?'
            ]
        ]
    ];

    // Ensure services.gemini.key is empty for test fallback behavior
    config(['services.gemini.key' => null]);

    $response = $this->postJson('/api/chat', $payload);

    $response->assertStatus(200)
             ->assertJsonStructure(['text']);

    $text = $response->json('text');
    expect($text)->toContain('Ridhwan');
    expect($text)->toContain('Laravel');
});

test('chat api intercepts check reply intent and queries database', function () {
    // 1. Seed message with reply
    $message = \App\Models\Message::create([
        'name' => 'John Doe',
        'email' => 'john@test.com',
        'subject' => 'Tanya Projek',
        'message' => 'Apakah projek ini selesai?',
        'reply_content' => 'Ya, projek ini sudah selesai.',
        'replied_at' => now(),
        'is_read' => true
    ]);

    // Ensure services.gemini.key is empty for test fallback behavior
    config(['services.gemini.key' => null]);

    $payload = [
        'messages' => [
            [
                'sender' => 'user',
                'text' => 'Cek balasan pesan john@test.com'
            ]
        ]
    ];

    $response = $this->postJson('/api/chat', $payload);

    $response->assertStatus(200)
             ->assertJsonStructure(['text']);

    $text = $response->json('text');
    expect($text)->toContain('balasan langsung dari Ridhwan');
    expect($text)->toContain('Ya, projek ini sudah selesai.');
});

test('chat api returns pending message when no reply yet', function () {
    // 1. Seed message without reply
    $message = \App\Models\Message::create([
        'name' => 'Jane Doe',
        'email' => 'jane@test.com',
        'subject' => 'Tanya Kolaborasi',
        'message' => 'Halo Ridhwan, saya ingin berkolaborasi.',
        'is_read' => false
    ]);

    // Ensure services.gemini.key is empty for test fallback behavior
    config(['services.gemini.key' => null]);

    $payload = [
        'messages' => [
            [
                'sender' => 'user',
                'text' => 'cek status pesan saya untuk email jane@test.com'
            ]
        ]
    ];

    $response = $this->postJson('/api/chat', $payload);

    $response->assertStatus(200)
             ->assertJsonStructure(['text']);

    $text = $response->json('text');
    expect($text)->toContain('belum sempat membalasnya');
});

test('chat api returns not found message for unknown email', function () {
    // Ensure services.gemini.key is empty for test fallback behavior
    config(['services.gemini.key' => null]);

    $payload = [
        'messages' => [
            [
                'sender' => 'user',
                'text' => 'cek balasan untuk email unknown@test.com'
            ]
        ]
    ];

    $response = $this->postJson('/api/chat', $payload);

    $response->assertStatus(200)
             ->assertJsonStructure(['text']);

    $text = $response->json('text');
    expect($text)->toContain('tidak menemukan riwayat pesan');
});
