<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'order_id',
        'item_id',
        'item_name',
        'quantity',
        'unit_price',
        'discount',
        'total',
        'notes'
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'float',
        'discount' => 'float',
        'total' => 'float',
    ];
    
    /**
     * Get the order that this item belongs to
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
    
    /**
     * Get the product item
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}