<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'branch_id',
        'expense_type_id',
        'added_by',
        'expense_title',
        'description',
        'amount',
        'expense_date',
        'payment_method',
        'receipt_number',
        'receipt_image',
        'status',
        'approved_by',
        'approved_date',
        'approval_notes'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'amount' => 'float',
        'expense_date' => 'date',
        'approved_date' => 'date',
    ];

    /**
     * Get the branch that the expense belongs to
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    /**
     * Get the expense type
     */
    public function expenseType(): BelongsTo
    {
        return $this->belongsTo(ExpenseType::class, 'expense_type_id');
    }

    /**
     * Get the user who added this expense
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * Get the user who approved this expense
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by expense type
     */
    public function scopeByType($query, $typeId)
    {
        return $query->where('expense_type_id', $typeId);
    }
}