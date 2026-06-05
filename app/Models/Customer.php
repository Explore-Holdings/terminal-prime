<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'agent_id',
        'created_by',
        'customer_code',
        'name',
        'email',
        'mobile_number',
        'whatsapp_number',
        'country',
        'passport_image',
        'dropoff_location',
        'passenger_count',
        'language_preference',
        'status',
        'remarks',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}