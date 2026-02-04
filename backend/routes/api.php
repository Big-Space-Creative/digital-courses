<?php

use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/status', function (Request $request) {
    return response()->json([
        'name' => config('app.name', 'digital-courses'),
        'environment' => app()->environment(),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function(){
    
    // ============================================================================
    // ROTAS DE AUTENTICAÇÃO (Públicas)
    // ============================================================================
    // POST /api/register - Cadastro de novo usuário
    // Request: { "name": "João Silva", "email": "joao@email.com", "password": "Senha123", "password_confirmation": "Senha123", "role": "student|instructor|admin", "avatar_url": "https://..." }
    // Response: { "user": { "id": 1, "name": "João Silva", "email": "joao@email.com", "role": "student" }, "token": "jwt_token_aqui" }
    Route::post('/register', [AuthController::class, 'register']);
    
    // POST /api/login - Login de usuário existente
    // Request: { "email": "joao@email.com", "password": "senha123" }
    // Response: { "token": "jwt_token_aqui", "user": { "id": 1, "name": "João Silva", "email": "joao@email.com", "tipo": "contratante" } }
    Route::post('/login', [AuthController::class, 'login']);
    
    //Get /api/v1/users
    Route::middleware('auth:api')->group(function(){
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/users', [UserController::class, 'index']);
    });
});