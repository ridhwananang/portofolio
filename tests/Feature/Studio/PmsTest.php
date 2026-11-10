<?php

use App\Models\Pms\PmsFinance;
use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsSprint;
use App\Models\Pms\PmsTask;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'email' => 'admin@test.com',
        'is_admin' => true,
    ]);
});

test('admin can access PMS dashboard cockpit', function () {
    $response = $this->actingAs($this->admin)->get('/studio/pms');
    $response->assertOk();
});

test('admin can access PMS projects listing index and dedicated create page', function () {
    $this->actingAs($this->admin)->get('/studio/pms/projects')->assertOk();
    $this->actingAs($this->admin)->get('/studio/pms/projects/create')->assertOk();
});

test('admin can access all PMS primary modules', function () {
    $this->actingAs($this->admin)->get('/studio/pms/sprints')->assertOk();
    $this->actingAs($this->admin)->get('/studio/pms/tasks')->assertOk();
    $this->actingAs($this->admin)->get('/studio/pms/timeline')->assertOk();
    $this->actingAs($this->admin)->get('/studio/pms/finances')->assertOk();
    $this->actingAs($this->admin)->get('/studio/pms/activity-logs')->assertOk();
});

test('admin can create and view a new PMS project with details', function () {
    $response = $this->actingAs($this->admin)->post('/studio/pms/projects', [
        'name' => 'Enterprise Banking Mobile App',
        'code' => 'BNK-2026',
        'client' => 'Bank Mandiri Syariah',
        'description' => 'Mobile banking revamp with biometric auth',
        'budget' => 75000000,
        'status' => 'in_progress',
        'priority' => 'high',
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(30)->toDateString(),
        'objective' => 'Revolusi UI/UX mobile banking',
        'scope' => 'Otentikasi, Transfer, QRIS, Mutasi',
    ]);

    $project = PmsProject::where('code', 'BNK-2026')->first();
    expect($project)->not->toBeNull();
    expect($project->client)->toBe('Bank Mandiri Syariah');
    expect((float) $project->budget)->toBe(75000000.0);

    $response->assertRedirect(route('studio.pms.projects.show', $project->id));

    // Can access project show workspace
    $showResponse = $this->actingAs($this->admin)->get(route('studio.pms.projects.show', $project->id));
    $showResponse->assertOk();
});

test('admin can create sprint, task, and subtask in PMS project', function () {
    $project = PmsProject::create([
        'name' => 'Health Tracking Portal',
        'code' => 'HLT-001',
        'client' => 'RS Siloam',
        'budget' => 50000000,
        'status' => 'in_progress',
        'priority' => 'medium',
        'created_by' => $this->admin->id,
    ]);

    // Create Sprint
    $sprintResponse = $this->actingAs($this->admin)->post('/studio/pms/sprints', [
        'project_id' => $project->id,
        'name' => 'Sprint 1 - Core Patient Records',
        'goal' => 'Selesaikan modul data rekam medis pasien',
        'status' => 'active',
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(14)->toDateString(),
    ]);
    $sprintResponse->assertRedirect();

    $sprint = PmsSprint::where('project_id', $project->id)->first();
    expect($sprint)->not->toBeNull();

    // Create Task
    $taskResponse = $this->actingAs($this->admin)->post('/studio/pms/tasks', [
        'project_id' => $project->id,
        'sprint_id' => $sprint->id,
        'title' => 'Integrasi API SatuSehat Kemenkes',
        'description' => 'Hubungkan database rekam medis dengan API SatuSehat',
        'status' => 'todo',
        'priority' => 'urgent',
    ]);
    $taskResponse->assertRedirect();

    $task = PmsTask::where('project_id', $project->id)->first();
    expect($task)->not->toBeNull();
    expect($task->priority)->toBe('urgent');

    // Add Subtask
    $this->actingAs($this->admin)->post("/studio/pms/tasks/{$task->id}/subtasks", [
        'title' => 'Dapatkan token OAuth2 SatuSehat',
    ]);

    expect($task->subtasks()->count())->toBe(1);
});

