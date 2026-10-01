<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ensure message column is LONGTEXT
        Schema::table('customer_chat_messages', function (Blueprint $table) {
            $table->longText('message')->change();
        });

        // 2. Consolidate rows so each chat_id has exactly 1 row with message as JSON
        $chatIds = DB::table('customer_chat_messages')
            ->distinct()
            ->pluck('chat_id');

        foreach ($chatIds as $chatId) {
            $rows = DB::table('customer_chat_messages')
                ->where('chat_id', $chatId)
                ->orderBy('created_at', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            if ($rows->isEmpty()) {
                continue;
            }

            // Check if already consolidated
            if ($rows->count() === 1) {
                $first = $rows->first();
                $decoded = json_decode($first->message, true);
                if (is_array($decoded)) {
                    continue;
                }
            }

            // Map all rows into JSON message array
            $messages = [];
            foreach ($rows as $idx => $r) {
                $dec = json_decode($r->message, true);
                if (is_array($dec)) {
                    foreach ($dec as $item) {
                        $messages[] = $item;
                    }
                } else {
                    $messages[] = [
                        'id' => $idx + 1,
                        'sender' => $r->sender,
                        'sender_name' => $r->sender_name,
                        'message' => $r->message,
                        'created_at' => (string) $r->created_at,
                    ];
                }
            }

            // Re-index IDs sequentially
            foreach ($messages as $k => $m) {
                $messages[$k]['id'] = $k + 1;
            }

            $firstRow = $rows->first();
            $latestRow = $rows->last();

            DB::table('customer_chat_messages')
                ->where('id', $firstRow->id)
                ->update([
                    'sender' => $latestRow->sender,
                    'sender_name' => $latestRow->sender_name,
                    'message' => json_encode($messages, JSON_UNESCAPED_UNICODE),
                    'created_at' => $firstRow->created_at,
                ]);

            // Delete all other rows for this chat_id
            $otherIds = $rows->pluck('id')->filter(fn($id) => $id !== $firstRow->id)->all();
            if (!empty($otherIds)) {
                DB::table('customer_chat_messages')
                    ->whereIn('id', $otherIds)
                    ->delete();
            }
        }

        // 3. Add unique index on chat_id so each chat has exactly 1 record in this table
        try {
            Schema::table('customer_chat_messages', function (Blueprint $table) {
                $table->unique('chat_id', 'uniq_customer_chat_messages_chat_id');
            });
        } catch (\Throwable $e) {
            // Already unique or indexed
        }
    }

    public function down(): void
    {
        try {
            Schema::table('customer_chat_messages', function (Blueprint $table) {
                $table->dropUnique('uniq_customer_chat_messages_chat_id');
            });
        } catch (\Throwable $e) {}
    }
};
