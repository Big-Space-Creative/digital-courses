<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreModuleRequest;
use App\Http\Requests\UpdateModuleRequest;
use App\Models\Course;
use App\Models\Module;
use OpenApi\Annotations as OA;

class ModuleController extends Controller
{
    /**
     * @OA\Post(
    *     path="/api/v1/courses/{course}/modules",
     *     operationId="moduleStore",
     *     tags={"Cursos"},
     *     summary="Criar módulo",
     *     description="Cria um novo módulo dentro de um curso. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="course", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"title", "order"},
     *
     *             @OA\Property(property="title", type="string", maxLength=255, example="Fundamentos"),
     *             @OA\Property(property="description", type="string", nullable=true, maxLength=2000),
     *             @OA\Property(property="order", type="integer", minimum=0, example=1)
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Módulo criado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Módulo criado com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Sem permissão (apenas admin ou instructor)"),
     *     @OA\Response(response=404, description="Curso não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function store(StoreModuleRequest $request, $course_id)
    {
        $this->authorize('create', Module::class);

        $course = Course::findOrFail($course_id);

        $validated = $request->validated();

        $module = $course->modules()->create($validated);

        return response()->json([
            'message' => 'Módulo criado com sucesso',
            'data' => $module,
        ], 201);
    }

    /**
     * @OA\Put(
    *     path="/api/v1/courses/{course}/modules/{module}",
     *     operationId="moduleUpdate",
     *     tags={"Cursos"},
     *     summary="Atualizar módulo",
     *     description="Atualiza dados de um módulo. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="course",  in="path", required=true, description="ID do curso",   @OA\Schema(type="integer")),
    *     @OA\Parameter(name="module",  in="path", required=true, description="ID do módulo",  @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="title", type="string", maxLength=255),
     *             @OA\Property(property="description", type="string", nullable=true, maxLength=2000),
     *             @OA\Property(property="order", type="integer", minimum=0)
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Módulo atualizado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Módulo atualizado com sucesso"),
     *             @OA\Property(property="data",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Sem permissão (apenas admin ou instructor)"),
     *     @OA\Response(response=404, description="Módulo não encontrado")
     * )
     */
    public function update(UpdateModuleRequest $request, $course_id, $module_id)
    {
        $module = Module::where('course_id', $course_id)->findOrFail($module_id);

        $this->authorize('update', $module);

        $validated = $request->validated();

        $module->update($validated);

        return response()->json([
            'message' => 'Módulo atualizado com sucesso',
            'data' => $module,
        ]);
    }

    /**
     * @OA\Delete(
    *     path="/api/v1/courses/{course}/modules/{module}",
     *     operationId="moduleDestroy",
     *     tags={"Cursos"},
     *     summary="Excluir módulo",
     *     description="Remove permanentemente um módulo e suas aulas. Requer autenticação (admin).",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="course",  in="path", required=true, description="ID do curso",   @OA\Schema(type="integer")),
    *     @OA\Parameter(name="module",  in="path", required=true, description="ID do módulo",  @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Módulo excluído",
     *
     *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Módulo excluído com sucesso"))
     *     ),
     *
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=404, description="Módulo não encontrado")
     * )
     */
    public function destroy($course_id, $module_id)
    {
        $module = Module::where('course_id', $course_id)->findOrFail($module_id);
        $this->authorize('delete', $module);

        $module->delete();

        return response()->json([
            'message' => 'Módulo excluído com sucesso',
        ]);
    }
}
