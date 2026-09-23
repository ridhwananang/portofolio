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
        Schema::table('project_orders', function (Blueprint $table) {
            $table->json('milestone_progress')->nullable()->after('status');
            $table->json('client_brief')->nullable()->after('selected_features');
            $table->json('handover_data')->nullable()->after('staging_url');
            $table->json('revision_notes')->nullable()->after('handover_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_orders', function (Blueprint $table) {
            $table->dropColumn([
                'milestone_progress',
                'client_brief',
                'handover_data',
                'revision_notes',
            ]);
        });
    }
};
