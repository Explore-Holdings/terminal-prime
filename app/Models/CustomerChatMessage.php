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

    protected $casts = [
        'agent_id' => 'integer',
    ];

    protected $attributes = [
        'status' => 'continuing',
    ];

    /**
     * Relationship to User via foreign key agent_id -> users.id
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id', 'id');
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
     * Uses agent_id as an unsigned big integer foreign key to users.id.
     */
    public static function appendToChat(int $agentFkId, string $sender, string $text, ?int $chatId = null): array
    {
        $record = null;

        if ($chatId) {
            $record = self::where('id', $chatId)
                ->where('agent_id', $agentFkId)
                ->first();
        }

        // If no existing chat specified or found, or if previous chat was finished, start a new chat row
        if (!$record || $record->status === 'finished') {
            $record = self::create([
                'agent_id' => $agentFkId,
                'status' => 'continuing',
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
    public static function appendMessage(int $agentFkId, string $sender, string $text, ?int $chatId = null): array
    {
        $res = self::appendToChat($agentFkId, $sender, $text, $chatId);
        return $res['message'];
    }

    /**
     * Get all messages for a specific chat ID.
     */
    public static function getChatMessages(?int $chatId, int $agentFkId): array
    {
        if (!$chatId) {
            return [];
        }

        $record = self::where('id', $chatId)
            ->where('agent_id', $agentFkId)
            ->first();

        return $record ? $record->decoded_messages : [];
    }
}
