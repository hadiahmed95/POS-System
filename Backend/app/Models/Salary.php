<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Salary extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'branch_id',
        'employee_id',
        'added_by',
        'basic_salary',
        'allowances',
        'deductions',
        'overtime_hours',
        'overtime_rate',
        'bonus',
        'net_salary',
        'salary_month',
        'payment_date',
        'status',
        'payment_method',
        'notes'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'basic_salary' => 'float',
        'allowances' => 'float',
        'deductions' => 'float',
        'overtime_hours' => 'float',
        'overtime_rate' => 'float',
        'bonus' => 'float',
        'net_salary' => 'float',
        'salary_month' => 'date',
        'payment_date' => 'date',
    ];

    /**
     * Get the branch that the salary belongs to
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    /**
     * Get the employee (user) that the salary is for
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    /**
     * Get the user who added this salary record
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    /**
     * Calculate net salary automatically
     */
    public function calculateNetSalary(): float
    {
        $overtime_amount = $this->overtime_hours * $this->overtime_rate;
        return $this->basic_salary + $this->allowances + $overtime_amount + $this->bonus - $this->deductions;
    }

    /**
     * Boot method to auto-calculate net salary
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($salary) {
            $salary->net_salary = $salary->calculateNetSalary();
        });
    }
}