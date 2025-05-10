<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupedItem extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'parent_item',
        'item_id'
    ];
    
    /**
     * Get the parent item (the group)
     */
    public function parentItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'parent_item', 'id');
    }
    
    /**
     * Get the child item
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id', 'id');
    }
}