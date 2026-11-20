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

test('pms cockpit returns integer days_left, actionableTasks, activeSprints, and omits recentLogs', function () {
    $this->assignedProject->update([
        'start_date' => now()->subDays(3)->toDateString(),
        'end_date' => now()->addDays(27)->toDateString(),
    ]);

    $sprint = PmsSprint::create([
        'project_id' => $this->assignedProject->id,
        'name' => 'Sprint 1 - Core Engine',
        'status' => 'active',
        'start_date' => now()->subDays(2)->toDateString(),
        'end_date' => now()->addDays(12)->toDateString(),
    ]);

    PmsTask::create([
        'project_id' => $this->assignedProject->id,
        'sprint_id' => $sprint->id,
        'title' => 'Slicing UI Cockpit',
        'status' => 'in_progress',
        'priority' => 'high',
        'assigned_to' => $this->developer->id,
        'due_date' => now()->addDays(2)->toDateString(),
        'created_by' => $this->admin->id,
    ]);

    $this->assignedProject->update([
        'portal_pin' => '123456',
        'is_portal_active' => true,
    ]);

    $response = $this->actingAs($this->developer)->get('/studio/pms');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('studio/pms/dashboard')
        ->where('is_admin', false)
        ->where('projectHealth.0.days_left', 27)
        ->where('projectHealth.0.days_left', fn ($val) => is_int($val))
        ->where('projectHealth.0.portal_token', $this->assignedProject->portal_token)
        ->where('projectHealth.0.is_portal_active', true)
        ->where('projectHealth.0.budget', 0)
        ->missing('projectHealth.0.portal_pin')
        ->where('stats.in_progress_tasks', 1)
        ->where('stats.completion_rate', 0)
        ->has('activeSprints', 1)
        ->has('actionableTasks', 1)
        ->has('upcomingDeadlines', 1)
        ->missing('recentLogs')
    );
});

test('non-admin creating task cannot delegate to other user and is forced to assign to self', function () {
    // Attempt to assign to admin or another user
    $this->actingAs($this->developer)->post('/studio/pms/tasks', [
        'project_id' => $this->assignedProject->id,
        'title' => 'Personal Subsystem Task',
        'status' => 'todo',
        'priority' => 'medium',
        'assigned_to' => $this->admin->id, // Trying to assign to admin
    ])->assertRedirect();

    $task = PmsTask::where('title', 'Personal Subsystem Task')->first();
    expect($task)->not->toBeNull();
    // Must be assigned to the developer himself, not admin!
    expect($task->assigned_to)->toBe($this->developer->id);
    expect($task->created_by)->toBe($this->developer->id);
});

test('non-admin cannot edit, update status, or delete task assigned to other user (read-only)', function () {
    $adminTask = PmsTask::create([
        'project_id' => $this->assignedProject->id,
        'title' => 'Admin Leadership Task',
        'status' => 'todo',
        'priority' => 'urgent',
        'assigned_to' => $this->admin->id,
        'created_by' => $this->admin->id,
    ]);

    $subtask = PmsSubtask::create([
        'task_id' => $adminTask->id,
        'title' => 'Admin Subtask Step',
        'is_done' => false,
    ]);

    // 1. Edit attempt by developer -> Forbidden
    $this->actingAs($this->developer)
        ->put("/studio/pms/tasks/{$adminTask->id}", [
            'title' => 'Hijacked Admin Task',
            'status' => 'done',
            'priority' => 'low',
        ])
        ->assertForbidden();

    // 2. Status change attempt by developer -> Forbidden
    $this->actingAs($this->developer)
        ->patch("/studio/pms/tasks/{$adminTask->id}/status", [
            'status' => 'in_progress',
        ])
        ->assertForbidden();

    // 3. Delete attempt by developer -> Forbidden
    $this->actingAs($this->developer)
        ->delete("/studio/pms/tasks/{$adminTask->id}")
        ->assertForbidden();

    // 4. Subtask toggle attempt by developer -> Forbidden
    $this->actingAs($this->developer)
        ->patch("/studio/pms/subtasks/{$subtask->id}/toggle")
        ->assertForbidden();

    // 5. Add subtask attempt by developer -> Forbidden
    $this->actingAs($this->developer)
        ->post("/studio/pms/tasks/{$adminTask->id}/subtasks", [
            'title' => 'Unauthorized Subtask',
        ])
        ->assertForbidden();
});

test('admin has full access to create, assign to anyone, edit, and delete any task', function () {
    // Admin creates task assigned to developer
    $this->actingAs($this->admin)->post('/studio/pms/tasks', [
        'project_id' => $this->assignedProject->id,
        'title' => 'Task Delegated by Admin',
        'status' => 'todo',
        'priority' => 'high',
        'assigned_to' => $this->developer->id,
    ])->assertRedirect();

    $task = PmsTask::where('title', 'Task Delegated by Admin')->first();
    expect($task->assigned_to)->toBe($this->developer->id);

    // Admin updates developer task
    $this->actingAs($this->admin)->put("/studio/pms/tasks/{$task->id}", [
        'title' => 'Task Delegated by Admin (Updated)',
        'status' => 'in_progress',
        'priority' => 'urgent',
        'assigned_to' => $this->developer->id,
    ])->assertRedirect();

    // Admin changes status
    $this->actingAs($this->admin)->patch("/studio/pms/tasks/{$task->id}/status", [
        'status' => 'done',
    ])->assertRedirect();

    // Admin deletes task
    $this->actingAs($this->admin)->delete("/studio/pms/tasks/{$task->id}")->assertRedirect();
    expect(PmsTask::find($task->id))->toBeNull();
});

test('kanban board is strictly scoped to individual logged-in user tasks for both admin and member', function () {
    $myTask = PmsTask::create([
        'project_id' => $this->assignedProject->id,
        'title' => 'Developer Own Kanban Task',
        'status' => 'todo',
        'priority' => 'high',
        'assigned_to' => $this->developer->id,
        'created_by' => $this->admin->id,
    ]);

    $adminTask = PmsTask::create([
        'project_id' => $this->assignedProject->id,
        'title' => 'Admin Own Kanban Task',
        'status' => 'todo',
        'priority' => 'urgent',
        'assigned_to' => $this->admin->id,
        'created_by' => $this->admin->id,
    ]);

    // Developer only sees their own task (even if passing assigned_to param)
    $response = $this->actingAs($this->developer)
        ->get("/studio/pms/tasks?assigned_to={$this->admin->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('studio/pms/tasks/index')
        ->where('is_admin', false)
        ->where('current_user_id', $this->developer->id)
        ->where('filters.assigned_to', $this->developer->id)
        ->has('tasks', 1)
        ->where('tasks.0.id', $myTask->id)
    );

    // Admin also sees strictly their own task on personal Kanban board
    $adminResponse = $this->actingAs($this->admin)->get('/studio/pms/tasks');
    $adminResponse->assertOk();
    $adminResponse->assertInertia(fn ($page) => $page
        ->component('studio/pms/tasks/index')
        ->where('current_user_id', $this->admin->id)
        ->has('tasks', 1)
        ->where('tasks.0.id', $adminTask->id)
    );

    // Drag & drop JSON patch with order_index works cleanly
    $this->actingAs($this->developer)
        ->patchJson("/studio/pms/tasks/{$myTask->id}/status", [
            'status' => 'review',
            'order_index' => 2,
        ])
        ->assertOk()
        ->assertJson([
            'success' => true,
            'task' => [
                'id' => $myTask->id,
                'status' => 'review',
                'order_index' => 2,
            ],
        ]);
});
