<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLessonRequest;
use App\Http\Requests\UpdateLessonRequest;
use App\Models\Lesson;
use App\Models\Material;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

class LessonController extends Controller
{
    /**
     * @OA\Get(
    *     path="/api/v1/lessons/{lesson}",
     *     operationId="lessonShow",
     *     tags={"Cursos"},
     *     summary="Exibir aula",
     *     description="Retorna detalhes de uma aula. Aulas pagas exigem autenticação com plano Premium (ou role admin/instructor).",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="lesson", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
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
    *     path="/api/v1/modules/{module}/lessons",
     *     operationId="lessonStore",
     *     tags={"Cursos"},
     *     summary="Criar aula",
     *     description="Cria uma nova aula dentro de um módulo. Requer autenticação (instructor ou admin). Video URL deve referenciar MinIO.",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="module", in="path", required=true, description="ID do módulo", @OA\Schema(type="integer", example=1)),
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
        $this->authorize('create', Lesson::class);

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
    *     path="/api/v1/lessons/{lesson}",
     *     operationId="lessonUpdate",
     *     tags={"Cursos"},
     *     summary="Atualizar aula",
     *     description="Atualiza dados de uma aula existente. Requer autenticação (instructor ou admin).",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="lesson", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
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
        $this->authorize('update', $lesson);

        $validated = $request->validated();

        $lesson->update($validated);

        return response()->json([
            'message' => 'Aula atualizada com sucesso',
            'data' => $lesson,
        ]);
    }

    /**
     * @OA\Delete(
    *     path="/api/v1/lessons/{lesson}",
     *     operationId="lessonDestroy",
     *     tags={"Cursos"},
     *     summary="Excluir aula",
     *     description="Remove permanentemente uma aula. Requer autenticação (admin).",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="lesson", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
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
        $this->authorize('delete', $lesson);

        $lesson->delete();

        return response()->json([
            'message' => 'Aula excluída com sucesso',
        ]);
    }

    /**
     * @OA\Post(
    *     path="/api/v1/modules/{module}/lessons/upload",
     *     operationId="lessonStoreWithUpload",
     *     tags={"Cursos"},
     *     summary="Criar aula com upload único",
     *     description="Cria aula em um módulo e faz upload do vídeo + materiais (pdf, imagens, vídeos) no MinIO em uma única requisição.",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="module", in="path", required=true, description="ID do módulo", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title","video_file"},
     *                 @OA\Property(property="title", type="string", maxLength=255, example="Aula 01 - Introdução"),
     *                 @OA\Property(property="description", type="string", nullable=true),
     *                 @OA\Property(property="duration_in_minutes", type="integer", nullable=true, example=15),
     *                 @OA\Property(property="is_free_preview", type="boolean", example=false),
     *                 @OA\Property(property="video_file", type="string", format="binary"),
     *                 @OA\Property(property="materials[]", type="array", @OA\Items(type="string", format="binary")),
     *                 @OA\Property(property="material_titles[]", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Aula e materiais enviados com sucesso"),
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Sem permissão"),
     *     @OA\Response(response=404, description="Módulo não encontrado"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function storeWithUpload(Request $request, $module_id)
    {
        $this->authorize('create', Lesson::class);
        $this->authorize('create', Material::class);

        $module = Module::findOrFail($module_id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'duration_in_minutes' => 'nullable|integer|min:1|max:1440',
            'is_free_preview' => 'nullable|boolean',
            'video_file' => 'required|file|mimes:mp4,mov,avi,mkv,webm|max:512000',
            'materials' => 'nullable|array',
            'materials.*' => 'file|mimes:pdf,jpg,jpeg,png,webp,gif,mp4,mov,avi,mkv,webm|max:512000',
            'material_titles' => 'nullable|array',
            'material_titles.*' => 'nullable|string|max:255',
        ]);

        $materials = $request->file('materials', []);
        $materialTitles = $request->input('material_titles', []);

        if (! empty($materialTitles) && count($materialTitles) !== count($materials)) {
            return response()->json([
                'message' => 'Quantidade de material_titles deve ser igual à quantidade de materials.',
            ], 422);
        }

        $file = $request->file('video_file');
        $videoPath = 'courses/modules/'.$module->id.'/lessons/videos';
        $videoFilename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $uploadedPaths = [];

        try {
            DB::beginTransaction();

            $storedPath = Storage::disk('s3')->putFileAs($videoPath, $file, $videoFilename, [
                'visibility' => 'public',
            ]);
            $uploadedPaths[] = $storedPath;

            $videoUrl = Storage::disk('s3')->url($storedPath);

            $lesson = $module->lessons()->create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'duration_in_minutes' => $validated['duration_in_minutes'] ?? null,
                'is_free_preview' => $validated['is_free_preview'] ?? false,
                'video_url' => $videoUrl,
            ]);

            foreach ($materials as $index => $materialFile) {
                $materialPath = 'courses/modules/'.$module->id.'/lessons/'.$lesson->id.'/materials';
                $materialFilename = Str::uuid().'.'.$materialFile->getClientOriginalExtension();

                $materialStoredPath = Storage::disk('s3')->putFileAs($materialPath, $materialFile, $materialFilename, [
                    'visibility' => 'public',
                ]);
                $uploadedPaths[] = $materialStoredPath;

                Material::create([
                    'lesson_id' => $lesson->id,
                    'title' => $materialTitles[$index] ?? pathinfo($materialFile->getClientOriginalName(), PATHINFO_FILENAME),
                    'file_path' => Storage::disk('s3')->url($materialStoredPath),
                    'type' => $this->detectMaterialType($materialFile->getMimeType() ?? ''),
                ]);
            }

            DB::commit();

            $lesson->load('materials');
        } catch (\Throwable $e) {
            DB::rollBack();

            foreach ($uploadedPaths as $uploadedPath) {
                try {
                    Storage::disk('s3')->delete($uploadedPath);
                } catch (\Throwable $cleanupException) {
                    // Ignora erro de cleanup para não sobrescrever erro original.
                }
            }

            return response()->json([
                'message' => 'Falha ao processar upload da aula e materiais.',
                'error' => $e->getMessage(),
                'exception' => get_class($e),
            ], 500);
        }

        return response()->json([
            'message' => 'Aula criada com upload de vídeo e materiais no MinIO com sucesso',
            'data' => $lesson,
        ], 201);
    }

    /**
     * @OA\Post(
    *     path="/api/v1/lessons/{lesson}/materials/upload",
     *     operationId="lessonUploadMaterial",
     *     tags={"Cursos"},
     *     summary="Upload de material da aula",
     *     description="Faz upload de um material (pdf, imagem ou vídeo) no MinIO e vincula à aula.",
     *     security={{"bearerAuth":{}}},
     *
    *     @OA\Parameter(name="lesson", in="path", required=true, description="ID da aula", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title","file"},
     *                 @OA\Property(property="title", type="string", maxLength=255, example="Slides da Aula"),
     *                 @OA\Property(property="file", type="string", format="binary")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Material enviado com sucesso"),
     *     @OA\Response(response=401, description="Não autenticado"),
     *     @OA\Response(response=403, description="Sem permissão"),
     *     @OA\Response(response=404, description="Aula não encontrada"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function uploadMaterial(Request $request, $lesson_id)
    {
        $this->authorize('create', Material::class);

        $lesson = Lesson::findOrFail($lesson_id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp,gif,mp4,mov,avi,mkv,webm|max:512000',
        ]);

        $file = $request->file('file');
        $path = 'courses/modules/'.$lesson->module_id.'/lessons/'.$lesson->id.'/materials';
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        try {
            $storedPath = Storage::disk('s3')->putFileAs($path, $file, $filename, [
                'visibility' => 'public',
            ]);

            $fileUrl = Storage::disk('s3')->url($storedPath);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Falha ao enviar material para o storage.',
                'error' => $e->getMessage(),
                'exception' => get_class($e),
            ], 500);
        }

        $material = Material::create([
            'lesson_id' => $lesson->id,
            'title' => $validated['title'],
            'file_path' => $fileUrl,
            'type' => $this->detectMaterialType($file->getMimeType() ?? ''),
        ]);

        return response()->json([
            'message' => 'Material enviado com sucesso',
            'data' => $material,
        ], 201);
    }

    private function detectMaterialType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        if ($mimeType === 'application/pdf') {
            return 'pdf';
        }

        return 'file';
    }
}
