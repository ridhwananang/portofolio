<?php

use App\Models\Pms\PmsProject;
use App\Models\Pms\PmsProjectMember;
use App\Models\Pms\PmsSprint;
use App\Models\Pms\PmsSubtask;
use App\Models\Pms\PmsTask;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create([
        'email' => 'admin_role@test.com',
        'is_admin' => true,
        'role_title' => 'Director & Lead',
    ]);

    $this->developer = User::factory()->create([
        'email' => 'developer@test.com',
        'is_admin' => false,
        'role_title' => 'Lead Architect',
    ]);

    $this->unassignedUser = User::factory()->create([
        'email' => 'unassigned@test.com',
        'is_admin' => false,
        'role_title' => 'QA Engineer',
    ]);

    // Create 2 projects: 1 where $this->developer is assigned, 1 where they are NOT assigned
    $this->assignedProject = PmsProject::create([
        'name' => 'Assigned Mobile App Project',
        'code' => 'ASG-001',
        'client' => 'PT Mandiri Jaya',
        'budget' => 60000000,
        'status' => 'in_progress',
        'priority' => 'high',
        'created_by' => $this->admin->id,
    ]);

    $this->memberRecord = PmsProjectMember::create([
        'project_id' => $this->assignedProject->id,
        'user_id' => $this->developer->id,
        'role_in_project' => 'Lead Architect',
    ]);

    $this->unassignedProject = PmsProject::create([
        'name' => 'Secret Enterprise ERP Project',
        'code' => 'ERP-002',
        'client' => 'PT Pertamina',
        'budget' => 150000000,
        'status' => 'in_progress',
        'priority' => 'urgent',
        'created_by' => $this->admin->id,
    ]);
});

test('non-admin team member can access PMS cockpit dashboard', function () {
    $response = $this->actingAs($this->developer)->get('/studio/pms');
    $response->assertOk();
});

test('non-admin visiting studio root directly sees PMS cockpit', function () {
    $response = $this->actingAs($this->developer)->get('/studio');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('studio/pms/dashboard'));
});

test('authenticated user accessing web dashboard is redirected to studio', function () {
    $response = $this->actingAs($this->developer)->get('/dashboard');
    $response->assertRedirect('/studio');
});

test('non-admin cannot access admin portfolio CMS modules', function () {
    $this->actingAs($this->developer)->get('/studio/users')->assertForbidden();
    $this->actingAs($this->developer)->get('/studio/services')->assertForbidden();
    $this->actingAs($this->developer)->get('/studio/orders')->assertForbidden();
    $this->actingAs($this->developer)->get('/studio/profile')->assertForbidden();
});

test('non-admin sees only assigned projects on projects listing', function () {
    $response = $this->actingAs($this->developer)->get('/studio/pms/projects');
    $response->assertOk();

    // Verify Inertia props scope
    $response->assertInertia(fn ($page) => $page
        ->component('studio/pms/projects/index')
        ->where('is_admin', false)
        ->where('can_create_project', false)
        ->has('projects.data', 1)
        ->where('projects.data.0.id', $this->assignedProject->id)
    );
});

test('non-admin cannot access create project page or store a new project', function () {
    $this->actingAs($this->developer)->get('/studio/pms/projects/create')->assertForbidden();

    $this->actingAs($this->developer)->post('/studio/pms/projects', [
        'name' => 'Unauthorized Project Attempt',
        'code' => 'UNA-001',
        'client' => 'Test Client',
        'budget' => 10000000,
        'status' => 'planning',
        'priority' => 'medium',
    ])->assertForbidden();
});

test('non-admin cannot access finances module or store financial records', function () {
    $this->actingAs($this->developer)->get('/studio/pms/finances')->assertForbidden();

    $this->actingAs($this->developer)->post('/studio/pms/finances', [
        'project_id' => $this->assignedProject->id,
        'type' => 'expense',
        'title' => 'Server Hosting Cost',
        'amount' => 500000,
        'transaction_date' => now()->toDateString(),
    ])->assertForbidden();
});

test('non-admin cannot assign or delete project members', function () {
    $this->actingAs($this->developer)->post("/studio/pms/projects/{$this->assignedProject->id}/members", [
        'user_id' => $this->unassignedUser->id,
        'role_in_project' => 'QA Tester',
    ])->assertForbidden();

    $this->actingAs($this->developer)
        ->delete("/studio/pms/members/{$this->memberRecord->id}")
        ->assertForbidden();
});

test('non-admin cannot access workspace of unassigned project', function () {
    $this->actingAs($this->developer)
        ->get("/studio/pms/projects/{$this->unassignedProject->id}")
        ->assertForbidden();
});

test('non-admin can access workspace of their assigned project', function () {
    $response = $this->actingAs($this->developer)
        ->get("/studio/pms/projects/{$this->assignedProject->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('studio/pms/projects/show')
        ->where('is_admin', false)
        ->where('user_role_in_project', 'Lead Architect')
        ->where('current_user_id', $this->developer->id)
    );
});

test('non-admin can update task status and toggle subtasks in assigned project', function () {
    $task = PmsTask::create([
        'project_id' => $this->assignedProject->id,
        'title' => 'Implement JWT Auth API',
        'status' => 'todo',
        'priority' => 'high',
        'assigned_to' => $this->developer->id,
        'created_by' => $this->admin->id,
    ]);

    $subtask = PmsSubtask::create([
        'task_id' => $task->id,
        'title' => 'Create Auth Middleware',
        'is_done' => false,
    ]);

    // Update status to in_progress
    $this->actingAs($this->developer)
        ->patch("/studio/pms/tasks/{$task->id}/status", [
            'status' => 'in_progress',
        ])
        ->assertRedirect();

    expect($task->fresh()->status)->toBe('in_progress');

    // Toggle subtask
    $this->actingAs($this->developer)
        ->patch("/studio/pms/subtasks/{$subtask->id}/toggle")
        ->assertRedirect();

    expect($subtask->fresh()->is_done)->toBeTrue();
});
