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

        if (!Schema::hasTable('short_trips')) {
            Schema::create('short_trips', function (Blueprint $table) {
                $table->id();
                $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
                $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();
                $table->unsignedInteger('session_id');
                $table->unsignedInteger('slot_number')->nullable();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('assigned_at')->nullable();
                $table->string('status')->default('active'); // active, completed
                $table->string('queue_result')->nullable(); // same_queue, next_queue
                $table->timestamp('checked_in_at')->nullable();
                $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('remarks')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('short_trips')) {
            Schema::dropIfExists('short_trips');
        }

        if (Schema::hasColumn('trips', 'is_short_trip')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->dropForeign(['short_trip_by']);
                $table->dropColumn([
                    'is_short_trip',
                    'short_trip_by',
                    'original_session_id',
                    'original_slot_number',
                ]);
            });
        }
    }
};
