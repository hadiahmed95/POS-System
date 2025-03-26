<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Table extends Model
{
    use SoftDeletes;
    protected $fillable = [
        "table_no",
        "capacity",
        "type",
        "status",
        "added_by"
    ];
}
