<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @OA\Get(
     *     path="/api/v1/users",
     *     operationId="userIndex",
     *     tags={"Admin/Users"},
     *     summary="Listar todos os usuários (simplificado)",
     *     description="Retorna todos os usuários sem paginação. Requer autenticação.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de usuários",
     *         @OA\JsonContent(type="array", @OA\Items(type="object"))
     *     ),
     *     @OA\Response(response=401, description="Não autenticado")
     * )
     */
    public function index()
    {
        return User::all();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @OA\Put(
     *     path="/api/v1/users/{id}",
     *     operationId="userUpdate",
     *     tags={"Admin/Users"},
     *     summary="Atualizar usuário",
     *     description="Atualiza nome, e-mail e/ou role de um usuário. Requer autenticação.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do usuário", @OA\Schema(type="string", example="1")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="name",  type="string", example="Bob"),
     *             @OA\Property(property="email", type="string", format="email", example="bob@example.com"),
     *             @OA\Property(property="role",  type="string", enum={"student","instructor","admin"}, example="instructor")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Usuário atualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Usuário atualizado com sucesso."),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id",    type="integer"),
     *                 @OA\Property(property="name",  type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="role",  type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Usuário não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['sometimes', 'required', 'in:' . implode(',', [
                User::ROLE_STUDENT,
                User::ROLE_INSTRUCTOR,
                User::ROLE_ADMIN,
            ])],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Usuário atualizado com sucesso.',
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}