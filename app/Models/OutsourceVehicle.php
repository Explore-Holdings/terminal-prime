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
        'created_by',
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
}
