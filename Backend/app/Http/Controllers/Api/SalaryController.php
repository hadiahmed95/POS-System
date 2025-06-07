<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalaryController extends Controller
{
    public function __construct(Request $request) {
        // Merge user ID and branch ID for tracking
        if ($request->attributes->has('user')) {
            $user = $request->attributes->get('user');
            $request->merge([
                'added_by' => $user->id,
                'branch_id' => $user->branch_id
            ]);
        }
    }

    /**
     * Get all salaries or a specific salary by ID
     */
    public function view(Request $request, $id = null)
    {
        $filters = [];
        $relationships = ['employee', 'branch', 'addedBy'];
        
        if ($id) {
            $filters[] = [
                "column" => "id",
                "condition" => "=",
                "value" => $id
            ];
        }
        
        // Filter by employee if provided
        if ($request->has('employee_id')) {
            $filters[] = [
                "column" => "employee_id",
                "condition" => "=",
                "value" => $request->employee_id
            ];
        }
        
        // Filter by salary month if provided
        if ($request->has('salary_month')) {
            $filters[] = [
                "column" => "salary_month",
                "condition" => "=",
                "value" => $request->salary_month
            ];
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $filters[] = [
                "column" => "status",
                "condition" => "=",
                "value" => $request->status
            ];
        }
        
        // Filter by date range if provided
        if ($request->has('date_from') && $request->has('date_to')) {
            $filters[] = [
                "column" => "salary_month",
                "condition" => ">=",
                "value" => $request->date_from
            ];
            
            $filters[] = [
                "column" => "salary_month",
                "condition" => "<=",
                "value" => $request->date_to
            ];
        }
        
        return ($id != null) ? 
            getSingleRecord(Salary::class, $filters, $relationships) : 
            getRecord(Salary::class, $filters, $relationships);
    }

    /**
     * Add a new salary record
     */
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:users,id',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'salary_month' => 'required|date',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:pending,paid,cancelled',
            'payment_method' => 'nullable|in:cash,bank_transfer,cheque',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            // Check if salary already exists for this employee and month
            $existingSalary = Salary::where('employee_id', $request->employee_id)
                ->where('salary_month', $request->salary_month)
                ->first();

            if ($existingSalary) {
                return setApiResponse(0, "Salary for this employee and month already exists!", 400);
            }

            // Set default values
            $salaryData = $request->all();
            $salaryData['allowances'] = $request->allowances ?? 0;
            $salaryData['deductions'] = $request->deductions ?? 0;
            $salaryData['overtime_hours'] = $request->overtime_hours ?? 0;
            $salaryData['overtime_rate'] = $request->overtime_rate ?? 0;
            $salaryData['bonus'] = $request->bonus ?? 0;
            $salaryData['status'] = $request->status ?? 'pending';
            $salaryData['payment_method'] = $request->payment_method ?? 'cash';

            // Create salary record (net_salary will be calculated automatically)
            $salary = Salary::create($salaryData);

            // Fetch the complete salary with relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $salary->id
                ]
            ];
            $relationships = ['employee', 'branch', 'addedBy'];
            $result = getSingleRecord(Salary::class, $filters, $relationships);
            
            return setApiResponse(1, "Salary record added successfully!", 200, json_decode($result->getContent(), true)['data']);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to add salary record!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Update an existing salary record
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:salaries,id',
            'employee_id' => 'required|exists:users,id',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'overtime_hours' => 'nullable|numeric|min:0',
            'overtime_rate' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'salary_month' => 'required|date',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:pending,paid,cancelled',
            'payment_method' => 'nullable|in:cash,bank_transfer,cheque',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $salary = Salary::find($request->id);
            
            if (!$salary) {
                return setApiResponse(0, "Salary record not found!", 404);
            }

            // Check if salary already exists for this employee and month (excluding current record)
            $existingSalary = Salary::where('employee_id', $request->employee_id)
                ->where('salary_month', $request->salary_month)
                ->where('id', '!=', $request->id)
                ->first();

            if ($existingSalary) {
                return setApiResponse(0, "Salary for this employee and month already exists!", 400);
            }

            // Update salary record
            $updateData = $request->except(['id']);
            $updateData['allowances'] = $request->allowances ?? 0;
            $updateData['deductions'] = $request->deductions ?? 0;
            $updateData['overtime_hours'] = $request->overtime_hours ?? 0;
            $updateData['overtime_rate'] = $request->overtime_rate ?? 0;
            $updateData['bonus'] = $request->bonus ?? 0;

            $salary->update($updateData);

            // Fetch the updated salary with relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $salary->id
                ]
            ];
            $relationships = ['employee', 'branch', 'addedBy'];
            $result = getSingleRecord(Salary::class, $filters, $relationships);
            
            return setApiResponse(1, "Salary record updated successfully!", 200, json_decode($result->getContent(), true)['data']);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update salary record!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Delete a salary record
     */
    public function delete(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Salary ID is required!", 400);
        }

        try {
            $salary = Salary::find($request->id);
            
            if (!$salary) {
                return setApiResponse(0, "Salary record not found!", 404);
            }

            $salary->delete();
            
            return setApiResponse(1, "Salary record deleted successfully!", 200);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to delete salary record!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Restore a deleted salary record
     */
    public function restore(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Salary ID is required!", 400);
        }

        return restoreRecord(Salary::class, $request->id);
    }

    /**
     * Get salary statistics
     */
    public function getStats(Request $request)
    {
        try {
            $query = Salary::query();
            
            // Apply date range filters if provided
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('salary_month', [
                    $request->date_from,
                    $request->date_to
                ]);
            }
            
            // Apply branch filter if provided
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }
            
            // Get total salaries paid
            $totalPaid = $query->where('status', 'paid')->sum('net_salary');
            
            // Get total pending salaries
            $totalPending = $query->where('status', 'pending')->sum('net_salary');
            
            // Get count of employees paid
            $employeesPaid = $query->where('status', 'paid')->distinct('employee_id')->count();
            
            // Get count of pending payments
            $pendingPayments = $query->where('status', 'pending')->count();
            
            // Get average salary
            $avgSalary = $query->avg('net_salary') ?? 0;
            
            $stats = [
                'total_paid' => $totalPaid,
                'total_pending' => $totalPending,
                'employees_paid' => $employeesPaid,
                'pending_payments' => $pendingPayments,
                'average_salary' => $avgSalary,
                'total_salary_expense' => $totalPaid + $totalPending
            ];
            
            return setApiResponse(1, "Salary statistics retrieved successfully!", 200, $stats);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve salary statistics!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Update salary status (for marking as paid)
     */
    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:salaries,id',
            'status' => 'required|in:pending,paid,cancelled',
            'payment_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $salary = Salary::find($request->id);
            
            if (!$salary) {
                return setApiResponse(0, "Salary record not found!", 404);
            }

            $updateData = ['status' => $request->status];
            
            // If marking as paid and no payment date provided, use current date
            if ($request->status === 'paid') {
                $updateData['payment_date'] = $request->payment_date ?? now()->toDateString();
            }

            $salary->update($updateData);
            
            return setApiResponse(1, "Salary status updated successfully!", 200, $salary);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update salary status!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Generate salary slip/report for an employee
     */
    public function generateSlip(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:users,id',
            'salary_month' => 'required|date'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $salary = Salary::with(['employee', 'branch'])
                ->where('employee_id', $request->employee_id)
                ->where('salary_month', $request->salary_month)
                ->first();

            if (!$salary) {
                return setApiResponse(0, "Salary record not found for this employee and month!", 404);
            }

            // Format the salary slip data
            $salarySlip = [
                'employee' => [
                    'name' => $salary->employee->name,
                    'email' => $salary->employee->email,
                    'employee_id' => $salary->employee_id
                ],
                'branch' => [
                    'name' => $salary->branch->branch_name,
                    'address' => $salary->branch->branch_address
                ],
                'salary_details' => [
                    'month' => $salary->salary_month->format('F Y'),
                    'basic_salary' => $salary->basic_salary,
                    'allowances' => $salary->allowances,
                    'overtime_hours' => $salary->overtime_hours,
                    'overtime_rate' => $salary->overtime_rate,
                    'overtime_amount' => $salary->overtime_hours * $salary->overtime_rate,
                    'bonus' => $salary->bonus,
                    'gross_earnings' => $salary->basic_salary + $salary->allowances + ($salary->overtime_hours * $salary->overtime_rate) + $salary->bonus,
                    'deductions' => $salary->deductions,
                    'net_salary' => $salary->net_salary,
                    'status' => $salary->status,
                    'payment_date' => $salary->payment_date?->format('Y-m-d'),
                    'payment_method' => $salary->payment_method
                ],
                'generated_at' => now()->format('Y-m-d H:i:s')
            ];

            return setApiResponse(1, "Salary slip generated successfully!", 200, $salarySlip);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to generate salary slip!", 400, ["error" => $e->getMessage()]);
        }
    }
}