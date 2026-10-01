<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CustomerChat extends Model
{
    use HasFactory;

    protected $table = 'customer_chats';

    protected $fillable = [
        'agent_id',
        'customer_name',
        'customer_phone',
        'country',
        'country_code',
        'country_flag',
        'topic',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'messages',
        'latestMessage',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * Single record containing all JSON messages for this chat.
     */
    public function messageRecord(): HasOne
    {
        return $this->hasOne(CustomerChatMessage::class, 'chat_id');
    }

    /**
     * Decode and return all messages from the single JSON text message record.
     */
    public function getMessagesAttribute(): array
    {
        $record = $this->relationLoaded('messageRecord')
            ? $this->messageRecord
            : CustomerChatMessage::where('chat_id', $this->id)->first();

        return $record ? $record->decoded_messages : [];
    }

    /**
     * Return the latest message object for chat list previews.
     */
    public function getLatestMessageAttribute(): ?object
    {
        $msgs = $this->messages;
        if (empty($msgs)) {
            return null;
        }
        $last = end($msgs);
        return is_array($last) ? (object) $last : $last;
    }
}
