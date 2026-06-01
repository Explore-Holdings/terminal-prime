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
        Schema::create('driver_service_categories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('driver_id')
                ->constrained('drivers')
                ->cascadeOnDelete();

            $table->foreignId('service_category_id')
                ->constrained('service_categories')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_service_categories');
    }
};
