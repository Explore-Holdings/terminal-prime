<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function hasPermission(string $permissionKey): bool
    {
        if (strtolower(trim($this->name)) === 'admin') {
            return true;
        }

        $permissions = $this->permissions ?? [];
        return in_array($permissionKey, $permissions, true);
    }
}