<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ExpenseController extends Controller
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
     * Get all expenses or a specific expense by ID
     */
    public function view(Request $request, $id = null)
    {
        $filters = [];
        $relationships = ['expenseType', 'branch', 'addedBy', 'approvedBy'];
        
        if ($id) {
            $filters[] = [
                "column" => "id",
                "condition" => "=",
                "value" => $id
            ];
        }
        
        // Filter by expense type if provided
        if ($request->has('expense_type_id')) {
            $filters[] = [
                "column" => "expense_type_id",
                "condition" => "=",
                "value" => $request->expense_type_id
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
        
        // Filter by payment method if provided
        if ($request->has('payment_method')) {
            $filters[] = [
                "column" => "payment_method",
                "condition" => "=",
                "value" => $request->payment_method
            ];
        }
        
        // Filter by date range if provided
        if ($request->has('date_from') && $request->has('date_to')) {
            $filters[] = [
                "column" => "expense_date",
                "condition" => ">=",
                "value" => $request->date_from
            ];
            
            $filters[] = [
                "column" => "expense_date",
                "condition" => "<=",
                "value" => $request->date_to
            ];
        }
        
        // Filter by amount range if provided
        if ($request->has('min_amount')) {
            $filters[] = [
                "column" => "amount",
                "condition" => ">=",
                "value" => $request->min_amount
            ];
        }
        
        if ($request->has('max_amount')) {
            $filters[] = [
                "column" => "amount",
                "condition" => "<=",
                "value" => $request->max_amount
            ];
        }
        
        return ($id != null) ? 
            getSingleRecord(Expense::class, $filters, $relationships) : 
            getRecord(Expense::class, $filters, $relationships);
    }

    /**
     * Add a new expense record
     */
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'expense_type_id' => 'required|exists:expense_types,id',
            'expense_title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'nullable|in:cash,bank_transfer,cheque,credit_card',
            'receipt_number' => 'nullable|string|max:100',
            'receipt_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'status' => 'nullable|in:pending,approved,rejected,paid'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            // Prepare expense data
            $expenseData = $request->except(['receipt_image']);
            $expenseData['payment_method'] = $request->payment_method ?? 'cash';
            $expenseData['status'] = $request->status ?? 'pending';

            // Handle receipt image upload
            if ($request->hasFile('receipt_image')) {
                $file = $request->file('receipt_image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads/expenses/receipts', $fileName, 'public');
                $expenseData['receipt_image'] = $path;
            }

            // Create expense record
            $expense = Expense::create($expenseData);

            // Fetch the complete expense with relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $expense->id
                ]
            ];
            $relationships = ['expenseType', 'branch', 'addedBy', 'approvedBy'];
            $result = getSingleRecord(Expense::class, $filters, $relationships);
            
            return setApiResponse(1, "Expense record added successfully!", 200, json_decode($result->getContent(), true)['data']);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to add expense record!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Update an existing expense record
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:expenses,id',
            'expense_type_id' => 'required|exists:expense_types,id',
            'expense_title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'nullable|in:cash,bank_transfer,cheque,credit_card',
            'receipt_number' => 'nullable|string|max:100',
            'receipt_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'status' => 'nullable|in:pending,approved,rejected,paid'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $expense = Expense::find($request->id);
            
            if (!$expense) {
                return setApiResponse(0, "Expense record not found!", 404);
            }

            // Prepare update data
            $updateData = $request->except(['id', 'receipt_image']);

            // Handle receipt image upload
            if ($request->hasFile('receipt_image')) {
                // Delete old image if exists
                if ($expense->receipt_image && Storage::disk('public')->exists($expense->receipt_image)) {
                    Storage::disk('public')->delete($expense->receipt_image);
                }

                $file = $request->file('receipt_image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads/expenses/receipts', $fileName, 'public');
                $updateData['receipt_image'] = $path;
            }

            // Update expense record
            $expense->update($updateData);

            // Fetch the updated expense with relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $expense->id
                ]
            ];
            $relationships = ['expenseType', 'branch', 'addedBy', 'approvedBy'];
            $result = getSingleRecord(Expense::class, $filters, $relationships);
            
            return setApiResponse(1, "Expense record updated successfully!", 200, json_decode($result->getContent(), true)['data']);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update expense record!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Delete an expense record
     */
    public function delete(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Expense ID is required!", 400);
        }

        try {
            $expense = Expense::find($request->id);
            
            if (!$expense) {
                return setApiResponse(0, "Expense record not found!", 404);
            }

            // Delete receipt image if exists
            if ($expense->receipt_image && Storage::disk('public')->exists($expense->receipt_image)) {
                Storage::disk('public')->delete($expense->receipt_image);
            }

            $expense->delete();
            
            return setApiResponse(1, "Expense record deleted successfully!", 200);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to delete expense record!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Restore a deleted expense record
     */
    public function restore(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Expense ID is required!", 400);
        }

        return restoreRecord(Expense::class, $request->id);
    }

    /**
     * Approve or reject an expense
     */
    public function updateApproval(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:expenses,id',
            'status' => 'required|in:approved,rejected',
            'approval_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $expense = Expense::find($request->id);
            
            if (!$expense) {
                return setApiResponse(0, "Expense record not found!", 404);
            }

            $user = $request->attributes->get('user');
            
            $updateData = [
                'status' => $request->status,
                'approved_by' => $user->id,
                'approved_date' => now()->toDateString(),
                'approval_notes' => $request->approval_notes
            ];

            $expense->update($updateData);
            
            return setApiResponse(1, "Expense " . $request->status . " successfully!", 200, $expense);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update expense approval!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Update expense status
     */
    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:expenses,id',
            'status' => 'required|in:pending,approved,rejected,paid'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $expense = Expense::find($request->id);
            
            if (!$expense) {
                return setApiResponse(0, "Expense record not found!", 404);
            }

            $expense->update(['status' => $request->status]);
            
            return setApiResponse(1, "Expense status updated successfully!", 200, $expense);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update expense status!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Get expense statistics
     */
    public function getStats(Request $request)
    {
        try {
            $query = Expense::query();
            
            // Apply date range filters if provided
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->whereBetween('expense_date', [
                    $request->date_from,
                    $request->date_to
                ]);
            }
            
            // Apply branch filter if provided
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }
            
            // Get total expenses by status
            $totalPending = $query->clone()->where('status', 'pending')->sum('amount');
            $totalApproved = $query->clone()->where('status', 'approved')->sum('amount');
            $totalPaid = $query->clone()->where('status', 'paid')->sum('amount');
            $totalRejected = $query->clone()->where('status', 'rejected')->sum('amount');
            
            // Get count of expenses by status
            $countPending = $query->clone()->where('status', 'pending')->count();
            $countApproved = $query->clone()->where('status', 'approved')->count();
            $countPaid = $query->clone()->where('status', 'paid')->count();
            $countRejected = $query->clone()->where('status', 'rejected')->count();
            
            // Get total expenses
            $totalExpenses = $query->sum('amount');
            $totalCount = $query->count();
            
            // Get average expense amount
            $avgExpense = $query->avg('amount') ?? 0;
            
            // Get expenses by type
            $expensesByType = $query->clone()
                ->selectRaw('expense_type_id, SUM(amount) as total_amount, COUNT(*) as count')
                ->with('expenseType:id,expense_name')
                ->groupBy('expense_type_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'type_id' => $item->expense_type_id,
                        'type_name' => $item->expenseType->expense_name ?? 'Unknown',
                        'total_amount' => $item->total_amount,
                        'count' => $item->count
                    ];
                });
            
            // Get monthly expenses for current year
            $monthlyExpenses = $query->clone()
                ->whereYear('expense_date', now()->year)
                ->selectRaw('MONTH(expense_date) as month, SUM(amount) as total_amount')
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->pluck('total_amount', 'month');
            
            $stats = [
                'totals' => [
                    'total_expenses' => $totalExpenses,
                    'total_count' => $totalCount,
                    'average_expense' => $avgExpense,
                    'pending_amount' => $totalPending,
                    'approved_amount' => $totalApproved,
                    'paid_amount' => $totalPaid,
                    'rejected_amount' => $totalRejected
                ],
                'counts' => [
                    'pending_count' => $countPending,
                    'approved_count' => $countApproved,
                    'paid_count' => $countPaid,
                    'rejected_count' => $countRejected
                ],
                'by_type' => $expensesByType,
                'monthly_expenses' => $monthlyExpenses
            ];
            
            return setApiResponse(1, "Expense statistics retrieved successfully!", 200, $stats);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve expense statistics!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Get pending expenses for approval
     */
    public function getPendingApprovals(Request $request)
    {
        try {
            $filters = [
                [
                    "column" => "status",
                    "condition" => "=",
                    "value" => "pending"
                ]
            ];
            
            // Apply branch filter if provided
            if ($request->has('branch_id')) {
                $filters[] = [
                    "column" => "branch_id",
                    "condition" => "=",
                    "value" => $request->branch_id
                ];
            }
            
            $relationships = ['expenseType', 'branch', 'addedBy'];
            
            return getRecord(Expense::class, $filters, $relationships);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve pending expenses!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Bulk approve/reject expenses
     */
    public function bulkApproval(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'expense_ids' => 'required|array|min:1',
            'expense_ids.*' => 'exists:expenses,id',
            'status' => 'required|in:approved,rejected',
            'approval_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $user = $request->attributes->get('user');
            
            $updateData = [
                'status' => $request->status,
                'approved_by' => $user->id,
                'approved_date' => now()->toDateString(),
                'approval_notes' => $request->approval_notes
            ];

            $updated = Expense::whereIn('id', $request->expense_ids)
                ->where('status', 'pending') // Only update pending expenses
                ->update($updateData);
            
            return setApiResponse(1, "Bulk approval completed! {$updated} expenses {$request->status}.", 200, [
                'updated_count' => $updated,
                'status' => $request->status
            ]);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to perform bulk approval!", 400, ["error" => $e->getMessage()]);
        }
    }
}