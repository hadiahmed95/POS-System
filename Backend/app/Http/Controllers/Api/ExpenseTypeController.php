<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseTypeController extends Controller
{
    public function __construct(Request $request) {
        // Merge user ID for tracking who added the expense type
        if ($request->attributes->has('user')) {
            $request->merge(['added_by' => $request->attributes->get('user')->id]);
        }
    }

    /**
     * Get all expense types or a specific expense type by ID
     */
    public function view(Request $request, $id = null)
    {
        $filters = [];
        $relationships = ['addedBy'];
        
        if ($id) {
            $filters[] = [
                "column" => "id",
                "condition" => "=",
                "value" => $id
            ];
        }
        
        return ($id != null) ? 
            getSingleRecord(ExpenseType::class, $filters, $relationships) : 
            getRecord(ExpenseType::class, $filters, $relationships);
    }

    /**
     * Add a new expense type
     */
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'expense_name' => 'required|string|max:255|unique:expense_types,expense_name'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $expenseType = ExpenseType::create($request->all());

            // Fetch the complete expense type with relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $expenseType->id
                ]
            ];
            $relationships = ['addedBy'];
            $result = getSingleRecord(ExpenseType::class, $filters, $relationships);
            
            return setApiResponse(1, "Expense type added successfully!", 200, json_decode($result->getContent(), true)['data']);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to add expense type!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Update an existing expense type
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:expense_types,id',
            'expense_name' => 'required|string|max:255|unique:expense_types,expense_name,' . $request->id
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $expenseType = ExpenseType::find($request->id);
            
            if (!$expenseType) {
                return setApiResponse(0, "Expense type not found!", 404);
            }

            $expenseType->update($request->except(['id']));

            // Fetch the updated expense type with relationships
            $filters = [
                [
                    "column" => "id",
                    "condition" => "=",
                    "value" => $expenseType->id
                ]
            ];
            $relationships = ['addedBy'];
            $result = getSingleRecord(ExpenseType::class, $filters, $relationships);
            
            return setApiResponse(1, "Expense type updated successfully!", 200, json_decode($result->getContent(), true)['data']);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to update expense type!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Delete an expense type
     */
    public function delete(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Expense type ID is required!", 400);
        }

        try {
            $expenseType = ExpenseType::find($request->id);
            
            if (!$expenseType) {
                return setApiResponse(0, "Expense type not found!", 404);
            }

            // Check if expense type is being used by any expenses
            if ($expenseType->expenses()->count() > 0) {
                return setApiResponse(0, "Cannot delete expense type that is being used by expenses!", 400);
            }

            $expenseType->delete();
            
            return setApiResponse(1, "Expense type deleted successfully!", 200);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to delete expense type!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Restore a deleted expense type
     */
    public function restore(Request $request)
    {
        if (!$request->has('id')) {
            return setApiResponse(0, "Expense type ID is required!", 400);
        }

        return restoreRecord(ExpenseType::class, $request->id);
    }

    /**
     * Get expense types with their expense counts and totals
     */
    public function getWithStats(Request $request)
    {
        try {
            $expenseTypes = ExpenseType::withCount('expenses')
                ->with(['addedBy'])
                ->get()
                ->map(function ($type) {
                    $totalAmount = $type->expenses()->sum('amount');
                    $approvedAmount = $type->expenses()->where('status', 'approved')->sum('amount');
                    $paidAmount = $type->expenses()->where('status', 'paid')->sum('amount');
                    
                    return [
                        'id' => $type->id,
                        'expense_name' => $type->expense_name,
                        'added_by' => $type->addedBy,
                        'expenses_count' => $type->expenses_count,
                        'total_amount' => $totalAmount,
                        'approved_amount' => $approvedAmount,
                        'paid_amount' => $paidAmount,
                        'created_at' => $type->created_at,
                        'updated_at' => $type->updated_at
                    ];
                });
            
            return setApiResponse(1, "Expense types with statistics retrieved successfully!", 200, $expenseTypes);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve expense types with statistics!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Get expense types that are most used
     */
    public function getMostUsed(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            
            $mostUsedTypes = ExpenseType::withCount('expenses')
                ->with(['addedBy'])
                ->having('expenses_count', '>', 0)
                ->orderBy('expenses_count', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($type) {
                    $totalAmount = $type->expenses()->sum('amount');
                    
                    return [
                        'id' => $type->id,
                        'expense_name' => $type->expense_name,
                        'expenses_count' => $type->expenses_count,
                        'total_amount' => $totalAmount,
                        'added_by' => $type->addedBy
                    ];
                });
            
            return setApiResponse(1, "Most used expense types retrieved successfully!", 200, $mostUsedTypes);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve most used expense types!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Search expense types by name
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'search' => 'required|string|min:1'
        ]);

        if ($validator->fails()) {
            return setApiResponse(0, "Validation failed!", 400, $validator->errors());
        }

        try {
            $searchTerm = $request->search;
            
            $expenseTypes = ExpenseType::where('expense_name', 'LIKE', "%{$searchTerm}%")
                ->with(['addedBy'])
                ->withCount('expenses')
                ->get();
            
            return setApiResponse(1, "Search results retrieved successfully!", 200, $expenseTypes);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to search expense types!", 400, ["error" => $e->getMessage()]);
        }
    }

    /**
     * Get expense types summary for dashboard
     */
    public function getSummary(Request $request)
    {
        try {
            $totalTypes = ExpenseType::count();
            $activeTypes = ExpenseType::has('expenses')->count();
            $inactiveTypes = $totalTypes - $activeTypes;
            
            // Get top 5 expense types by total amount
            $topByAmount = ExpenseType::withCount('expenses')
                ->get()
                ->map(function ($type) {
                    $totalAmount = $type->expenses()->sum('amount');
                    return [
                        'id' => $type->id,
                        'expense_name' => $type->expense_name,
                        'total_amount' => $totalAmount
                    ];
                })
                ->sortByDesc('total_amount')
                ->take(5)
                ->values();

            // Get top 5 expense types by count
            $topByCount = ExpenseType::withCount('expenses')
                ->orderBy('expenses_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'expense_name' => $type->expense_name,
                        'expenses_count' => $type->expenses_count
                    ];
                });

            $summary = [
                'totals' => [
                    'total_types' => $totalTypes,
                    'active_types' => $activeTypes,
                    'inactive_types' => $inactiveTypes
                ],
                'top_by_amount' => $topByAmount,
                'top_by_count' => $topByCount
            ];
            
            return setApiResponse(1, "Expense types summary retrieved successfully!", 200, $summary);
        } catch (\Exception $e) {
            return setApiResponse(0, "Failed to retrieve expense types summary!", 400, ["error" => $e->getMessage()]);
        }
    }
}