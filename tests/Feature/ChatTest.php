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
