<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/status', function (Request $request) {
    return response()->json([
        'name' => config('app.name', 'digital-courses'),
        'environment' => app()->environment(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('admin')->group(function (): void {
    Route::get('users', [UserController::class, 'index']);
});
