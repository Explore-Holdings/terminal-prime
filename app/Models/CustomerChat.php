<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(CustomerChatMessage::class, 'chat_id')->orderBy('created_at', 'asc');
    }

    public function latestMessage()
    {
        return $this->hasOne(CustomerChatMessage::class, 'chat_id')->latestOfMany('created_at');
    }
}
