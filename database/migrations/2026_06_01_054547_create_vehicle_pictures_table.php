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
        Schema::create('vehicle_pictures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();

            $table->string('front_view')->nullable();
            $table->string('rear_view')->nullable();
            $table->string('left_side_view')->nullable();
            $table->string('right_side_view')->nullable();

            $table->string('front_interior_view')->nullable();
            $table->string('passenger_seating_area')->nullable();
            $table->string('dashboard_view')->nullable();
            $table->string('luggage_compartment_view')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_pictures');
    }
};
