<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    protected $fillable = [
        'trip_id',
        'customer_id',
        'agent_id',
        'driver_id',
        'currency',
        'trip_amount',
        'driver_amount',
        'agent_amount',
        'company_amount',
        'expense_amount',
        'status',
        'remarks',
        'created_by',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}