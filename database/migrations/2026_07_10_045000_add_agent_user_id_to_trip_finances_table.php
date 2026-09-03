<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('trip_finances', 'agent_user_id')) {
            Schema::table('trip_finances', function (Blueprint $table) {
                $table->unsignedBigInteger('agent_user_id')->nullable()->after('agent_id')->comment("The agent's user account ID");

                $table->foreign('agent_user_id')->references('id')->on('users')->onDelete('set null');
                $table->index('agent_user_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('trip_finances', function (Blueprint $table) {
            $table->dropForeign(['agent_user_id']);
            $table->dropIndex(['agent_user_id']);
            $table->dropColumn('agent_user_id');
        });
    }
};
