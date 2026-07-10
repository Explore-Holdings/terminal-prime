<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rate_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default');
            $table->decimal('agent_rate', 8, 2)->default(0);
            $table->decimal('driver_rate', 8, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('rate_settings')->insert([
            [
                'name' => 'Default',
                'agent_rate' => 0,
                'driver_rate' => 0,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rate_settings');
    }
};
