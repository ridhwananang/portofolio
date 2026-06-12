<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReplyMailable extends Mailable
{
    use Queueable, SerializesModels;

    public string $originalName;
    public string $originalSubject;
    public string $originalMessage;
    public string $replyContent;

    /**
     * Create a new message instance.
     */
    public function __construct(string $originalName, ?string $originalSubject, string $originalMessage, string $replyContent)
    {
        $this->originalName = $originalName;
        $this->originalSubject = $originalSubject ?? 'Hubungi Saya';
        $this->originalMessage = $originalMessage;
        $this->replyContent = $replyContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Balasan: ' . $this->originalSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-reply',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
