<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pms_projects', function (Blueprint $table) {
            $table->string('client_email')->nullable()->after('client');
            $table->string('portal_token', 64)->nullable()->unique()->after('end_date');
            $table->string('portal_pin', 20)->nullable()->after('portal_token');
            $table->boolean('is_portal_active')->default(true)->after('portal_pin');
            $table->timestamp('portal_last_accessed_at')->nullable()->after('is_portal_active');
            $table->timestamp('portal_last_email_sent_at')->nullable()->after('portal_last_accessed_at');
        });

        // Seed existing projects with unique tokens and pins
        $existing = DB::table('pms_projects')->whereNull('portal_token')->get();
        foreach ($existing as $proj) {
            DB::table('pms_projects')->where('id', $proj->id)->update([
                'portal_token' => Str::random(32),
                'portal_pin' => str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
                'is_portal_active' => true,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pms_projects', function (Blueprint $table) {
            $table->dropColumn([
                'client_email',
                'portal_token',
                'portal_pin',
                'is_portal_active',
                'portal_last_accessed_at',
                'portal_last_email_sent_at',
            ]);
        });
    }
};
