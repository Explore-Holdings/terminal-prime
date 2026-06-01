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
        Schema::create('tourism_compliance', function (Blueprint $table) {
            $table->id();

            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();

            $table->string('tourism_registration_number')->nullable();

            $table->boolean('sltda_registered_driver')
                ->default(false);

            $table->string('tourist_driving_license_copy')
                ->nullable();

            $table->string('tourism_authority_permit_copy')
                ->nullable();

            $table->string('airport_access_permit')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tourism_compliance');
    }
};
