<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupedItem extends Model
{
    use SoftDeletes;
    protected $fillable = ["parent_item", "item_id"];
    protected $table = "grouped_items";
}
