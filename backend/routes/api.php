<?php

use App\Http\Controllers\Api\v1\AdminController;
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

Route::prefix('v1')->group(function () {
    Route::controller(AuthController::class)->group(function () {
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
         *     "access_token": "...",
         *     "refresh_token": "...",
         *     "token_type": "bearer",
         *     "expires_in": 3600
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
         * Response (200):
         * {
         *   "success": true,
         *   "message": "Login bem-sucedido",
         *   "data": {
         *     "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url","deleted_at", "created_at", "updated_at" },
         *     "access_token": "...",
         *     "refresh_token": "...",
         *     "token_type": "bearer",
         *     "expires_in": 3600
         *   }
         * }
         */
        Route::post('/login', 'login');

        // Esse middleware "Route::middleware('auth:api')" obriga que seja passado o header Authorization: Bearer <token> para prosseguir com as requisições
        Route::middleware('auth:api')->group(function () {
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
             *   - Authorization: Bearer <REFRESH_TOKEN> (opcional)
             *
             * Body (JSON) - opcional se o token estiver no header:
             * {
             *   "refresh_token": "<REFRESH_TOKEN>"
             * }
             *
             * Response (200):
             * {
             *   "success": true,
             *   "message": "Token renovado com sucesso",
             *   "data": {
             *     "access_token": "...",
             *     "token_type": "bearer",
             *     "expires_in": 3600
             *   }
             * }
             */
            Route::post('/refresh', 'refresh');
        });
    });
    Route::middleware('auth:api')->group(function () {

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

    Route::middleware('auth:api')->group(function () {
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
        Route::middleware('admin')->group(function () {
            /**
             * ROTA DE CRIAÇÃO DE CURSO [Apenas Admin]
             *
             * POST /api/v1/courses
             *
             * ⚠️ REQUER AUTENTICAÇÃO: Apenas usuários com role 'admin' podem criar cursos
             *
             * Headers:
             *   - Content-Type: application/json
             *   - Accept: application/json
             *   - Authorization: Bearer <TOKEN_JWT_DO_ADMIN>
             *
             * Body (JSON):
             * {
             *   "title": "Violão do Zero",                    // OBRIGATÓRIO - string (max 255)
             *   "description": "Aprenda violão desde o início", // Opcional - string
             *   "price": 99.90,                              // Opcional - número (mín 0)
             *   "thumbnail": "https://example.com/img.jpg",  // Opcional - string (max 255)
             *   "is_published": false                        // Opcional - boolean (padrão: false)
             * }
             *
             * Response (201 Created):
             * {
             *   "message": "Curso criado com sucesso",
             *   "data": {
             *     "id": 1,
             *     "title": "Violão do Zero",
             *     "slug": "violao-do-zero",
             *     "description": "Aprenda violão desde o início",
             *     "price": "99.90",
             *     "thumbnail": "https://example.com/img.jpg",
             *     "is_published": false,
             *     "slug": "violao-do-zero",
             *     "created_at": "2026-03-20T10:30:00Z",
             *     "updated_at": "2026-03-20T10:30:00Z"
             *   }
             * }
             *
             * Response (401 Unauthorized):
             * {
             *   "message": "Token expirou ou é inválido"
             * }
             *
             * Response (403 Forbidden):
             * {
             *   "message": "Acesso negado. Apenas administradores podem acessar este recurso."
             * }
             *
             * Response (422 Unprocessable Entity):
             * {
             *   "message": "The title field is required.",
             *   "errors": {
             *     "title": ["The title field is required."]
             *   }
             * }
             *
             * 📝 NOTAS:
             * - O campo 'title' é OBRIGATÓRIO
             * - Um 'slug' é gerado automaticamente a partir do título
             * - Apenas usuários com role === 'admin' podem criar cursos
             * - O JWT token deve ser enviado no header Authorization: Bearer {token}
             * - O slug é criado automaticamente a partir do título (lowercase, hífens)
             *
             * 🔑 EXEMPLO COM cURL:
             * curl -X POST http://localhost:8000/api/v1/courses \
             *   -H "Content-Type: application/json" \
             *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
             *   -d '{
             *     "title": "Python Avançado",
             *     "description": "Masterclass de Python",
             *     "price": 149.90,
             *     "is_published": true
             *   }'
             */
            Route::post('/courses', [App\Http\Controllers\Api\v1\CourseController::class, 'store']);

            /**
             * ROTA DE EDIÇÃO DE CURSO [Apenas Admin]
             *
             * PUT /api/v1/courses/{course_id}
             *
             * ⚠️ REQUER AUTENTICAÇÃO: Apenas usuários com role 'admin' podem editar cursos
             *
             * Headers:
             *   - Content-Type: application/json
             *   - Accept: application/json
             *   - Authorization: Bearer <TOKEN_JWT_DO_ADMIN>
             *
             * URL Parameter:
             *   - {course_id}: ID do curso a ser editado (obrigatório)
             *
             * Body (JSON) - Enviar apenas os campos que deseja atualizar:
             * {
             *   "title": "Novo título do curso",           // Opcional
             *   "description": "Nova descrição",          // Opcional
             *   "price": 129.90,                         // Opcional
             *   "thumbnail": "https://novo.jpg",        // Opcional
             *   "is_published": true                    // Opcional
             * }
             *
             * Response (200 OK):
             * {
             *   "message": "Curso atualizado com sucesso",
             *   "data": {
             *     "id": 1,
             *     "title": "Novo título do curso",
             *     "slug": "novo-titulo-do-curso",
             *     "description": "Nova descrição",
             *     ...
             *   }
             * }
             *
             * Response (403 Forbidden):
             * {
             *   "message": "Acesso negado. Apenas administradores podem acessar este recurso."
             * }
             *
             * Response (404 Not Found):
             * {
             *   "message": "Curso não encontrado"
             * }
             *
             * 🔑 EXEMPLO COM cURL:
             * curl -X PUT http://localhost:8000/api/v1/courses/1 \
             *   -H "Content-Type: application/json" \
             *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
             *   -d '{"title": "Curso Atualizado", "price": 199.90}'
             */
            Route::put('/courses/{course}', [App\Http\Controllers\Api\v1\CourseController::class, 'update']);

            /**
             * ROTA DE EXCLUSÃO DE CURSO [Apenas Admin]
             *
             * DELETE /api/v1/courses/{course_id}
             *
             * ⚠️ REQUER AUTENTICAÇÃO: Apenas usuários com role 'admin' podem deletar cursos
             *
             * Headers:
             *   - Accept: application/json
             *   - Authorization: Bearer <TOKEN_JWT_DO_ADMIN>
             *
             * URL Parameter:
             *   - {course_id}: ID do curso a ser deletado (obrigatório)
             *
             * Body (JSON): Não requer body
             *
             * Response (200 OK):
             * {
             *   "message": "Curso deletado com sucesso"
             * }
             *
             * Response (403 Forbidden):
             * {
             *   "message": "Acesso negado. Apenas administradores podem acessar este recurso."
             * }
             *
             * Response (404 Not Found):
             * {
             *   "message": "Curso não encontrado"
             * }
             *
             * ⚠️ AVISO: A exclusão usa soft delete (deleted_at timestamp)
             * Os cursos são marcados como deletados mas não são removidos do banco de dados.
             *
             * 🔑 EXEMPLO COM cURL:
             * curl -X DELETE http://localhost:8000/api/v1/courses/1 \
             *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
             */
            Route::delete('/courses/{course}', [App\Http\Controllers\Api\v1\CourseController::class, 'destroy']);
        });

        // Privado (Admins e Instrutores gerenciam módulos e aulas dentro de um curso)
        Route::middleware('role:admin,instructor')->group(function () {
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
            Route::post('/modules/{module}/lessons/upload', [App\Http\Controllers\Api\v1\LessonController::class, 'storeWithUpload']);
            Route::put('/lessons/{lesson}', [App\Http\Controllers\Api\v1\LessonController::class, 'update']);
            Route::delete('/lessons/{lesson}', [App\Http\Controllers\Api\v1\LessonController::class, 'destroy']);
            Route::post('/lessons/{lesson}/materials/upload', [App\Http\Controllers\Api\v1\LessonController::class, 'uploadMaterial']);
        });
    });

    // ==========================================
    // ADMIN — Painel Administrativo
    // Requer: auth:api + role = admin
    // ==========================================

    Route::middleware(['auth:api', 'admin'])
        ->prefix('admin')
        ->controller(AdminController::class)
        ->group(function () {

            /**
             * DASHBOARD ADMINISTRATIVO
             *
             * GET /api/v1/admin/dashboard
             * Headers: Authorization: Bearer <TOKEN_ADMIN>
             *
             * Response (200):
             * {
             *   "success": true,
             *   "data": {
             *     "users": { "total", "students", "instructors", "admins", "premium", "free" },
             *     "courses": { "total", "published", "draft" },
             *     "enrollments": { "total", "active" }
             *   }
             * }
             */
            Route::get('/dashboard', 'dashboard');

            // ------------------------------------------
            // Usuários
            // ------------------------------------------

            /**
             * LISTAR USUÁRIOS
             *
             * GET /api/v1/admin/users
             * Query: ?role=student &search=alice &per_page=20
             *
             * Response (200): Paginação com todos os usuários (filtros opcionais).
             */
            Route::get('/users', 'listUsers');

            /**
             * DETALHE DE UM USUÁRIO
             *
             * GET /api/v1/admin/users/{id}
             *
             * Response (200): Dados completos do usuário + cursos matriculados.
             */
            Route::get('/users/{id}', 'showUser');

            /**
             * ALTERAR ROLE DO USUÁRIO
             *
             * PATCH /api/v1/admin/users/{id}/role
             * Body: { "role": "instructor" }
             *   - Valores aceitos: student | instructor | admin
             *   - Não é possível alterar a própria role.
             *
             * Response (200): { "success", "message", "data": { "id", "name", "email", "role" } }
             */
            Route::patch('/users/{id}/role', 'updateUserRole');

            /**
             * ALTERAR PLANO DO ALUNO
             *
             * PATCH /api/v1/admin/users/{id}/subscription
             * Body: { "subscription_type": "premium" }
             *   - Valores aceitos: free | premium
             *   - Só funciona para usuários com role = student.
             *
             * Response (200): { "success", "message", "data": { "id", "name", "email", "subscription_type" } }
             */
            Route::patch('/users/{id}/subscription', 'updateUserSubscription');

            // ------------------------------------------
            // Cursos (visão administrativa)
            // ------------------------------------------

            /**
             * LISTAR CURSOS (ADMIN)
             *
             * GET /api/v1/admin/courses
             * Query: ?search=laravel &is_published=true &per_page=20
             *
             * Response (200): Paginação de cursos (incluindo rascunhos) com contagem de alunos e aulas.
             */
            Route::get('/courses', 'listCourses');

            /**
             * DETALHE DE UM CURSO (ADMIN)
             *
             * GET /api/v1/admin/courses/{id}
             *
             * Response (200): Curso com módulos, aulas e lista de alunos matriculados.
             */
            Route::get('/courses/{id}', 'showCourse');
        });
});
