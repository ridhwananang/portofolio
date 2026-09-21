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
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event')->index();
            $table->string('xendit_id')->nullable()->index();
            $table->string('external_id')->nullable()->index();
            $table->json('payload');
            $table->string('ip_address')->nullable();
            $table->string('status')->default('received')->index(); // received, processed, failed, ignored
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};
