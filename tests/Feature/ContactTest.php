<?php

use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('contact api requires name, email, and message', function () {
    $response = $this->postJson('/api/contact', []);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['name', 'email', 'message']);
});

test('contact api validates email format', function () {
    $response = $this->postJson('/api/contact', [
        'name' => 'John Doe',
        'email' => 'invalid-email',
        'message' => 'Hello there, this is a message.'
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['email']);
});

test('contact api saves message and returns success response', function () {
    $payload = [
        'name' => 'Robby Hartono',
        'email' => 'robby@perusahaan.com',
        'subject' => 'Penawaran Kolaborasi Projek',
        'message' => 'Halo Ridhwan, saya tertarik untuk mendiskusikan pengembangan backend bersama Anda.'
    ];

    $response = $this->postJson('/api/contact', $payload);

    $response->assertStatus(201)
             ->assertJson([
                 'success' => true,
                 'message' => 'Pesan Anda berhasil dikirim!',
             ])
             ->assertJsonStructure([
                 'data' => ['id', 'name', 'email', 'subject', 'timestamp']
             ]);

    $this->assertDatabaseHas('messages', [
        'name' => 'Robby Hartono',
        'email' => 'robby@perusahaan.com',
        'subject' => 'Penawaran Kolaborasi Projek',
        'message' => 'Halo Ridhwan, saya tertarik untuk mendiskusikan pengembangan backend bersama Anda.',
        'is_read' => false
    ]);
});
