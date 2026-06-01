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
      Schema::create('vehicles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('driver_id')->constrained()->cascadeOnDelete();

    $table->string('registration_number')->nullable();
    $table->enum('vehicle_type', [
        'Sedan',
        'SUV',
        'Van',
        'Luxury Sedan',
        'Luxury SUV',
        'Mini Coach'
    ])->nullable();

    $table->string('brand')->nullable();
    $table->string('model')->nullable();
    $table->year('vehicle_year')->nullable();
    $table->string('color')->nullable();

    $table->integer('seating_capacity')->nullable();
    $table->integer('luggage_capacity')->nullable();

    $table->string('fuel_type')->nullable();
    $table->string('transmission_type')->nullable();

    $table->enum('ownership_type', [
        'Company-Owned',
        'Outsourced Vehicle',
        'Personally Owned'
    ])->nullable();

    $table->string('ownership_confirmation_letter')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
