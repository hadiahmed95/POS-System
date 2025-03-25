<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RolesPermissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\VendorController;

Route::middleware('check.connections')->group(function() {
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
    
    Route::middleware('api')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout']);
    
        Route::middleware(['check.token'])->group(function () {
            Route::prefix('view')->group(function () {
                Route::get("/users", [UserController::class, "view"]);
                Route::get("/roles", [RolesPermissionController::class, "viewRole"]);
                Route::get("/modules", [RolesPermissionController::class, "viewModules"]);
                Route::get("/permissions", [RolesPermissionController::class, "viewPermissions"]);
                Route::get("/user-permissions", [RolesPermissionController::class, "viewUserPermissions"]);
                Route::get("/branches", [BranchController::class, "view"]);
                Route::get("/brands", [BrandController::class, "view"]);
                Route::get("/units", [UnitController::class, "view"]);
                Route::get("/vendors", [VendorController::class, "view"]);
                Route::get("/categories/{id?}", [CategoryController::class, "view"]);
            });
    
            Route::prefix('add')->group(function () {
                Route::post("/roles", [RolesPermissionController::class, "addRole"]);
                Route::post("/users", [UserController::class, "add"]);
                Route::post("/branches", [BranchController::class, "add"]);
                Route::post("/brands", [BrandController::class, "add"]);
                Route::post("/units", [UnitController::class, "add"]);
                Route::post("/vendors", [VendorController::class, "add"]);
                Route::post("/categories", [CategoryController::class, "add"]);
            });
            
            Route::prefix('record')->group(function () {
                Route::post("/branches", [BranchController::class, 'singleRecord']);
            });

            Route::prefix('edit')->group(function () {
                Route::post("/roles", [RolesPermissionController::class, "updateRole"]);
                Route::post("/branches", [BranchController::class, "update"]);
                Route::post("/brands", [BrandController::class, "update"]);
                Route::post("/units", [UnitController::class, "update"]);
                Route::post("/vendors", [VendorController::class, "update"]);
                Route::post("/categories", [CategoryController::class, "update"]);
            });
    
            Route::prefix('delete')->group(function () {
                Route::post("/roles", [RolesPermissionController::class, "deleteRole"]);
                Route::post("/branches", [BranchController::class, "delete"]);
                Route::post("/brands", [BrandController::class, "delete"]);
                Route::post("/units", [UnitController::class, "delete"]);
                Route::post("/vendors", [VendorController::class, "delete"]);
                Route::post("/categories", [CategoryController::class, "delete"]);
            });
        });
    });
});