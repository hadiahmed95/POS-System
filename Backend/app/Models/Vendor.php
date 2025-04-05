<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use SoftDeletes;
    protected $fillable = [
        "vendor_name",
        "vendor_address",
        "vendor_phone",
        "vendor_description",
    ];
}
