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
        Schema::create('technology_info', function (Blueprint $table) {
            $table->id();

            $table->foreignId('driver_id')
                ->constrained('drivers')
                ->cascadeOnDelete();

            $table->boolean('smartphone_available')->default(false);

            $table->enum('device_type', [
                'Android',
                'iPhone'
            ])->nullable();

            $table->boolean('internet_connection_available')->default(false);
            $table->boolean('gps_tracking_enabled')->default(false);
            $table->boolean('mobile_app_usage_experience')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technology_info');
    }
};
