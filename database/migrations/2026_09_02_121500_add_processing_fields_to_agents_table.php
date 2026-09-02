<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('agents', 'processing_by')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->foreignId('processing_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
                $table->timestamp('processing_at')->nullable()->after('processing_by');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('agents', 'processing_by')) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropForeign(['processing_by']);
                $table->dropColumn(['processing_by', 'processing_at']);
            });
        }
    }
};
