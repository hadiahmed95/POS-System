<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ExpenseTypeController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\RolesPermissionController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SalaryController;

// Route::middleware('check.connections')->group(function() {
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
    
    Route::middleware('api')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout']);
    
        Route::middleware('check.token')->group(function () {
            Route::get("/user-permissions/{id?}", [RolesPermissionController::class, "viewUserPermissions"]);

            // Route::middleware('check.permission')->group(function () {
                
                Route::prefix('view')->group(function () {
                    Route::get("/users/{id?}", [UserController::class, "view"]);
                    Route::post("/users/get-user-by-token", [UserController::class, "getUserByToken"]);
                    Route::get("/roles/{id?}", [RolesPermissionController::class, "viewRole"]);
                    Route::get("/modules/{id?}", [RolesPermissionController::class, "viewModules"]);
                    Route::get("/permissions/{id?}", [RolesPermissionController::class, "viewPermissions"]);
                    
                    Route::get("/branches/{id?}", [BranchController::class, "view"]);
                    Route::get("/brands/{id?}", [BrandController::class, "view"]);
                    Route::get("/units/{id?}", [UnitController::class, "view"]);
                    Route::get("/vendors/{id?}", [VendorController::class, "view"]);
                    Route::get("/categories/{id?}", [CategoryController::class, "view"]);
                    Route::get("/tables/{id?}", [TableController::class, "view"]);
                    Route::get("/items/{id?}", [ItemController::class, "view"]);

                    // Orders API
                    Route::get("/orders/table/{tableId}", [OrderController::class, "getTableOrders"]);
                    Route::get("/kitchen/orders", [OrderController::class, "getKitchenOrders"]);
                    Route::get("/orders/stats", [OrderController::class, "getStats"]);
                    Route::get("/orders/{id?}", [OrderController::class, "view"]);

                    // Salary API
                    Route::get("/salaries/stats", [SalaryController::class, "getStats"]);
                    Route::get("/salaries/slip", [SalaryController::class, "generateSlip"]);
                    Route::get("/salaries/{id?}", [SalaryController::class, "view"]);

                    // Expense Type API
                    Route::get("/expense-types/stats", [ExpenseTypeController::class, "getWithStats"]);
                    Route::get("/expense-types/most-used", [ExpenseTypeController::class, "getMostUsed"]);
                    Route::get("/expense-types/summary", [ExpenseTypeController::class, "getSummary"]);
                    Route::get("/expense-types/search", [ExpenseTypeController::class, "search"]);
                    Route::get("/expense-types/{id?}", [ExpenseTypeController::class, "view"]);

                    // Expense API
                    Route::get("/expenses/stats", [ExpenseController::class, "getStats"]);
                    Route::get("/expenses/pending-approvals", [ExpenseController::class, "getPendingApprovals"]);
                    Route::get("/expenses/{id?}", [ExpenseController::class, "view"]);
                });
        
                Route::prefix('add')->group(function () {
                    Route::post("/roles", [RolesPermissionController::class, "addRole"]);
                    Route::post("/users", [UserController::class, "add"]);
                    Route::post("/branches", [BranchController::class, "add"]);
                    Route::post("/brands", [BrandController::class, "add"]);
                    Route::post("/units", [UnitController::class, "add"]);
                    Route::post("/vendors", [VendorController::class, "add"]);
                    Route::post("/categories", [CategoryController::class, "add"]);
                    Route::post("/tables", [TableController::class, "add"]);
                    Route::post("/items", [ItemController::class, "add"]);

                    // Orders API
                    Route::post("/orders", [OrderController::class, "add"]);

                    // Salary API
                    Route::post("/salaries", [SalaryController::class, "add"]);

                    // Expense Type API
                    Route::post("/expense-types", [ExpenseTypeController::class, "add"]);

                    // Expense API
                    Route::post("/expenses", [ExpenseController::class, "add"]);
                });
                
                Route::prefix('record')->group(function () {
                    Route::post("/branches", [BranchController::class, 'singleRecord']);
                });

                Route::prefix('edit')->group(function () {
                    Route::post("/roles", [RolesPermissionController::class, "updateRole"]);
                    Route::post("/users", [UserController::class, "update"]);
                    Route::post("/branches", [BranchController::class, "update"]);
                    Route::post("/brands", [BrandController::class, "update"]);
                    Route::post("/units", [UnitController::class, "update"]);
                    Route::post("/vendors", [VendorController::class, "update"]);
                    Route::post("/categories", [CategoryController::class, "update"]);
                    Route::post("/tables", [TableController::class, "update"]);
                    Route::post("/items", [ItemController::class, "update"]);

                    // Orders API
                    Route::post("/orders", [OrderController::class, "update"]);
                    Route::post("/orders/status", [OrderController::class, "updateStatus"]);

                    // Salary API
                    Route::post("/salaries", [SalaryController::class, "update"]);
                    Route::post("/salaries/status", [SalaryController::class, "updateStatus"]);

                    // Expense Type API
                    Route::post("/expense-types", [ExpenseTypeController::class, "update"]);

                    // Expense API
                    Route::post("/expenses", [ExpenseController::class, "update"]);
                    Route::post("/expenses/status", [ExpenseController::class, "updateStatus"]);
                    Route::post("/expenses/approval", [ExpenseController::class, "updateApproval"]);
                    Route::post("/expenses/bulk-approval", [ExpenseController::class, "bulkApproval"]);
                });
        
                Route::prefix('delete')->group(function () {
                    Route::post("/roles", [RolesPermissionController::class, "deleteRole"]);
                    Route::post("/users", [UserController::class, "delete"]);
                    Route::post("/branches", [BranchController::class, "delete"]);
                    Route::post("/brands", [BrandController::class, "delete"]);
                    Route::post("/units", [UnitController::class, "delete"]);
                    Route::post("/vendors", [VendorController::class, "delete"]);
                    Route::post("/categories", [CategoryController::class, "delete"]);
                    Route::post("/tables", [TableController::class, "delete"]);
                    Route::post("/items", [ItemController::class, "delete"]);

                    // Orders API
                    Route::post("/orders", [OrderController::class, "delete"]);

                    // Salary API
                    Route::post("/salaries", [SalaryController::class, "delete"]);

                    // Expense Type API
                    Route::post("/expense-types", [ExpenseTypeController::class, "delete"]);

                    // Expense API
                    Route::post("/expenses", [ExpenseController::class, "delete"]);
                });

                Route::prefix('restore')->group(function () {
                    Route::post("/roles", [RolesPermissionController::class, "restoreRole"]);
                    Route::post("/branches", [BranchController::class, "restore"]);
                    Route::post("/brands", [BrandController::class, "restore"]);
                    Route::post("/units", [UnitController::class, "restore"]);
                    Route::post("/vendors", [VendorController::class, "restore"]);
                    Route::post("/categories", [CategoryController::class, "restore"]);
                    Route::post("/tables", [TableController::class, "restore"]);
                    Route::post("/items", [ItemController::class, "restore"]);

                    // Salary API
                    Route::post("/salaries", [SalaryController::class, "restore"]);

                    // Expense Type API
                    Route::post("/expense-types", [ExpenseTypeController::class, "restore"]);

                    // Expense API
                    Route::post("/expenses", [ExpenseController::class, "restore"]);
                });
            // });
        });
    });
// });