<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('trip_finances')) {
            Schema::create('trip_finances', function (Blueprint $table) {
                $table->id();

            $table->foreignId('trip_id')->constrained('trips')->onDelete('cascade');
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('agents')->onDelete('set null');

            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('driver_share', 10, 2)->default(0);
            $table->decimal('agent_share', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);

            $table->boolean('received')->default(false);
            $table->decimal('received_amount', 10, 2)->default(0);
            $table->foreignId('received_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('received_at')->nullable();

            $table->timestamps();

            $table->index('trip_id');
            $table->index('driver_id');
            $table->index('agent_id');
            $table->index('received');
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_finances');
    }
};