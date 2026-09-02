<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('trips', 'selection_reason')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->text('selection_reason')->nullable()->after('remarks');
                $table->foreignId('selection_reason_by')->nullable()->after('selection_reason')->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('trips', 'selection_reason')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->dropForeign(['selection_reason_by']);
                $table->dropColumn(['selection_reason', 'selection_reason_by']);
            });
        }
    }
};
