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
       Schema::create('vehicle_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->boolean('air_conditioned')->default(false);
            $table->boolean('wifi_available')->default(false);
            $table->boolean('gps_enabled')->default(false);
            $table->boolean('child_seat_available')->default(false);
            $table->boolean('wheelchair_accessible')->default(false);
            $table->boolean('pet_friendly')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_features');
    }
};
