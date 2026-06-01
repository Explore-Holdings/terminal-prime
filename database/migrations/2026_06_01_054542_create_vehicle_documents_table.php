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
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();

            $table->string('registration_book')->nullable();
            $table->string('insurance_certificate')->nullable();
            $table->string('revenue_license')->nullable();
            $table->string('emission_test_certificate')->nullable();
            $table->string('driving_license_copy')->nullable();

            $table->date('insurance_expiry_date')->nullable();
            $table->date('revenue_license_expiry_date')->nullable();
            $table->date('emission_test_expiry_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_documents');
    }
};
