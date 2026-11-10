<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Projects (PMS Core Workspace)
        Schema::create('pms_projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('client');
            $table->text('description')->nullable();
            $table->decimal('budget', 15, 2)->default(0);
            $table->string('status')->default('planning'); // planning, in_progress, review, completed, on_hold
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->foreignId('project_order_id')->nullable()->constrained('project_orders')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // 2. Project Details / Technical Blueprint
        Schema::create('pms_project_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('pms_projects')->cascadeOnDelete();
            $table->text('background')->nullable();
            $table->text('objective')->nullable();
            $table->text('scope')->nullable();
            $table->json('tech_stack')->nullable();
            $table->text('deliverables')->nullable();
            $table->string('repository_url')->nullable();
            $table->string('live_demo_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Project Dynamic Members
        Schema::create('pms_project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('pms_projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role_in_project')->nullable(); // Fully dynamic: e.g. "Lead Architect", "UI/UX Designer", etc.
            $table->decimal('hourly_rate', 12, 2)->nullable();
            $table->date('joined_at')->nullable();
            $table->timestamps();
        });

        // 4. Sprints
        Schema::create('pms_sprints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('pms_projects')->cascadeOnDelete();
            $table->string('name');
            $table->text('goal')->nullable();
            $table->string('status')->default('planned'); // planned, active, completed
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        // 5. Tasks
        Schema::create('pms_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('pms_projects')->cascadeOnDelete();
            $table->foreignId('sprint_id')->nullable()->constrained('pms_sprints')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('todo'); // todo, in_progress, review, done
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->date('due_date')->nullable();
            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->default(0);
            $table->integer('order_index')->default(0);
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // 6. Subtasks
        Schema::create('pms_subtasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('pms_tasks')->cascadeOnDelete();
            $table->string('title');
            $table->boolean('is_done')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 7. Finances (Incomes, Project Expenses, General Expenses)
        Schema::create('pms_finances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('pms_projects')->cascadeOnDelete();
            $table->string('type'); // income, project_expense, general_expense
            $table->string('title');
            $table->string('category')->nullable(); // Milestone Payment, Infrastructure, Licenses, Operations, etc.
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('transaction_date');
            $table->text('notes')->nullable();
            $table->string('receipt_file')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // 8. Attachments
        Schema::create('pms_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('pms_projects')->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('pms_tasks')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->bigInteger('file_size')->default(0);
            $table->string('file_type')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // 9. Activity Logs & Audit Trail
        Schema::create('pms_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('pms_projects')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // created, updated, deleted, status_changed, assigned
            $table->string('entity_type'); // project, sprint, task, finance, member, user
            $table->string('description');
            $table->json('properties')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pms_activity_logs');
        Schema::dropIfExists('pms_attachments');
        Schema::dropIfExists('pms_finances');
        Schema::dropIfExists('pms_subtasks');
        Schema::dropIfExists('pms_tasks');
        Schema::dropIfExists('pms_sprints');
        Schema::dropIfExists('pms_project_members');
        Schema::dropIfExists('pms_project_details');
        Schema::dropIfExists('pms_projects');
    }
};
