<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
    use SoftDeletes;
    protected $guarded = [];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    /**
     * Get grouped items where this item is the parent
     * This returns child items of a group item
     */
    public function groupedItems(): HasMany
    {
        return $this->hasMany(GroupedItem::class, 'parent_item', 'id');
    }
    
    /**
     * Get groups where this item is a member
     * This returns parent items that contain this item
     */
    public function memberOfGroups()
    {
        return $this->hasMany(GroupedItem::class, 'item_id', 'id');
    }
}