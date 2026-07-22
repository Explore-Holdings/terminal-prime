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
        Schema::table('agents', function (Blueprint $table) {
            $table->string('external_vehicle_id')->nullable();
            $table->string('external_vehicle_reg')->nullable();
            $table->string('external_vehicle_make')->nullable();
            $table->string('external_vehicle_model')->nullable();
            $table->string('external_company_name')->nullable();
            $table->date('rent_start_date')->nullable();
            $table->date('rent_end_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropColumn([
                'external_vehicle_id',
                'external_vehicle_reg',
                'external_vehicle_make',
                'external_vehicle_model',
                'external_company_name',
                'rent_start_date',
                'rent_end_date'
            ]);
        });
    }
};
