<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankDetail extends Model
{
    protected $fillable = [
        'driver_id',
        'bank_name',
        'branch_name',
        'account_holder_name',
        'account_number',
        'swift_code',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}