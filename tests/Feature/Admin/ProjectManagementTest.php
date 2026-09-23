<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->admin = User::factory()->create(['is_admin' => true]);
});

test('admin can create a new project with image upload', function () {
    $file = UploadedFile::fake()->image('project.jpg');

    $response = $this->actingAs($this->admin)->post(route('admin.projects.store'), [
        'title' => 'E-Commerce Platform',
        'description' => 'Modern ecommerce built with Laravel and React',
        'tags' => ['Laravel', 'React', 'Tailwind'],
        'mockup_type' => 'macbook',
        'image' => $file,
    ]);

    $response->assertRedirect(route('admin.projects.index'));
    $this->assertDatabaseHas('projects', [
        'title' => 'E-Commerce Platform',
        'mockup_type' => 'macbook',
    ]);

    $project = Project::first();
    expect($project->image)->not->toBeNull();
    Storage::disk('public')->assertExists($project->image);
});

test('admin can update an existing project', function () {
    $project = Project::create([
        'title' => 'Old Title',
        'description' => 'Old Description',
        'tags' => ['PHP'],
        'mockup_type' => 'browser',
    ]);

    $response = $this->actingAs($this->admin)->put(route('admin.projects.update', $project), [
        'title' => 'Updated Title',
        'description' => 'Updated Description',
        'tags' => ['PHP', 'Laravel'],
        'mockup_type' => 'desktop',
    ]);

    $response->assertRedirect(route('admin.projects.index'));
    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'title' => 'Updated Title',
        'mockup_type' => 'desktop',
    ]);
});

test('admin can delete a project', function () {
    $file = UploadedFile::fake()->image('delete_me.jpg');
    $path = $file->store('projects', 'public');

    $project = Project::create([
        'title' => 'To Delete',
        'description' => 'To Delete Description',
        'tags' => ['Temp'],
        'mockup_type' => 'mobile',
        'image' => $path,
    ]);

    Storage::disk('public')->assertExists($path);

    $response = $this->actingAs($this->admin)->delete(route('admin.projects.destroy', $project));
    $response->assertRedirect(route('admin.projects.index'));

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    Storage::disk('public')->assertMissing($path);
});
