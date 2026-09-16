<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PettyCashReturn extends Model
{
    protected $fillable = ['customer_id', 'amount_lkr', 'shift_id'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
