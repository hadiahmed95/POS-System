<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'branch_id',
        'table_id',
        'customer_id',
        'created_by',
        'order_number',
        'table_no',
        'order_date',
        'subtotal',
        'discount',
        'tax',
        'total',
        'status',
        'payment_status',
        'notes',
        'order_taker_id'
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'order_date' => 'datetime',
        'subtotal' => 'float',
        'discount' => 'float',
        'tax' => 'float',
        'total' => 'float',
    ];
    
    /**
     * Get the branch that the order belongs to
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
    
    /**
     * Get the table that the order is assigned to
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }
    
    /**
     * Get the customer that placed the order
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    /**
     * Get the user that created the order
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    /**
     * Get the items in this order
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
    
    /**
     * Generate a unique order number
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD';
        $dateCode = date('Ymd');
        
        // Get the latest order number with the same prefix and date code
        $latestOrder = self::where('order_number', 'like', "{$prefix}{$dateCode}%")
            ->orderBy('id', 'desc')
            ->first();
        
        // Start from 1 if no orders exist for today, otherwise increment
        $nextNumber = 1;
        if ($latestOrder) {
            $lastNumber = (int) substr($latestOrder->order_number, strlen($prefix) + strlen($dateCode));
            $nextNumber = $lastNumber + 1;
        }
        
        // Format with leading zeros (5 digits)
        return $prefix . $dateCode . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}