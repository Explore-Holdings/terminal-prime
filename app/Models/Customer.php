<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    protected $fillable = [
        'agent_id',
        'customer_code',
        'name',
        'email',
        'mobile_number',
        'whatsapp_number',
        'country',
        'passport_image',
        'status',
        'remarks',
        'language_preference',
        'passenger_count',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}