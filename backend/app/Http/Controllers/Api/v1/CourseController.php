<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/courses",
     *     operationId="courseIndex",
     *     tags={"Cursos"},
     *     summary="Listar cursos",
     *     description="Retorna todos os cursos com módulos e aulas (sem video_url). Acesso público.",
     *
     *     @OA\Response(response=200, description="Cursos listados",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Cursos listados com sucesso"),
     *             @OA\Property(property="data",    type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        // Retorna todos os cursos com seus modulos e conteudos publicos
        $courses = Course::with(['modules.lessons' => function ($query) {
            $query->select('id', 'module_id', 'title', 'description', 'duration_in_minutes', 'is_free_preview');
            // Nota: não retornamos video_url nesta lista geral por segurança.
        }])->get();

        return response()->json([
            'message' => 'Cursos listados com sucesso',
            'data' => $courses,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/courses/{id}",
     *     operationId="courseShow",
     *     tags={"Cursos"},
     *     summary="Exibir curso",
     *     description="Retorna um curso específico com seus módulos e aulas. Acesso público.",
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Curso encontrado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Curso encontrado"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Curso não encontrado")
     * )
     */
    public function show($id)
    {
        $course = Course::with(['modules.lessons' => function ($query) {
            $query->select('id', 'module_id', 'title', 'description', 'duration_in_minutes', 'is_free_preview');
        }])->findOrFail($id);

        return response()->json([
            'message' => 'Curso encontrado',
            'data' => $course,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/courses",
     *     operationId="courseStore",
     *     tags={"Cursos"},
     *     summary="Criar curso",
     *     description="Cria um novo curso. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"title"},
     *
     *             @OA\Property(property="title",        type="string",  example="Violão do Zero"),
     *             @OA\Property(property="description",  type="string",  nullable=true, example="Aprenda violão do absoluto zero."),
     *             @OA\Property(property="price",        type="number",  format="float", nullable=true, example=49.90),
     *             @OA\Property(property="thumbnail",    type="string",  nullable=true, example="https://cdn.example.com/thumb.jpg"),
     *             @OA\Property(property="is_published", type="boolean", example=false)
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Curso criado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Curso criado com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'thumbnail' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['is_published'] = $validated['is_published'] ?? false;

        if ($validated['is_published']) {
            $validated['published_at'] = now();
        }

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Curso criado com sucesso',
            'data' => $course,
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/courses/{id}",
     *     operationId="courseUpdate",
     *     tags={"Cursos"},
     *     summary="Atualizar curso",
     *     description="Atualiza dados de um curso existente. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="title",        type="string",  example="Violão Avançado"),
     *             @OA\Property(property="description",  type="string",  nullable=true),
     *             @OA\Property(property="price",        type="number",  format="float", nullable=true),
     *             @OA\Property(property="thumbnail",    type="string",  nullable=true),
     *             @OA\Property(property="is_published", type="boolean", example=true)
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Curso atualizado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Curso atualizado com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Curso não encontrado")
     * )
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'thumbnail' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if (isset($validated['is_published']) && $validated['is_published'] && ! $course->is_published) {
            $validated['published_at'] = now();
        }

        $course->update($validated);

        return response()->json([
            'message' => 'Curso atualizado com sucesso',
            'data' => $course,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/courses/{id}",
     *     operationId="courseDestroy",
     *     tags={"Cursos"},
     *     summary="Excluir curso",
     *     description="Remove permanentemente um curso. Requer autenticação (admin).",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Curso excluído",
     *
     *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Curso excluído com sucesso"))
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Curso não encontrado")
     * )
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Curso excluído com sucesso',
        ]);
    }
}
