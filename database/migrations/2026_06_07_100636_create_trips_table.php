<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();

            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();

            $table->timestamp('trip_assigned_at')->nullable();

            $table->foreignId('trip_assigned_by')->nullable()->constrained('users')->nullOnDelete();

            $table->dateTime('trip_started_at')->nullable();
            $table->dateTime('trip_ended_at')->nullable();

            $table->text('remarks')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamp('survey_sent_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
