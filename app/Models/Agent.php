<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'booking_type',
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
        'external_vehicle_id',
        'external_vehicle_reg',
        'external_vehicle_make',
        'external_vehicle_model',
        'external_company_name',
        'rent_start_date',
        'rent_end_date',
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