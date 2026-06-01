<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyContact extends Model
{
    protected $fillable = [
        'driver_id',
        'contact_name',
        'relationship',
        'contact_number',
        'alternative_contact_number',
        'address',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
