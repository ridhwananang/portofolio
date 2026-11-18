<?php

namespace App\Mail;

use App\Models\Pms\PmsProject;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PmsProgressReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public PmsProject $project;
    public string $portalUrl;
    public array $summaryData;

    /**
     * Create a new message instance.
     */
    public function __construct(PmsProject $project, string $portalUrl, array $summaryData = [])
    {
        $this->project = $project;
        $this->portalUrl = $portalUrl;
        $this->summaryData = $summaryData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $progress = $this->project->progress_percentage;
        return new Envelope(
            subject: "[Laporan Progres] Pembaruan Proyek: {$this->project->name} ({$progress}% Selesai)",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.pms.progress-report',
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
