<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLoginLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'shift_id',
        'ip_address',
        'user_agent',
        'login_at',
        'logout_at',
        'handed_over_at',
    ];

    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
        'handed_over_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
