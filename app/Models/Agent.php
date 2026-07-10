<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'customer_passport',
        'name',
        'currency',
        'passenger_count',
        'luggage_count',
        'distance_km',
        'dropoff_location',
        'status',
        'price',
        'remarks',
        'new_currency',
        'new_price',
        'currency_updated_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function incentives()
    {
        return $this->hasMany(Incentive::class);
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class);
    }
}