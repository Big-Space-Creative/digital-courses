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
        /**
         * ROTA DE AUTENTICAÇÃO DE REGISTRO
         *
         * POST /api/v1/register
         * Headers:
         *   - Content-Type: application/json
         *   - Accept: application/json
         *
         * Body (JSON):
         * {
         *   "name": "Alice6",
         *   "email": "alice6@example.com",
         *   "password": "Password123",
         *   "password_confirmation": "Password123",
         *   "role": "admin",
         *   "avatar_url": ""
         * }
         *
         * Response (201):
         * {
         *   "success": true,
         *   "message": "Usuário registrado com sucesso",
         *   "data": {
         *     "user": { "id", "name", "email", "role", "avatar_url", "created_at" },
         *     "token": "..."
         *   }
         * }
         */
        Route::post('/register', 'register');
        /**
         * ROTA DE AUTENTICAÇÃO DE LOGIN
         *
         * POST /api/v1/login
         * Headers:
         *   - Content-Type: application/json
         *   - Accept: application/json
         *
         * Body (JSON):
         * {
         *   "email": "alice6@example.com",
         *   "password": "Password123",
         * }
         *
         * Response (201):
         * {
         *   "success": true,
         *   "message": "Login bem-sucedido",
         *   "data": {
         *     "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url","deleted_at", "created_at", "updated_at" },
         *     "token": "..."
         *   }
         * }
         */
        Route::post('/login', 'login');
        
            // Esse middleware "Route::middleware('auth:api')" obriga que seja passado o header Authorization: Bearer <token> para prosseguir com as requisições
            Route::middleware('auth:api')->group(function(){
            /**
             * ROTA DE INFORMAÇÕES DO USUÁRIO
             *
             * GET /api/v1/me
             * Headers:
             *   - Content-Type: application/json
             *   - Accept: application/json
             *   - Authorization: Bearer <TOKEN_JWT>
             * 
             * Body (JSON): none
             * 
             * Response (201):
             * {
             *   "message": "Usuário autenticado",
             *   "data": {
             *     "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url","deleted_at", "created_at", "updated_at" },
             *     "token": "..."
             *   }
             * }
             */
            Route::get('/me', 'me');
            /**
             * ROTA DE INFORMAÇÕES DO USUÁRIO
             *
             * POST /api/v1/me
             * Headers:
             *   - Content-Type: application/json
             *   - Accept: application/json
             *   - Authorization: Bearer <TOKEN_JWT>
             * 
             * Body (JSON):
             * {
             *     "name": "Novo Nome",
             *     "phone": "+55 11 99999-9999",
             *     "avatar_url": "https://imagem.com/foto.png"
             * } 
             * 
             * Observação:
             *   - O e-mail NÃO pode ser alterado por este endpoint.
             * 
             * Response (201):
             * {
             *   "message": "Perfil atualizado com sucesso",
             *   "data": {
             *     "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url","deleted_at", "created_at", "updated_at" },
             *     "token": "..."
             *   }
             * }
             */
            Route::post('/me', 'updateProfile');
            /**
             * ROTA DE LOGOUT DO USUÁRIO
             *
             * POST /api/v1/logout
             * Headers:
             *   - Content-Type: application/json
             *   - Accept: application/json
             *   - Authorization: Bearer <TOKEN_JWT>
             * 
             * Body (JSON): none
             * 
             * Response (201):
             * {
             *   "status": "success",
             *   "message": "Successfully logged out"
             * }
             */
            Route::post('/logout', 'logout')->middleware('auth:api');
        });
    });
    Route::middleware('auth:api')->group(function(){
        
        /**
         * ROTA DE LISTAGEM DE USUÁRIOS (ADMIN)
         *
         * GET /api/v1/users
         * Headers:
         *   - Content-Type: application/json
         *   - Accept: application/json
         *   - Authorization: Bearer <TOKEN_JWT>
         *
         * Body (JSON): none
         *
         * Response (200):
         * {
         *   "message": "Lista de usuários",
         *   "data": [
         *     { "id", "name", "email", "role", "subscription_type", "avatar_url", "created_at", "updated_at" }
         *   ]
         * }
         */
        Route::get('/users', [UserController::class, 'index'])->middleware('admin');
        /**
         * ROTA DE ATUALIZAÇÃO DE USUÁRIO (ADMIN)
         *
         * PUT /api/v1/users/{id}
         * Headers:
         *   - Content-Type: application/json
         *   - Accept: application/json
         *   - Authorization: Bearer <TOKEN_JWT DE UM ADMIN>
         *
         * Body (JSON):
         * {
         *   "name": "Novo Nome",
         *   "email": "usuario@exemplo.com",
         *   "role": "student",
         *   "subscription_type": "premium",
         *   "avatar_url": "https://imagem.com/foto.png"
         * }
         *
         * Response (200):
         * {
         *   "message": "Usuário atualizado com sucesso",
         *   "data": {
         *     "user": { "id", "name", "email", "role", "subscription_type", "avatar_url", "created_at", "updated_at" }
         *   }
         * }
         */
        Route::put('/users/{id}', [UserController::class, 'update'])->middleware('admin');
        /**
         * ROTA DE ATUALIZAÇÃO DO PERFIL DO USUÁRIO
         *
         * POST /api/v1/me
         * Headers:
         *   - Content-Type: application/json
         *   - Accept: application/json
         *   - Authorization: Bearer <TOKEN_JWT DE UM ADMIN>
         *
         * Body (JSON):
         * {
         *   "name": "Novo Nome",
         *   "phone": "+55 11 99999-9999",
         *   "avatar_url": "https://imagem.com/foto.png"
         * }
         *
         * Observação:
         *   - O e-mail NÃO pode ser alterado por este endpoint.
         *
         * Response (201):
         * {
         *   "message": "Perfil atualizado com sucesso",
         *   "data": {
         *     "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url","deleted_at", "created_at", "updated_at" }
         *   }
         * }
         */
        Route::post('/me', [AuthController::class, 'updateProfile']);
    });
});