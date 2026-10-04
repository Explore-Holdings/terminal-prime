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
        Schema::table('trips', function (Blueprint $table) {
            if (!Schema::hasColumn('trips', 'is_short_trip')) {
                $table->boolean('is_short_trip')->default(false)->after('selection_reason_by');
            }
            if (!Schema::hasColumn('trips', 'short_trip_by')) {
                $table->foreignId('short_trip_by')->nullable()->after('is_short_trip')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('trips', 'original_session_id')) {
                $table->unsignedInteger('original_session_id')->nullable()->after('short_trip_by');
            }
            if (!Schema::hasColumn('trips', 'original_slot_number')) {
                $table->unsignedInteger('original_slot_number')->nullable()->after('original_session_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            if (Schema::hasColumn('trips', 'short_trip_by')) {
                $table->dropForeign(['short_trip_by']);
                $table->dropColumn('short_trip_by');
            }
            if (Schema::hasColumn('trips', 'original_session_id')) {
                $table->dropColumn('original_session_id');
            }
            if (Schema::hasColumn('trips', 'original_slot_number')) {
                $table->dropColumn('original_slot_number');
            }
        });
    }
};
