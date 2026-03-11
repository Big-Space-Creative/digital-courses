<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/lessons/{lesson_id}",
     *     operationId="lessonShow",
     *     tags={"Cursos"},
     *     summary="Exibir aula",
     *     description="Retorna detalhes de uma aula. Aulas pagas exigem autenticação com plano Premium (ou role admin/instructor).",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Aula encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Aula encontrada"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Acesso negado — plano Premium necessário"),
     *     @OA\Response(response=404, description="Aula não encontrada")
     * )
     */
    public function show($lesson_id)
    {
        $lesson = Lesson::with(['materials', 'comments'])->findOrFail($lesson_id);
        $user = auth()->user();

        // Se o usuário for admin ou instructor, tem acesso total.
        $hasFullAccess = $user && in_array($user->role, ['admin', 'instructor']);

        if (!$hasFullAccess && !$lesson->is_free_preview) {
            // Se não é admin/instructor e a aula NÃO é gratuita, verifica a assinatura
            if (!$user || $user->subscription_type !== 'premium') {
                return response()->json([
                    'message' => 'Acesso negado. Esta aula é exclusiva para assinantes Premium.',
                ], 403);
            }
        }

        return response()->json([
            'message' => 'Aula encontrada',
            'data' => $lesson,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/modules/{module_id}/lessons",
     *     operationId="lessonStore",
     *     tags={"Cursos"},
     *     summary="Criar aula",
     *     description="Cria uma nova aula dentro de um módulo. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="module_id", in="path", required=true, description="ID do módulo", @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title",                type="string",  example="Introdução ao violão"),
     *             @OA\Property(property="description",          type="string",  nullable=true),
     *             @OA\Property(property="video_url",            type="string",  format="url", nullable=true),
     *             @OA\Property(property="duration_in_minutes",  type="integer", nullable=true, example=15),
     *             @OA\Property(property="is_free_preview",      type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Aula criada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Aula criada com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Módulo não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(Request $request, $module_id)
    {
        $module = Module::findOrFail($module_id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'nullable|url|max:255',
            'duration_in_minutes' => 'nullable|integer|min:0',
            'is_free_preview' => 'boolean',
        ]);

        $validated['is_free_preview'] = $validated['is_free_preview'] ?? false;

        $lesson = $module->lessons()->create($validated);

        return response()->json([
            'message' => 'Aula criada com sucesso',
            'data' => $lesson,
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/lessons/{lesson_id}",
     *     operationId="lessonUpdate",
     *     tags={"Cursos"},
     *     summary="Atualizar aula",
     *     description="Atualiza dados de uma aula existente. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="title",               type="string"),
     *             @OA\Property(property="description",         type="string",  nullable=true),
     *             @OA\Property(property="video_url",           type="string",  format="url", nullable=true),
     *             @OA\Property(property="duration_in_minutes", type="integer", nullable=true),
     *             @OA\Property(property="is_free_preview",     type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Aula atualizada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Aula atualizada com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Aula não encontrada")
     * )
     */
    public function update(Request $request, $lesson_id)
    {
        $lesson = Lesson::findOrFail($lesson_id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'nullable|url|max:255',
            'duration_in_minutes' => 'nullable|integer|min:0',
            'is_free_preview' => 'boolean',
        ]);

        $lesson->update($validated);

        return response()->json([
            'message' => 'Aula atualizada com sucesso',
            'data' => $lesson,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/lessons/{lesson_id}",
     *     operationId="lessonDestroy",
     *     tags={"Cursos"},
     *     summary="Excluir aula",
     *     description="Remove permanentemente uma aula. Requer autenticação (admin).",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Aula excluída",
     *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Aula excluída com sucesso"))
     *     ),
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Aula não encontrada")
     * )
     */
    public function destroy($lesson_id)
    {
        $lesson = Lesson::findOrFail($lesson_id);
        $lesson->delete();

        return response()->json([
            'message' => 'Aula excluída com sucesso',
        ]);
    }
}
