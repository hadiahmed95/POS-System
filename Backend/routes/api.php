<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolesPermissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\CheckToken;

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
        });

        Route::prefix('add')->group(function () {
<<<<<<< HEAD
            Route::post("/roles", [RolesPermissionController::class, "addRole"]);
=======
            Route::post("/users", [UserController::class, "add"]);
>>>>>>> feature/ha_users_crud_api
        });

        Route::prefix('edit')->group(function () {
            Route::post("/roles", [RolesPermissionController::class, "updateRole"]);
        });

        Route::prefix('delete')->group(function () {
            Route::post("/roles", [RolesPermissionController::class, "deleteRole"]);
        });
    });
});