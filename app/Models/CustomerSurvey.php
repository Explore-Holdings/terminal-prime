<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerSurvey extends Model
{
    protected $fillable = [
        'trip_id',
        'customer_id',
        'driver_id',
        'journey_rating',
        'driver_rating',
        'driver_charged_extra',
        'extra_amount',
        'driver_was_polite',
        'vehicle_was_clean',
        'felt_safe',
        'comments',
    ];
}