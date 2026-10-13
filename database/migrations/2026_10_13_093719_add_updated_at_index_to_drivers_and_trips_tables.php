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
        Schema::table('drivers', function (Blueprint $table) {
            $table->index('updated_at', 'drivers_updated_at_index');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->index('updated_at', 'trips_updated_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropIndex('drivers_updated_at_index');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropIndex('trips_updated_at_index');
        });
    }
};
