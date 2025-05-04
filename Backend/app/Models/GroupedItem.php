<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupedItem extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'parent_item',
        'item_id'
    ];
    
    public function parentItem()
    {
        return $this->belongsTo(Item::class, 'parent_item');
    }
    
    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }
}
