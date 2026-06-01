<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverLanguage extends Model
{
    protected $fillable = [
        'driver_id',
        'language_name',
        'speaking_level',
        'reading_level',
        'writing_level',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}