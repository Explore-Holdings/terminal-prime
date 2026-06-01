<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    protected $fillable = ['name'];

    public function drivers()
    {
        return $this->belongsToMany(
            Driver::class,
            'driver_service_categories'
        );
    }
}
