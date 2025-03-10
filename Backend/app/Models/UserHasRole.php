<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserHasRole extends Model
{
    use SoftDeletes;
    protected $fillable = ["user_id", "module_id", "permission_id", "is_allowed"];

    public function module() {
        return $this->hasOne(Module::class, 'id', 'module_id');
    }

    public function permission() {
        return $this->hasOne(Permission::class, 'id', 'permission_id');
    }
}