test('admin can manage users and dynamic role assignments without static seeders', function () {
    // 1. Create a dynamic user
    $this->actingAs($this->admin)->post('/studio/users', [
        'name' => 'Farhan DevOps',
        'email' => 'farhan@devops.com',
        'password' => 'Password123!',
        'role_title' => 'Cloud Infrastructure & SRE Lead', // Dynamic role!
        'phone' => '081299998888',
        'status' => 'active',
    ]);

    $farhan = User::where('email', 'farhan@devops.com')->first();
    expect($farhan)->not->toBeNull();
    expect($farhan->role_title)->toBe('Cloud Infrastructure & SRE Lead');

    // 2. Assign to PMS Project with dynamic project role
    $project = PmsProject::create([
        'name' => 'Cloud Migration Kubernetes',
        'code' => 'K8S-001',
        'client' => 'FinTech Asia',
        'budget' => 30000000,
        'created_by' => $this->admin->id,
    ]);

    $this->actingAs($this->admin)->post("/studio/pms/projects/{$project->id}/members", [
        'user_id' => $farhan->id,
        'role_in_project' => 'Lead Kubernetes Architect', // Dynamic project role!
    ]);

    expect($project->members()->count())->toBe(1);
    expect($project->members()->first()->role_in_project)->toBe('Lead Kubernetes Architect');
});

test('admin can record financial income and expense with automatic burn rate', function () {
    $project = PmsProject::create([
        'name' => 'Logistics Tracking Platform',
        'code' => 'LOG-001',
        'client' => 'JNE Express',
        'budget' => 100000000,
        'created_by' => $this->admin->id,
    ]);

    // Record Income
    $this->actingAs($this->admin)->post('/studio/pms/finances', [
        'project_id' => $project->id,
        'type' => 'income',
        'title' => 'DP 50% Termin Pertama',
        'amount' => 50000000,
        'transaction_date' => now()->toDateString(),
    ]);

    // Record Direct Project Expense
    $this->actingAs($this->admin)->post('/studio/pms/finances', [
        'project_id' => $project->id,
        'type' => 'project_expense',
        'title' => 'Langganan AWS EC2 & RDS',
        'amount' => 10000000,
        'transaction_date' => now()->toDateString(),
    ]);

    $project->refresh();
    expect($project->total_income)->toBe(50000000.0);
    expect($project->total_expense)->toBe(10000000.0);
    expect($project->remaining_budget)->toBe(90000000.0);
    expect($project->budget_burn_rate)->toBe(10.0); // 10M out of 100M is 10%
});

test('admin can upload avatar and update dynamic user profile', function () {
    \Illuminate\Support\Facades\Storage::fake('public');

    $file = \Illuminate\Http\UploadedFile::fake()->image('budi.jpg');

    $this->actingAs($this->admin)->post('/studio/users', [
        'name' => 'Budi Santoso',
        'email' => 'budi.santoso@studio.com',
        'password' => 'Password123!',
        'role_title' => 'Senior Fullstack Engineer',
        'phone' => '081234567890',
        'status' => 'active',
        'avatar' => $file,
    ]);

    $user = User::where('email', 'budi.santoso@studio.com')->first();
    expect($user)->not->toBeNull();
    expect($user->avatar)->not->toBeNull();
    \Illuminate\Support\Facades\Storage::disk('public')->assertExists($user->avatar);

    // Update with new avatar and dynamic role
    $newFile = \Illuminate\Http\UploadedFile::fake()->image('budi_new.png');
    $this->actingAs($this->admin)->put("/studio/users/{$user->id}", [
        'name' => 'Budi Santoso Updated',
        'email' => 'budi.santoso@studio.com',
        'role_title' => 'Chief Technology Officer',
        'phone' => '081234567890',
        'status' => 'active',
        'avatar' => $newFile,
    ]);

    $user->refresh();
    expect($user->name)->toBe('Budi Santoso Updated');
    expect($user->role_title)->toBe('Chief Technology Officer');
    \Illuminate\Support\Facades\Storage::disk('public')->assertExists($user->avatar);
});
