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
            /**
             * ROTA DE REFRESH TOKEN DO USUÁRIO
             *
             * POST /api/v1/refresh
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
             *   "message": "Successfully refreshed token"
             * }
             */
            Route::post('/refresh', 'refresh')->middleware('auth:api');
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
    
    // ==========================================
    // COURSE MANAGEMENT
    // ==========================================

    Route::middleware('auth:api')->group(function() {
        /**
         * ROTA DE LISTAGEM DE CURSOS
         *
         * GET /api/v1/courses
         * Headers: Authorization: Bearer <TOKEN>
         * Response (200): Lista de cursos com os módulos e aulas (sem `video_url`).
         * Usado por estudantes para ver a vitrine/ementa geral.
         */
        Route::get('/courses', [App\Http\Controllers\Api\v1\CourseController::class, 'index']);

        /**
         * ROTA DE DETALHES DO CURSO
         *
         * GET /api/v1/courses/{course_id}
         * Headers: Authorization: Bearer <TOKEN>
         * Response (200): Detalha os dados do curso, módulos e lista de aulas associadas.
         */
        Route::get('/courses/{course}', [App\Http\Controllers\Api\v1\CourseController::class, 'show']);

        /**
         * ROTA DE ACESSO À AULA (VIDEO)
         *
         * GET /api/v1/lessons/{lesson_id}
         * Headers: Authorization: Bearer <TOKEN>
         * Comportamento: 
         *  - Se admin/instrutor: Retorna aula completa (video, comments, materials).
         *  - Se estudante: Apenas se for `is_free_preview: true` OU usuário Premium (HTTP 403 caso contrário).
         */
        Route::get('/lessons/{lesson}', [App\Http\Controllers\Api\v1\LessonController::class, 'show']);

        // Privado (Apenas Admins gerenciam cursos)
        Route::middleware('admin')->group(function() {
            /**
             * ROTA DE CRIAÇÃO DE CURSO [Apenas Admin]
             *
             * POST /api/v1/courses
             * Body: { "title": "...", "description": "...", "price": 0.00, "is_published": true }
             */
            Route::post('/courses', [App\Http\Controllers\Api\v1\CourseController::class, 'store']);

            /**
             * ROTA DE EDIÇÃO DE CURSO [Apenas Admin]
             *
             * PUT /api/v1/courses/{course_id}
             * Body: { "title": "Novo nome..." } // Enviar apenas os campos a atualizar.
             */
            Route::put('/courses/{course}', [App\Http\Controllers\Api\v1\CourseController::class, 'update']);

            /**
             * ROTA DE EXCLUSÃO DE CURSO [Apenas Admin]
             * DELETE /api/v1/courses/{course_id}
             */
            Route::delete('/courses/{course}', [App\Http\Controllers\Api\v1\CourseController::class, 'destroy']);
        });

        // Privado (Admins e Instrutores gerenciam módulos e aulas dentro de um curso)
        Route::middleware('role:admin,instructor')->group(function() {
            /**
             * CRIAÇÃO/EDIÇÃO/EXCLUSÃO DE MÓDULOS [Admin, Instrutor]
             *
             * POST /api/v1/courses/{course_id}/modules -> Body: { "order": 1 }
             * PUT /api/v1/courses/{course_id}/modules/{module_id} -> Body: { "order": 2 }
             * DELETE /api/v1/courses/{course_id}/modules/{module_id}
             */
            Route::post('/courses/{course}/modules', [App\Http\Controllers\Api\v1\ModuleController::class, 'store']);
            Route::put('/courses/{course}/modules/{module}', [App\Http\Controllers\Api\v1\ModuleController::class, 'update']);
            Route::delete('/courses/{course}/modules/{module}', [App\Http\Controllers\Api\v1\ModuleController::class, 'destroy']);
            
            /**
             * CRIAÇÃO/EDIÇÃO/EXCLUSÃO DE AULAS [Admin, Instrutor]
             *
             * POST /api/v1/modules/{module_id}/lessons
             * Body: { "title": "Aula 1", "video_url": "https...", "is_free_preview": false, "duration_in_minutes": 10 }
             * 
             * PUT /api/v1/lessons/{lesson_id} 
             * Body: { "title": "Novo Titulo" }
             * 
             * DELETE /api/v1/lessons/{lesson_id}
             */
            Route::post('/modules/{module}/lessons', [App\Http\Controllers\Api\v1\LessonController::class, 'store']);
            Route::put('/lessons/{lesson}', [App\Http\Controllers\Api\v1\LessonController::class, 'update']);
            Route::delete('/lessons/{lesson}', [App\Http\Controllers\Api\v1\LessonController::class, 'destroy']);
        });
    });
});