<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnologyInfo extends Model
{
    protected $table = 'technology_info';

    protected $fillable = [
        'driver_id',
        'smartphone_available',
        'device_type',
        'internet_connection_available',
        'gps_tracking_enabled',
        'mobile_app_usage_experience',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}