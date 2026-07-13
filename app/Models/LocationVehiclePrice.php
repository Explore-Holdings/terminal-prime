<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocationVehiclePrice extends Model
{
    protected $table = 'location_vehicle_prices';

    protected $fillable = [
        'city',
        'district',
        'province',
        'zone',
        'sedan',
        'suv',
        'van',
        'luxury_suv',
        'luxury_sedan',
        'mini_coach',
        'economy',
    ];
}
