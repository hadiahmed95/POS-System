<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use SoftDeletes;
    protected $fillable = ["role_name"];

    public function permissions() {
        return $this->hasMany(UserHasRole::class, 'role_id');
    }
}
