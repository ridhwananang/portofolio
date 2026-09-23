<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('project_orders', function (Blueprint $table) {
            $table->string('payment_scheme', 32)->default('down_payment')->after('currency'); // down_payment, full_payment
            $table->decimal('dp_percentage', 5, 2)->default(50.00)->after('payment_scheme');
            $table->decimal('dp_amount', 15, 2)->default(0.00)->after('dp_percentage');
            $table->decimal('remaining_amount', 15, 2)->default(0.00)->after('dp_amount');
            $table->string('payment_stage', 32)->default('awaiting_dp')->index()->after('remaining_amount'); // awaiting_dp, dp_paid, awaiting_final, fully_paid
            $table->timestamp('dp_paid_at')->nullable()->after('payment_stage');
            $table->timestamp('final_paid_at')->nullable()->after('dp_paid_at');
            $table->foreignId('dp_transaction_id')->nullable()->after('quest_id')->constrained('transactions')->nullOnDelete();
            $table->foreignId('final_transaction_id')->nullable()->after('dp_transaction_id')->constrained('transactions')->nullOnDelete();
        });

        // Seed default DP percentage setting if not already present
        if (! DB::table('service_settings')->where('key', 'default_dp_percentage')->exists()) {
            DB::table('service_settings')->insert([
                'key' => 'default_dp_percentage',
                'value' => '50',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_orders', function (Blueprint $table) {
            $table->dropForeign(['dp_transaction_id']);
            $table->dropForeign(['final_transaction_id']);
            $table->dropColumn([
                'payment_scheme',
                'dp_percentage',
                'dp_amount',
                'remaining_amount',
                'payment_stage',
                'dp_paid_at',
                'final_paid_at',
                'dp_transaction_id',
                'final_transaction_id',
            ]);
        });

        DB::table('service_settings')->where('key', 'default_dp_percentage')->delete();
    }
};
