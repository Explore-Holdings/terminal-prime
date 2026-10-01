<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerChatMessage extends Model
{
    use HasFactory;

    protected $table = 'customer_chat_messages';

    public $timestamps = true;

    protected $fillable = [
        'agent_id',
        'status',
        'message',
    ];

    protected $attributes = [
        'status' => 'ongoing',
    ];

    /**
     * Relationship to User via agent_id
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id', 'agent_id');
    }

    /**
     * Decode the JSON stored in `message` column into an array of message objects.
     */
    public function getDecodedMessagesAttribute(): array
    {
        if (is_array($this->message)) {
            return $this->message;
        }

        if (empty($this->message)) {
            return [];
        }

        $decoded = json_decode($this->message, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Append a message to a specific chat, or create a brand new chat record if none exists / finished.
     * Prevents different customers from seeing each other's chat history.
     */
    public static function appendToChat(string $agentId, string $sender, string $text, ?int $chatId = null): array
    {
        $record = null;

        if ($chatId) {
            $record = self::where('id', $chatId)
                ->where('agent_id', $agentId)
                ->first();
        }

        // If no existing chat specified or found, or if previous chat was finished, start a new chat row
        if (!$record || $record->status === 'finished') {
            $record = self::create([
                'agent_id' => $agentId,
                'status' => 'ongoing',
                'message' => json_encode([]),
            ]);
        }

        $messages = $record->decoded_messages;
        $nextId = count($messages) + 1;

        $newMessage = [
            'id' => $nextId,
            'sender' => $sender, // 'customer' or 'agent'
            'message' => $text,
            'created_at' => now()->toIso8601String(),
        ];

        $messages[] = $newMessage;

        $record->update([
            'message' => json_encode($messages, JSON_UNESCAPED_UNICODE),
        ]);

        return [
            'chat_id' => $record->id,
            'message' => $newMessage,
            'messages' => $messages,
            'status' => $record->status,
        ];
    }

    /**
     * Backward-compatible helper method.
     */
    public static function appendMessage(string $agentId, string $sender, string $text, ?int $chatId = null): array
    {
        $res = self::appendToChat($agentId, $sender, $text, $chatId);
        return $res['message'];
    }

    /**
     * Get all messages for a specific chat ID.
     */
    public static function getChatMessages(?int $chatId, string $agentId): array
    {
        if (!$chatId) {
            return [];
        }

        $record = self::where('id', $chatId)
            ->where('agent_id', $agentId)
            ->first();

        return $record ? $record->decoded_messages : [];
    }
}
