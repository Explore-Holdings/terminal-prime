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
}
