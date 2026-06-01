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
        Schema::create('driver_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();

            $table->string('nic_copy')->nullable();
            $table->string('passport_copy')->nullable();
            $table->string('driver_photo')->nullable();

            $table->string('driving_license_copy')->nullable();
            $table->string('tourist_driving_license_copy')->nullable();
            $table->string('no_objection_letter')->nullable();

            $table->string('police_clearance_certificate')->nullable();
            $table->string('medical_fitness_certificate')->nullable();

            $table->string('tourism_authority_registration')->nullable();
            $table->string('airport_permit')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_documents');
    }
};
