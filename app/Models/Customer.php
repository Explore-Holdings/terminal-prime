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
        'arrival_date',
        'departure_date',
        'passport_image',
        'dropoff_location',
        'passenger_count',
        'language_preference',
        'status',
        'remarks',
        'payment_method',
        'payment_shift_id',
        'paid_at',
        'payment_notes',
        'paid_amount',
        'payment_status',
        'transaction_id',
        'card_number',
        'invoice_number',
        'invoice_path',
        'finance_received',
        'finance_received_amount',
        'finance_received_by',
        'finance_received_at',
        'accountant_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'arrival_date' => 'date:Y-m-d',
        'departure_date' => 'date:Y-m-d',
        'paid_at' => 'datetime',
        'payment_notes' => 'array',
        'finance_received' => 'boolean',
        'finance_received_at' => 'datetime',
        'accountant_approved' => 'boolean',
        'approved_at' => 'datetime',
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

    public function financeReceiver()
    {
        return $this->belongsTo(User::class, 'finance_received_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paymentSlips()
    {
        return $this->hasMany(PaymentSlip::class);
    }
}
