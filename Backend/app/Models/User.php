<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model
{
<<<<<<< HEAD
    use SoftDeletes;
    protected $fillable = [];
=======
    protected $fillable = [
        'branch_id',
        'role_id',
        'name', 
        'email', 
        'password',
    ];
>>>>>>> feature/ha_users_crud_api
    
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
