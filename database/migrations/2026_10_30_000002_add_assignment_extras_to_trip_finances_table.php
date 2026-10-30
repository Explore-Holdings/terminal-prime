<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->unsignedBigInteger('location_vehicle_price_id')->nullable();
            $table->string('city_name')->nullable();
            $table->decimal('base_driver_share', 12, 2)->nullable();
            $table->decimal('extra_km', 10, 2)->default(0);
            $table->decimal('extra_price', 12, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->dropColumn(['location_vehicle_price_id', 'city_name', 'base_driver_share', 'extra_km', 'extra_price']);
        });
    }
};
