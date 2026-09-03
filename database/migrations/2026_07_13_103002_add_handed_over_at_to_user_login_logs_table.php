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
        if (!Schema::hasColumn('user_login_logs', 'handed_over_at')) {
            Schema::table('user_login_logs', function (Blueprint $table) {
                $table->timestamp('handed_over_at')->nullable()->after('logout_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_login_logs', function (Blueprint $table) {
            $table->dropColumn('handed_over_at');
        });
    }
};
