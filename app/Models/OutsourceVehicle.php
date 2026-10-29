<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutsourceVehicle extends Model
{
    protected $fillable = [
        'customer_id',
        'agent_id',
        'price',
        'advance_payment',
        'vehicle_number',
        'mobile_number',
        'invoice_path',
        'invoice_generated_at',
        'created_by',
        'received',
        'received_amount',
        'received_by',
        'received_at',
        'accountant_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'invoice_generated_at' => 'datetime',
        'received' => 'boolean',
        'received_at' => 'datetime',
        'accountant_approved' => 'boolean',
        'approved_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
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
