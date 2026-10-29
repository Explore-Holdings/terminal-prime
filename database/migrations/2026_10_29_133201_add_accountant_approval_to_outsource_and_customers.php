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
        Schema::table('outsource_vehicles', function (Blueprint $table) {
            $table->boolean('accountant_approved')->default(false)->after('received_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('accountant_approved');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->boolean('accountant_approved')->default(false)->after('finance_received_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('accountant_approved');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('outsource_vehicles', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['accountant_approved', 'approved_by', 'approved_at']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['accountant_approved', 'approved_by', 'approved_at']);
        });
    }
};
