<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_chat_messages', function (Blueprint $table) {
            try {
                $table->dropIndex('customer_chat_messages_agent_id_status_index');
            } catch (\Throwable $e) {}

            $table->unsignedBigInteger('agent_id')->change();
            $table->foreign('agent_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['agent_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('customer_chat_messages', function (Blueprint $table) {
            try {
                $table->dropForeign(['agent_id']);
                $table->dropIndex(['agent_id', 'status']);
            } catch (\Throwable $e) {}

            $table->string('agent_id', 50)->change();
        });
    }
};
