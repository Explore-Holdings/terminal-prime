<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('trips', 'is_short_trip')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->boolean('is_short_trip')->default(false)->after('remarks');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('trips', 'is_short_trip')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->dropColumn('is_short_trip');
            });
        }
    }
};
