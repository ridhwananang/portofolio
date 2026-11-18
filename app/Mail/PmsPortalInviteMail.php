<?php

namespace App\Mail;

use App\Models\Pms\PmsProject;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PmsPortalInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public PmsProject $project;
    public string $portalUrl;
    public ?string $pin;

    /**
     * Create a new message instance.
     */
    public function __construct(PmsProject $project, string $portalUrl, ?string $pin = null)
    {
        $this->project = $project;
        $this->portalUrl = $portalUrl;
        $this->pin = $pin;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[Akses Rahasia] Portal Pantau Proyek: {$this->project->name} ({$this->project->code})",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.pms.portal-invite',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
