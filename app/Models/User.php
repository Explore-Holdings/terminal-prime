<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'role_id',
        'agent_id',
        'driver_id',
        'email',
        'password',
        'designation',
        'signature',
    ];

    public static function generateNextAgentId(): string
    {
        $maxId = 0;
        $agentIds = static::whereNotNull('agent_id')->pluck('agent_id');
        foreach ($agentIds as $aid) {
            if (preg_match('/^AGNT-(\d+)$/i', trim($aid), $matches)) {
                $num = (int)$matches[1];
                if ($num > $maxId) {
                    $maxId = $num;
                }
            }
        }
        return 'AGNT-' . ($maxId + 1);
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            $role = null;
            if (!empty($user->role_id)) {
                $role = Role::find($user->role_id);
            }
            if ($role && strtolower(trim($role->name)) === 'agent') {
                if (empty($user->agent_id)) {
                    $user->agent_id = static::generateNextAgentId();
                }
            } else {
                $user->agent_id = null;
            }
        });

        static::updating(function ($user) {
            if ($user->isDirty('role_id')) {
                $role = null;
                if (!empty($user->role_id)) {
                    $role = Role::find($user->role_id);
                }
                if ($role && strtolower(trim($role->name)) === 'agent') {
                    if (empty($user->agent_id)) {
                        $user->agent_id = static::generateNextAgentId();
                    }
                } else {
                    $user->agent_id = null;
                }
            }
        });
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function agents()
    {
        return $this->hasMany(Agent::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function loginLogs()
    {
        return $this->hasMany(UserLoginLog::class);
    }

    public function customerChats()
    {
        return $this->hasMany(CustomerChat::class, 'agent_id');
    }
}
