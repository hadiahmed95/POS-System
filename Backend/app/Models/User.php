<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    public function branch() {
        return $this->hasOne(Branch::class, 'id', 'branch_id');
    }

    public function role() {
        return $this->hasOne(Role::class, 'id', 'role_id');
    }

    public function permissions() {
        return $this->hasMany(UserHasRole::class, 'user_id', 'id');
    }
}
