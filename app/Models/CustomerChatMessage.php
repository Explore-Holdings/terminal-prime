<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerChatMessage extends Model
{
    use HasFactory;

    protected $table = 'customer_chat_messages';

    // The table only has created_at
    const UPDATED_AT = null;

    protected $fillable = [
        'chat_id',
        'sender',
        'sender_name',
        'message',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(CustomerChat::class, 'chat_id');
    }

    /**
     * Decode the JSON stored in `message` text column into an array of message objects.
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
        if (is_array($decoded)) {
            return $decoded;
        }

        return [[
            'id' => 1,
            'sender' => $this->sender,
            'sender_name' => $this->sender_name,
            'message' => $this->message,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : now()->toISOString(),
        ]];
    }

    /**
     * Append a message to the single record for the given chat_id.
     * Records all messages for this chat in the same record as a JSON text array.
     */
    public static function appendMessage(int $chatId, string $sender, string $senderName, string $text): array
    {
        $record = self::where('chat_id', $chatId)->first();

        $nowStr = now()->format('Y-m-d H:i:s');
        $newMessage = [
            'id' => 1,
            'sender' => $sender,
            'sender_name' => $senderName,
            'message' => $text,
            'created_at' => $nowStr,
        ];

        if (!$record) {
            $messages = [$newMessage];
            self::create([
                'chat_id' => $chatId,
                'sender' => $sender,
                'sender_name' => $senderName,
                'message' => json_encode($messages, JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
            ]);
            return $newMessage;
        }

        $messages = $record->decoded_messages;
        $newMessage['id'] = count($messages) + 1;
        $messages[] = $newMessage;

        $record->update([
            'sender' => $sender,
            'sender_name' => $senderName,
            'message' => json_encode($messages, JSON_UNESCAPED_UNICODE),
        ]);

        return $newMessage;
    }

    /**
     * Get all messages for a given chat_id as an array.
     */
    public static function getChatMessages(int $chatId): array
    {
        $record = self::where('chat_id', $chatId)->first();
        return $record ? $record->decoded_messages : [];
    }
}
