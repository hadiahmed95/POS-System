<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
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
        });

        Route::prefix('add')->group(function () {

        });

        Route::prefix('edit')->group(function () {

        });

        Route::prefix('delete')->group(function () {

        });
    });
});