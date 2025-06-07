<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseType extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'expense_name',
        'added_by'
    ];

    /**
     * Get the user who added this expense type
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * Get all expenses of this type
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'expense_type_id');
    }
}