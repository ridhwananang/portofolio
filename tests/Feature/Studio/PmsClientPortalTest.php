<?php

namespace Tests\Feature\Studio;

use App\Mail\PmsPortalInviteMail;
use App\Mail\PmsProgressReportMail;
use App\Models\Pms\PmsAttachment;
use App\Models\Pms\PmsProject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PmsClientPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_access_client_portal_with_valid_token(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Portal Test Project',
            'code' => 'PRJ-PORTAL-01',
            'client' => 'PT Mitra Sejahtera',
            'client_email' => 'client@mitra.com',
            'portal_token' => 'test-token-1234567890',
            'portal_pin' => '889900',
            'is_portal_active' => true,
        ]);

        // 1. First visit requires PIN
        $response = $this->get("/portal/pms/{$project->portal_token}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('portal/pms/show')
            ->where('requires_pin', true)
            ->where('is_verified', false)
            ->where('project_summary.name', 'Portal Test Project')
        );

        // 2. Submit wrong PIN
        $wrongPinResponse = $this->post("/portal/pms/{$project->portal_token}/verify-pin", [
            'pin' => '111111',
        ]);
        $wrongPinResponse->assertSessionHasErrors('pin');

        // 3. Submit correct PIN
        $correctPinResponse = $this->post("/portal/pms/{$project->portal_token}/verify-pin", [
            'pin' => '889900',
        ]);
        $correctPinResponse->assertSessionHasNoErrors();

        // 4. Follow up access is now verified in session
        $verifiedResponse = $this->get("/portal/pms/{$project->portal_token}");
        $verifiedResponse->assertStatus(200);
        $verifiedResponse->assertInertia(fn ($page) => $page
            ->component('portal/pms/show')
            ->where('requires_pin', false)
            ->where('is_verified', true)
            ->where('project.name', 'Portal Test Project')
            ->has('metrics')
        );
    }

    public function test_inactive_portal_shows_deactivation_screen(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Inactive Project',
            'code' => 'PRJ-INACT-01',
            'client' => 'PT Inactive',
            'portal_token' => 'inactive-portal-token',
            'is_portal_active' => false,
        ]);

        $response = $this->get("/portal/pms/{$project->portal_token}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('portal/pms/show')
            ->where('is_deactivated', true)
        );
    }

    public function test_admin_can_toggle_and_regenerate_portal(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Toggle Project',
            'code' => 'PRJ-TOGGLE-01',
            'client' => 'PT Toggle',
            'portal_token' => 'old-token',
            'portal_pin' => '123456',
            'is_portal_active' => true,
        ]);

        // Toggle to inactive
        $this->actingAs($admin)
            ->post("/studio/pms/projects/{$project->id}/portal/toggle")
            ->assertRedirect();

        $this->assertFalse($project->fresh()->is_portal_active);

        // Regenerate token and PIN
        $this->actingAs($admin)
            ->post("/studio/pms/projects/{$project->id}/portal/regenerate")
            ->assertRedirect();

        $fresh = $project->fresh();
        $this->assertNotEquals('old-token', $fresh->portal_token);
        $this->assertStringStartsWith('toggle-project-', $fresh->portal_token);
        $this->assertNull($fresh->portal_pin);
    }

    public function test_canonical_portal_url_and_sync_pin_invite_work(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Website Company Profile',
            'code' => 'PRJ-WEB-09',
            'client' => 'PT Sinar Abadi',
            'is_portal_active' => true,
        ]);

        // Auto-generated token uses clean slug + random suffix format
        $this->assertStringStartsWith('website-company-profile-', $project->portal_token);

        // Send invite while syncing a fresh PIN in one step
        $this->actingAs($admin)
            ->post("/studio/pms/projects/{$project->id}/portal/send-invite", [
                'client_email' => 'boss@sinarabadi.co.id',
                'sync_pin' => true,
                'portal_pin' => '774411',
            ])
            ->assertRedirect();

        $this->assertEquals('774411', $project->fresh()->portal_pin);

        Mail::assertSent(PmsPortalInviteMail::class, function ($mail) use ($project) {
            return $mail->hasTo('boss@sinarabadi.co.id')
                && $mail->pin === '774411'
                && str_ends_with($mail->portalUrl, "/portal/{$project->portal_token}");
        });

        // Guest can access canonical /portal/{token} and verify PIN via /portal/{token}/verify-pin
        $this->get("/portal/{$project->portal_token}")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('portal/pms/show')
                ->where('requires_pin', true)
                ->where('is_verified', false)
            );

        $this->post("/portal/{$project->portal_token}/verify-pin", [
            'pin' => '774411',
        ])->assertSessionHasNoErrors();

        $this->get("/portal/{$project->portal_token}")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('portal/pms/show')
                ->where('is_verified', true)
            );
    }

    public function test_admin_can_send_invite_and_progress_report_emails(): void
    {
        Mail::fake();

        $admin = User::factory()->create(['is_admin' => true]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Email Project',
            'code' => 'PRJ-EMAIL-01',
            'client' => 'PT Email',
            'portal_token' => 'send-email-token',
            'portal_pin' => '654321',
            'client_email' => 'client@company.com',
            'is_portal_active' => true,
        ]);

        // Send invite email (includes active PIN)
        $this->actingAs($admin)
            ->post("/studio/pms/projects/{$project->id}/portal/send-invite", [
                'client_email' => 'client@company.com',
            ])
            ->assertRedirect();

        Mail::assertSent(PmsPortalInviteMail::class, function ($mail) {
            return $mail->hasTo('client@company.com') && $mail->pin === '654321';
        });

        // Update settings to disable optional PIN and update email
        $this->actingAs($admin)
            ->put("/studio/pms/projects/{$project->id}/portal/settings", [
                'client_email' => 'updated@company.com',
                'portal_pin' => null,
                'is_portal_active' => true,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $fresh = $project->fresh();
        $this->assertEquals('updated@company.com', $fresh->client_email);
        $this->assertNull($fresh->portal_pin);

        // Send progress report email
        $this->actingAs($admin)
            ->post("/studio/pms/projects/{$project->id}/portal/send-report", [
                'client_email' => 'updated@company.com',
            ])
            ->assertRedirect();

        Mail::assertSent(PmsProgressReportMail::class, function ($mail) {
            return $mail->hasTo('updated@company.com');
        });
    }

    public function test_non_admin_cannot_manage_portal_settings(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $member = User::factory()->create(['is_admin' => false]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Protected Project',
            'code' => 'PRJ-PROT-01',
            'client' => 'PT Protected',
            'portal_token' => 'protected-token',
            'portal_pin' => '112233',
            'is_portal_active' => true,
        ]);

        $this->actingAs($member)
            ->post("/studio/pms/projects/{$project->id}/portal/toggle")
            ->assertForbidden();

        $this->actingAs($member)
            ->post("/studio/pms/projects/{$project->id}/portal/regenerate")
            ->assertForbidden();

        $this->actingAs($member)
            ->post("/studio/pms/projects/{$project->id}/portal/send-invite", [
                'client_email' => 'hacker@test.com',
            ])
            ->assertForbidden();
    }

    public function test_client_portal_attachment_preview_and_download_respects_pin_and_s3_storage(): void
    {
        config(['filesystems.default' => 's3']);
        Storage::fake('s3');

        $admin = User::factory()->create(['is_admin' => true]);
        $project = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Portal Attachment Vault',
            'code' => 'PRJ-PRT-ATT',
            'client' => 'Toko Ikhsan Tani',
            'portal_token' => 'portal-att-token',
            'portal_pin' => '998877',
            'is_portal_active' => true,
        ]);

        $otherProject = PmsProject::create([
            'created_by' => $admin->id,
            'name' => 'Other Project',
            'code' => 'PRJ-OTH-01',
            'client' => 'Other Client',
            'portal_token' => 'other-token',
            'is_portal_active' => true,
        ]);

        $storedPath = UploadedFile::fake()->image('wireframe-portal.png', 300, 200)->store('pms_attachments', 's3');

        $attachment = PmsAttachment::create([
            'project_id' => $project->id,
            'file_name' => 'wireframe-portal.png',
            'file_path' => $storedPath,
            'file_size' => 1024,
            'file_type' => 'png',
            'uploaded_by' => $admin->id,
        ]);

        $foreignAttachment = PmsAttachment::create([
            'project_id' => $otherProject->id,
            'file_name' => 'secret.pdf',
            'file_path' => 'pms_attachments/secret.pdf',
            'file_size' => 2048,
            'file_type' => 'pdf',
            'uploaded_by' => $admin->id,
        ]);

        // Unverified PIN session should get 403
        $this->get("/portal/portal-att-token/attachments/{$attachment->id}/preview")
            ->assertForbidden();

        // Cross-project attachment must 404 even with verified session
        $this->withSession(["portal_pms_verified_{$project->id}" => true])
            ->get("/portal/portal-att-token/attachments/{$foreignAttachment->id}/preview")
            ->assertNotFound();

        // Verified session can preview inline & download with exact filename from S3
        $preview = $this->withSession(["portal_pms_verified_{$project->id}" => true])
            ->get("/portal/portal-att-token/attachments/{$attachment->id}/preview");
        $preview->assertOk();
        $this->assertStringContainsString('inline', (string) $preview->headers->get('content-disposition'));

        $download = $this->withSession(["portal_pms_verified_{$project->id}" => true])
            ->get("/portal/portal-att-token/attachments/{$attachment->id}/download");
        $download->assertOk();
        $this->assertStringContainsString('attachment', (string) $download->headers->get('content-disposition'));
        $this->assertStringContainsString('wireframe-portal.png', (string) $download->headers->get('content-disposition'));
    }
}
