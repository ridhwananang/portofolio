<?php

use App\Models\User;

test('guests are redirected to the login page when visiting admin dashboard', function () {
    $response = $this->get(route('admin.dashboard'));
    $response->assertRedirect(route('login'));
});

test('regular users cannot access admin dashboard and receive 403 forbidden', function () {
    $user = User::factory()->create([
        'email' => 'regularuser@example.com',
        'is_admin' => false,
    ]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));
    $response->assertForbidden();
});

test('admin users can access admin dashboard successfully', function () {
    $admin = User::factory()->create([
        'email' => 'admin@example.com',
        'is_admin' => true,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));
    $response->assertOk();
});

test('fallback admin emails have access even without is_admin explicitly set', function () {
    $admin = User::factory()->create([
        'email' => 'ridhwananang@gmail.com',
        'is_admin' => false,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));
    $response->assertOk();
});

test('admin can access all admin resource indexes', function () {
    $admin = User::factory()->create([
        'is_admin' => true,
    ]);

    $this->actingAs($admin);

    $this->get(route('admin.profile.edit'))->assertOk();
    $this->get(route('admin.projects.index'))->assertOk();
    $this->get(route('admin.tech-stacks.index'))->assertOk();
    $this->get(route('admin.certificates.index'))->assertOk();
    $this->get(route('admin.messages.index'))->assertOk();
    $this->get(route('admin.orders.index'))->assertOk();
});
