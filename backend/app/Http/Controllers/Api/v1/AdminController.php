<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class AdminController extends Controller
{
    /*
     |--------------------------------------------------------------------------
     | Dashboard
     |--------------------------------------------------------------------------
     */

    /**
     * Retorna as métricas gerais da plataforma para o painel administrativo.
     *
     * GET /api/v1/admin/dashboard
     *
     * @OA\Get(
     *     path="/api/v1/admin/dashboard",
     *     operationId="adminDashboard",
     *     tags={"Admin"},
     *     summary="Dashboard administrativo",
     *     description="Retorna métricas gerais: totais de usuários, cursos e matrículas. Exclusivo para admins.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Dashboard carregado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Dashboard carregado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="users", type="object",
     *                     @OA\Property(property="total",       type="integer"),
     *                     @OA\Property(property="students",    type="integer"),
     *                     @OA\Property(property="instructors", type="integer"),
     *                     @OA\Property(property="admins",      type="integer"),
     *                     @OA\Property(property="premium",     type="integer"),
     *                     @OA\Property(property="free",        type="integer")
     *                 ),
     *                 @OA\Property(property="courses", type="object",
     *                     @OA\Property(property="total",     type="integer"),
     *                     @OA\Property(property="published", type="integer"),
     *                     @OA\Property(property="draft",     type="integer")
     *                 ),
     *                 @OA\Property(property="enrollments", type="object",
     *                     @OA\Property(property="total",  type="integer"),
     *                     @OA\Property(property="active", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado — somente admins")
     * )
     */
    public function dashboard(): JsonResponse
    {
        $totalUsers = User::count();
        $totalStudents = User::where('role', User::ROLE_STUDENT)->count();
        $totalInstructors = User::where('role', User::ROLE_INSTRUCTOR)->count();
        $totalAdmins = User::where('role', User::ROLE_ADMIN)->count();
        $premiumStudents = User::where('role', User::ROLE_STUDENT)
            ->where('subscription_type', 'premium')
            ->count();
        $freeStudents = User::where('role', User::ROLE_STUDENT)
            ->where('subscription_type', 'free')
            ->count();

        $totalCourses = Course::count();
        $publishedCourses = Course::where('is_published', true)->count();
        $totalEnrollments = Enrollment::count();
        $activeEnrollments = Enrollment::where('status', 'active')->count();

        // Conta aulas pertencentes a cursos publicados
        $activeLessons = Lesson::whereHas('module.course', function ($q) {
            $q->where('is_published', true);
        })->count();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard carregado com sucesso',
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'students' => $totalStudents,
                    'instructors' => $totalInstructors,
                    'admins' => $totalAdmins,
                    'premium' => $premiumStudents,
                    'free' => $freeStudents,
                ],
                'courses' => [
                    'total' => $totalCourses,
                    'published' => $publishedCourses,
                    'draft' => $totalCourses - $publishedCourses,
                ],
                'enrollments' => [
                    'total' => $totalEnrollments,
                    'active' => $activeEnrollments,
                ],
                'lessons' => [
                    'active' => $activeLessons,
                ],
            ],
        ]);
    }

    /*
     |--------------------------------------------------------------------------
     | Gerenciamento de Usuários
     |--------------------------------------------------------------------------
     */

    /**
     * Lista todos os usuários com paginação e filtro opcional por role.
     *
     * GET /api/v1/admin/users
     * Query: ?role=student&search=alice&per_page=20
     *
     * @OA\Get(
     *     path="/api/v1/admin/users",
     *     operationId="adminListUsers",
     *     tags={"Admin/Users"},
     *     summary="Listar usuários",
     *     description="Lista todos os usuários com paginação. Suporta filtro por role e busca por nome/e-mail.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="role",     in="query", required=false, description="Filtrar por role", @OA\Schema(type="string", enum={"student","instructor","admin"})),
     *     @OA\Parameter(name="search",   in="query", required=false, description="Busca por nome ou e-mail", @OA\Schema(type="string", example="alice")),
     *     @OA\Parameter(name="per_page", in="query", required=false, description="Itens por página (padrão 20)", @OA\Schema(type="integer", example=20)),
     *
     *     @OA\Response(response=200, description="Usuários listados",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Usuários listados com sucesso"),
     *             @OA\Property(property="data",    type="object", description="Resposta paginada do Laravel")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado")
     * )
     */
    public function listUsers(Request $request): JsonResponse
    {
        $query = User::query();

        // Filtra por role se informado
        if ($request->filled('role')) {
            $request->validate([
                'role' => ['in:student,instructor,admin'],
            ]);
            $query->where('role', $request->role);
        }

        // Busca por nome ou e-mail
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 20);
        $users = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Usuários listados com sucesso',
            'data' => $users,
        ]);
    }

    /**
     * Exibe os detalhes de um usuário específico incluindo seus cursos matriculados.
     *
     * GET /api/v1/admin/users/{id}
     *
     * @OA\Get(
     *     path="/api/v1/admin/users/{id}",
     *     operationId="adminShowUser",
     *     tags={"Admin/Users"},
     *     summary="Exibir usuário",
     *     description="Retorna detalhes de um usuário incluindo seus cursos matriculados.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do usuário", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Usuário encontrado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Usuário encontrado"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado"),
     *     @OA\Response(response=404, description="Usuário não encontrado")
     * )
     */
    public function showUser(int $id): JsonResponse
    {
        $user = User::with([
            'enrollments.course:id,title,slug,thumbnail',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Usuário encontrado',
            'data' => $user,
        ]);
    }

    /**
     * Altera a role de um usuário.
     * Não é possível alterar a própria role via este endpoint.
     *
     * PATCH /api/v1/admin/users/{id}/role
     * Body: { "role": "instructor" }
     *
     * @OA\Patch(
     *     path="/api/v1/admin/users/{id}/role",
     *     operationId="adminUpdateUserRole",
     *     tags={"Admin/Users"},
     *     summary="Alterar role do usuário",
     *     description="Altera o tipo (role) de um usuário. O admin não pode alterar a própria role.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do usuário", @OA\Schema(type="integer", example=2)),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"role"},
     *
     *             @OA\Property(property="role", type="string", enum={"student","instructor","admin"}, example="instructor")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Role atualizada",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Role do usuário atualizada de 'student' para 'instructor' com sucesso."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id",    type="integer"),
     *                 @OA\Property(property="name",  type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="role",  type="string")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado ou tentativa de alterar a própria role"),
     *     @OA\Response(response=404, description="Usuário não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function updateUserRole(Request $request, int $id): JsonResponse
    {
        // Admin não pode alterar a própria role
        if (auth()->id() === $id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não pode alterar a sua própria role.',
            ], 403);
        }

        $validated = $request->validate([
            'role' => ['required', 'in:student,instructor,admin'],
        ], [
            'role.required' => 'O campo role é obrigatório.',
            'role.in' => 'A role deve ser: student, instructor ou admin.',
        ]);

        $user = User::findOrFail($id);
        $old = $user->role;
        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Role do usuário atualizada de '{$old}' para '{$validated['role']}' com sucesso.",
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Altera o subscription_type de um aluno (free / premium).
     *
     * PATCH /api/v1/admin/users/{id}/subscription
     * Body: { "subscription_type": "premium" }
     *
     * @OA\Patch(
     *     path="/api/v1/admin/users/{id}/subscription",
     *     operationId="adminUpdateUserSubscription",
     *     tags={"Admin/Users"},
     *     summary="Alterar plano do aluno",
     *     description="Altera o plano (free/premium) de um usuário com role student.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do usuário (student)", @OA\Schema(type="integer", example=3)),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"subscription_type"},
     *
     *             @OA\Property(property="subscription_type", type="string", enum={"free","premium"}, example="premium")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Plano atualizado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Plano do aluno atualizado para 'premium' com sucesso."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id",                type="integer"),
     *                 @OA\Property(property="name",              type="string"),
     *                 @OA\Property(property="email",             type="string"),
     *                 @OA\Property(property="subscription_type", type="string")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado"),
     *     @OA\Response(response=404, description="Usuário não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação ou usuário não é student")
     * )
     */
    public function updateUserSubscription(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'subscription_type' => ['required', 'in:free,premium'],
        ], [
            'subscription_type.required' => 'O campo subscription_type é obrigatório.',
            'subscription_type.in' => 'O plano deve ser: free ou premium.',
        ]);

        $user = User::findOrFail($id);

        if ($user->role !== User::ROLE_STUDENT) {
            return response()->json([
                'success' => false,
                'message' => 'O subscription_type só pode ser alterado para usuários do tipo student.',
            ], 422);
        }

        $user->subscription_type = $validated['subscription_type'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "Plano do aluno atualizado para '{$validated['subscription_type']}' com sucesso.",
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'subscription_type' => $user->subscription_type,
            ],
        ]);
    }

    /*
     |--------------------------------------------------------------------------
     | Gerenciamento de Cursos (visão administrativa)
     |--------------------------------------------------------------------------
     */

    /**
     * Lista todos os cursos (incluindo não publicados) com contagem de alunos e aulas.
     *
     * GET /api/v1/admin/courses
     * Query: ?search=laravel&is_published=true&per_page=20
     *
     * @OA\Get(
     *     path="/api/v1/admin/courses",
     *     operationId="adminListCourses",
     *     tags={"Admin/Courses"},
     *     summary="Listar cursos (admin)",
     *     description="Lista todos os cursos incluindo os não publicados. Suporta filtro e paginação.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="search",       in="query", required=false, description="Busca por título ou descrição", @OA\Schema(type="string", example="violão")),
     *     @OA\Parameter(name="is_published",  in="query", required=false, description="Filtrar por status de publicação", @OA\Schema(type="boolean", example=true)),
     *     @OA\Parameter(name="per_page",      in="query", required=false, description="Itens por página (padrão 20)", @OA\Schema(type="integer", example=20)),
     *
     *     @OA\Response(response=200, description="Cursos listados",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Cursos listados com sucesso"),
     *             @OA\Property(property="data",    type="object", description="Resposta paginada do Laravel")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado")
     * )
     */
    public function listCourses(Request $request): JsonResponse
    {
        $query = Course::withCount(['enrollments', 'lessons'])
            ->with('modules:id,course_id,order');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_published')) {
            $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->get('per_page', 20);
        $courses = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Cursos listados com sucesso',
            'data' => $courses,
        ]);
    }

    /**
     * Exibe detalhes completos de um curso incluindo módulos, aulas e alunos matriculados.
     *
     * GET /api/v1/admin/courses/{id}
     *
     * @OA\Get(
     *     path="/api/v1/admin/courses/{id}",
     *     operationId="adminShowCourse",
     *     tags={"Admin/Courses"},
     *     summary="Exibir curso (admin)",
     *     description="Retorna detalhes completos de um curso: módulos, aulas e alunos matriculados.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Curso encontrado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Curso encontrado"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Acesso negado"),
     *     @OA\Response(response=404, description="Curso não encontrado")
     * )
     */
    public function showCourse(int $id): JsonResponse
    {
        $course = Course::with([
            'modules.lessons:id,module_id,title,duration_in_minutes,is_free_preview',
            'enrollments.user:id,name,email,subscription_type',
        ])->withCount(['enrollments', 'lessons'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Curso encontrado',
            'data' => $course,
        ]);
    }

    /*
     |--------------------------------------------------------------------------
     | Atualização e Exclusão de Usuários (Admin)
     |--------------------------------------------------------------------------
     */

    /**
     * Atualiza nome e e-mail de um usuário específico.
     *
     * PATCH /api/v1/admin/users/{id}
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'  => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $id],
        ], [
            'name.required'  => 'O nome é obrigatório.',
            'name.max'       => 'O nome não pode ter mais de 255 caracteres.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email'    => 'Informe um e-mail válido.',
            'email.unique'   => 'Este e-mail já está em uso.',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
            // Se o e-mail mudou, invalida a verificação para forçar re-verificação
            $user->email_verified_at = now();
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Usuário atualizado com sucesso.',
            'data'    => $user->fresh(),
        ]);
    }

    /**
     * Exclui (soft delete) um usuário.
     *
     * DELETE /api/v1/admin/users/{id}
     */
    public function destroyUser(int $id): JsonResponse
    {
        // Impede que o admin se exclua
        if (auth()->id() === $id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não pode excluir a sua própria conta por aqui.',
            ], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "Usuário {$user->name} excluído com sucesso.",
        ]);
    }
}
