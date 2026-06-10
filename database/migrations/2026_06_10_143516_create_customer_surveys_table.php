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
        Schema::create('customer_surveys', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();

            $table->unsignedTinyInteger('journey_rating');
            $table->unsignedTinyInteger('driver_rating')->nullable();

            $table->boolean('driver_charged_extra')->default(false);
            $table->decimal('extra_amount', 12, 2)->nullable();

            $table->boolean('driver_was_polite')->default(true);
            $table->boolean('vehicle_was_clean')->default(true);
            $table->boolean('felt_safe')->default(true);

            $table->text('comments')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_surveys');
    }
};
