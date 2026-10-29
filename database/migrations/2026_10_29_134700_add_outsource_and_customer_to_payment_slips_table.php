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
        Schema::table('payment_slips', function (Blueprint $table) {
            $table->unsignedBigInteger('trip_finance_id')->nullable()->change();
            $table->foreignId('outsource_vehicle_id')->nullable()->after('trip_finance_id')->constrained('outsource_vehicles')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->after('outsource_vehicle_id')->constrained('customers')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_slips', function (Blueprint $table) {
            $table->dropForeign(['outsource_vehicle_id']);
            $table->dropColumn('outsource_vehicle_id');
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
            $table->unsignedBigInteger('trip_finance_id')->nullable(false)->change();
        });
    }
};
