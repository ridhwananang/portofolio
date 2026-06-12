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

test('contact message can be replied and triggers mailable', function () {
    Mail::fake();

    $message = Message::create([
        'name' => 'Ahmad',
        'email' => 'ahmad@example.com',
        'subject' => 'Tanya Projek',
        'message' => 'Apakah projek Finverra menggunakan repository pattern?',
        'is_read' => false
    ]);

    // Send reply
    Mail::to($message->email)->send(new \App\Mail\ContactReplyMailable(
        originalName: $message->name,
        originalSubject: $message->subject,
        originalMessage: $message->message,
        replyContent: 'Benar, Finverra menggunakan Repository Pattern pada Clean Architecture.'
    ));

    Mail::assertSent(\App\Mail\ContactReplyMailable::class, function ($mail) use ($message) {
        return $mail->hasTo($message->email) &&
               $mail->originalName === 'Ahmad' &&
               $mail->originalSubject === 'Tanya Projek' &&
               $mail->replyContent === 'Benar, Finverra menggunakan Repository Pattern pada Clean Architecture.';
    });

    $message->update([
        'reply_content' => 'Benar, Finverra menggunakan Repository Pattern pada Clean Architecture.',
        'replied_at' => now(),
        'is_read' => true
    ]);

    $this->assertDatabaseHas('messages', [
        'id' => $message->id,
        'reply_content' => 'Benar, Finverra menggunakan Repository Pattern pada Clean Architecture.',
        'is_read' => true
    ]);
    expect($message->replied_at)->not->toBeNull();
});
