<?php

use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    return response()->json([
        'name' => config('app.name', 'digital-courses'),
        'environment' => app()->environment(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function()
{
    Route::controller(AuthController::class)->group(function(){
        Route::post('/login', 'login');
        Route::post('/register', 'register');
        Route::get('/me', 'me');
        Route::middleware('auth:api')->group(function(){
            Route::post('/me', 'updateProfile');
            Route::post('/logout', 'logout')->middleware('auth:api');
        });
    });
    Route::middleware('auth:api')->group(function(){
        Route::get('/users', [UserController::class, 'index'])->middleware('admin');
        Route::post('/me', [AuthController::class, 'updateProfile']);
    });
});

// ============================================================================
    // ROTAS DE AUTENTICAÇÃO (Públicas)
    // ============================================================================
    // POST /api/register - Cadastro de novo usuário
    // Request: { "name": "João Silva", "email": "joao@email.com", "password": "Senha123", "password_confirmation": "Senha123", "role": "student|instructor|admin", "avatar_url": "https://..." }
    // Response: { "user": { "id": 1, "name": "João Silva", "email": "joao@email.com", "role": "student" }, "token": "jwt_token_aqui" }

    // POST /api/login - Login de usuário existente
    // Request: { "email": "joao@email.com", "password": "senha123" }
    // Response: { "token": "jwt_token_aqui", "user": { "id": 1, "name": "João Silva", "email": "joao@email.com", "tipo": "contratante" } }
    #Route::post('/login', [AuthController::class, 'login']); 