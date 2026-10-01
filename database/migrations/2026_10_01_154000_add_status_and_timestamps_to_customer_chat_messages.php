<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_chat_messages', function (Blueprint $table) {
            // Drop unique index on agent_id if exists so an agent can have ongoing and finished chat records
            try {
                $table->dropUnique(['agent_id']);
            } catch (\Throwable $e) {}

            if (!Schema::hasColumn('customer_chat_messages', 'status')) {
                $table->string('status', 20)->default('ongoing')->after('agent_id');
            }

            if (!Schema::hasColumn('customer_chat_messages', 'created_at')) {
                $table->timestamps();
            }
        });

        // Add index on agent_id and status
        Schema::table('customer_chat_messages', function (Blueprint $table) {
            try {
                $table->index(['agent_id', 'status']);
            } catch (\Throwable $e) {}
        });

        // Clear pre-populated empty rows
        DB::table('customer_chat_messages')
            ->where('message', '[]')
            ->orWhereNull('message')
            ->delete();
    }

    public function down(): void
    {
        Schema::table('customer_chat_messages', function (Blueprint $table) {
            if (Schema::hasColumn('customer_chat_messages', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('customer_chat_messages', 'created_at')) {
                $table->dropTimestamps();
            }
        });
    }
};
