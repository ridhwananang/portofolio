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
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('role')->nullable()->change();
            $table->text('bio')->nullable()->change();
            $table->string('location')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('image')->nullable()->change();
            $table->string('github_url')->nullable()->change();
            $table->string('linkedin_url')->nullable()->change();
            $table->json('education')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep permissive
    }
};
