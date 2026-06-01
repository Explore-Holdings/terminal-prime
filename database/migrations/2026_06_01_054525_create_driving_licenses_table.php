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
        Schema::create('driving_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();

            $table->string('license_number')->nullable();
            $table->string('license_type')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('years_of_experience')->nullable();

            $table->boolean('tourist_license_available')->default(false);
            $table->string('tourist_license_number')->nullable();
            $table->date('tourist_issue_date')->nullable();
            $table->date('tourist_expiry_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driving_licenses');
    }
};
