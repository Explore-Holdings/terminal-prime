<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PettyCashShiftLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_id',
        'ending_balance',
        'amount_spent',
    ];
}
