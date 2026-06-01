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
        Schema::create('admin_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();

            $table->boolean('nic_verified')->default(false);
            $table->boolean('driving_license_verified')->default(false);
            $table->boolean('tourist_license_verified')->default(false);
            $table->boolean('vehicle_ownership_verified')->default(false);
            $table->boolean('vehicle_documents_verified')->default(false);
            $table->boolean('insurance_verified')->default(false);
            $table->boolean('no_objection_letter_verified')->default(false);
            $table->boolean('vehicle_photos_approved')->default(false);
            $table->boolean('tourism_registration_verified')->default(false);
            $table->boolean('driver_approved')->default(false);

            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->date('approval_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_verifications');
    }
};
