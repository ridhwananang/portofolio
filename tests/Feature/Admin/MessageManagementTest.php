<?php

use App\Mail\ContactReplyMailable;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

test('admin can toggle message read status', function () {
    $message = Message::create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'subject' => 'Pertanyaan Proyek',
        'message' => 'Halo, apakah tersedia untuk freelance?',
        'is_read' => false,
    ]);

    $this->actingAs($this->admin)->patch(route('admin.messages.toggle-read', $message));
    expect($message->fresh()->is_read)->toBeTrue();

    $this->actingAs($this->admin)->patch(route('admin.messages.toggle-read', $message));
    expect($message->fresh()->is_read)->toBeFalse();
});

test('admin can reply to a message via email', function () {
    Mail::fake();

    $message = Message::create([
        'name' => 'Jane Smith',
        'email' => 'jane@example.com',
        'subject' => 'Kolaborasi',
        'message' => 'Saya tertarik untuk berkolaborasi dalam proyek web.',
        'is_read' => false,
    ]);

    $response = $this->actingAs($this->admin)->post(route('admin.messages.reply', $message), [
        'subject' => 'Balasan: Kolaborasi',
        'reply_content' => 'Terima kasih atas tawarannya, mari kita diskusikan lebih lanjut.',
    ]);

    $response->assertSessionHasNoErrors();
    $fresh = $message->fresh();
    expect($fresh->is_read)->toBeTrue();
    expect($fresh->reply_content)->toBe('Terima kasih atas tawarannya, mari kita diskusikan lebih lanjut.');
    expect($fresh->replied_at)->not->toBeNull();

    Mail::assertSent(ContactReplyMailable::class, function ($mail) use ($message) {
        return $mail->hasTo('jane@example.com');
    });
});
