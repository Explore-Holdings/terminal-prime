<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop foreign keys referencing customer_chats
        if (Schema::hasTable('customer_chat_messages')) {
            try {
                Schema::table('customer_chat_messages', function (Blueprint $table) {
                    $table->dropForeign('fk_chat_messages_chat');
                });
            } catch (\Throwable $e) {}

            try {
                Schema::table('customer_chat_messages', function (Blueprint $table) {
                    $table->dropForeign(['chat_id']);
                });
            } catch (\Throwable $e) {}
        }

        // 2. Drop customer_chats table
        Schema::dropIfExists('customer_chats');

        // 3. Drop and recreate customer_chat_messages table with only: id, agent_id, message
        Schema::dropIfExists('customer_chat_messages');

        Schema::create('customer_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('agent_id')->unique();
            $table->longText('message')->nullable();
        });

        // 4. Initialize empty message array for each existing agent
        $agents = DB::table('users')->whereNotNull('agent_id')->pluck('agent_id');
        foreach ($agents as $agentId) {
            DB::table('customer_chat_messages')->insertOrIgnore([
                'agent_id' => $agentId,
                'message' => json_encode([]),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_chat_messages');
    }
};
