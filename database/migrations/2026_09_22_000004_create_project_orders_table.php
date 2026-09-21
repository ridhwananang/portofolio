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
        Schema::create('project_orders', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code', 32)->unique()->index();
            $table->string('client_name');
            $table->string('client_email')->index();
            $table->string('client_phone')->nullable();
            $table->string('project_type'); // landing_page, company_profile, web_app, ecommerce, custom
            $table->json('selected_features')->nullable();
            $table->string('delivery_speed')->default('standard'); // standard, express
            $table->text('notes')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('status')->default('pending_payment')->index(); // pending_payment, in_progress, in_review, completed, cancelled
            $table->string('staging_url')->nullable();
            $table->foreignId('quest_id')->constrained('quests')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_orders');
    }
};
