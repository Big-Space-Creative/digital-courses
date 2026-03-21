<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLessonRequest;
use App\Http\Requests\UpdateLessonRequest;
use App\Models\Lesson;
use App\Models\Module;

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
     *
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Aula encontrada",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Aula encontrada"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
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

        if (! $hasFullAccess && ! $lesson->is_free_preview) {
            // Se não é admin/instructor e a aula NÃO é gratuita, verifica a assinatura
            if (! $user || $user->subscription_type !== 'premium') {
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
     *     description="Cria uma nova aula dentro de um módulo. Requer autenticação (instructor ou admin). Video URL deve referenciar MinIO.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="module_id", in="path", required=true, description="ID do módulo", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"title"},
     *
     *             @OA\Property(property="title",                type="string", maxLength=255, example="Introdução ao violão"),
     *             @OA\Property(property="description",          type="string", nullable=true, maxLength=5000),
     *             @OA\Property(property="video_url",            type="string", maxLength=2048, nullable=true, example="https://minio.example.com/courses/lesson-1.mp4"),
     *             @OA\Property(property="duration_in_minutes",  type="integer", nullable=true, example=15, minimum=1, maximum=1440),
     *             @OA\Property(property="is_free_preview",      type="boolean", example=false)
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Aula criada",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Aula criada com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Sem permissão (apenas admin ou instructor)"),
     *     @OA\Response(response=404, description="Módulo não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(StoreLessonRequest $request, $module_id)
    {
        $module = Module::findOrFail($module_id);

        $validated = $request->validated();

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
     *
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="title",               type="string"),
     *             @OA\Property(property="description",         type="string",  nullable=true),
     *             @OA\Property(property="video_url",           type="string",  format="url", nullable=true),
     *             @OA\Property(property="duration_in_minutes", type="integer", nullable=true),
     *             @OA\Property(property="is_free_preview",     type="boolean")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Aula atualizada",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Aula atualizada com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Aula não encontrada")
     * )
     */
    /**
     * @OA\Put(
     *     path="/api/v1/lessons/{lesson_id}",
     *     operationId="lessonUpdate",
     *     tags={"Cursos"},
     *     summary="Atualizar aula",
     *     description="Atualiza dados de uma aula existente. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="title",               type="string", maxLength=255),
     *             @OA\Property(property="description",         type="string", nullable=true, maxLength=5000),
     *             @OA\Property(property="video_url",           type="string", maxLength=2048, nullable=true),
     *             @OA\Property(property="duration_in_minutes", type="integer", nullable=true, minimum=1, maximum=1440),
     *             @OA\Property(property="is_free_preview",     type="boolean")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Aula atualizada",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Aula atualizada com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Sem permissão (apenas admin ou instructor)"),
     *     @OA\Response(response=404, description="Aula não encontrada")
     * )
     */
    public function update(UpdateLessonRequest $request, $lesson_id)
    {
        $lesson = Lesson::findOrFail($lesson_id);

        $validated = $request->validated();

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
     *
     *     @OA\Parameter(name="lesson_id", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Aula excluída",
     *
     *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Aula excluída com sucesso"))
     *     ),
     *
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
