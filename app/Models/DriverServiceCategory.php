<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverServiceCategory extends Model
{
    protected $fillable = [
        'driver_id',
        'service_category_id',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function serviceCategory()
    {
        return $this->belongsTo(ServiceCategory::class);
    }
}