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
        if (!Schema::hasColumn('drivers', 'session_id')) {
            Schema::table('drivers', function (Blueprint $table) {
                $table->unsignedInteger('session_id')->nullable()->default(null)->after('payment_attachment');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn('session_id');
        });
    }
};
