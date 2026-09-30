<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('customer_chats')) {
            Schema::create('customer_chats', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('agent_id');
                $table->string('customer_name', 150);
                $table->string('customer_phone', 50)->nullable();
                $table->string('country', 100);
                $table->string('country_code', 10)->nullable();
                $table->string('country_flag', 10)->default('🌐');
                $table->string('topic', 255)->default('General Airport Inquiry');
                $table->enum('status', ['continuing', 'finished'])->default('continuing');
                $table->timestamps();

                $table->index(['agent_id', 'status'], 'idx_agent_status');
                $table->index('updated_at', 'idx_updated_at');
            });
        }

        if (!Schema::hasTable('customer_chat_messages')) {
            Schema::create('customer_chat_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('chat_id');
                $table->enum('sender', ['customer', 'agent']);
                $table->string('sender_name', 150);
                $table->text('message');
                $table->timestamp('created_at')->useCurrent();

                $table->index('chat_id', 'idx_chat_id');
                $table->foreign('chat_id', 'fk_chat_messages_chat')
                    ->references('id')
                    ->on('customer_chats')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_chat_messages');
        Schema::dropIfExists('customer_chats');
    }
};
