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
        'payment_method',
        'payment_notes',
        'paid_amount',
        'payment_status',
        'transaction_id',
        'card_number',
        'invoice_number',
        'invoice_path',
    ];

    protected $casts = [
        'payment_notes' => 'array',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function latestTrip()
    {
        return $this->hasOne(Trip::class)->latestOfMany();
    }
}