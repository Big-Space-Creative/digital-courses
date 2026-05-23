<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Support\ResolvesPublicStorageUrls;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

class CourseController extends Controller
{
    use ResolvesPublicStorageUrls;

    /**
     * @OA\Get(
     *     path="/api/v1/courses",
     *     operationId="courseIndex",
     *     tags={"Cursos"},
     *     summary="Listar cursos",
     *     description="Retorna os cursos visiveis para o usuario autenticado com modulos e aulas (sem video_url).",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Cursos listados",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cursos listados com sucesso"),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        $user = auth()->user();
        $hasPrivilegedAccess = $user && in_array($user->role, ['admin', 'instructor']);

        $courses = Course::with([
            'modules' => function ($query) {
                $query->orderBy('order');
            },
            'modules.lessons' => function ($query) use ($hasPrivilegedAccess) {
                $columns = [
                    'id',
                    'module_id',
                    'title',
                    'description',
                    'thumbnail',
                    'duration_in_minutes',
                    'is_free_preview',
                ];

                if ($hasPrivilegedAccess) {
                    $columns[] = 'video_url';
                }

                $query->select($columns)->orderBy('id');
            },
        ])
            ->when(
                ! $hasPrivilegedAccess,
                fn ($query) => $query->where('is_published', true)
            )
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->get();

        $courses->each(fn (Course $course) => $this->normalizeCourseForResponse($course));

        return response()->json([
            'message' => 'Cursos listados com sucesso',
            'data' => $courses,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/courses/{course}",
     *     operationId="courseShow",
     *     tags={"Cursos"},
     *     summary="Exibir curso",
     *     description="Retorna um curso especifico com seus modulos e aulas. Cursos nao publicados ficam restritos a admin/instructor.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="course", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Curso encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Curso encontrado"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Curso nao encontrado")
     * )
     */
    public function show($id)
    {
        $user = auth()->user();
        $hasPrivilegedAccess = $user && in_array($user->role, ['admin', 'instructor']);

        $course = Course::with([
            'modules' => function ($query) {
                $query->orderBy('order');
            },
            'modules.lessons' => function ($query) use ($hasPrivilegedAccess) {
                $columns = [
                    'id',
                    'module_id',
                    'title',
                    'description',
                    'thumbnail',
                    'duration_in_minutes',
                    'is_free_preview',
                ];

                if ($hasPrivilegedAccess) {
                    $columns[] = 'video_url';
                }

                $query->select($columns)->orderBy('id');
            },
            'modules.lessons.materials:id,lesson_id,title,file_path,type',
        ])->findOrFail($id);

        if (! $course->is_published && ! $hasPrivilegedAccess) {
            abort(404);
        }

        $this->normalizeCourseForResponse($course);

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
     *     description="Cria um novo curso. Requer autenticacao de admin. Aceita thumbnail por URL ou upload.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title"},
     *                 @OA\Property(property="title", type="string", example="Violao do Zero"),
     *                 @OA\Property(property="description", type="string", nullable=true),
     *                 @OA\Property(property="price", type="number", format="float", nullable=true),
     *                 @OA\Property(property="thumbnail", type="string", nullable=true),
     *                 @OA\Property(property="thumbnail_file", type="string", format="binary", nullable=true),
     *                 @OA\Property(property="is_published", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Curso criado"),
     *     @OA\Response(response=401, description="Nao autenticado"),
     *     @OA\Response(response=422, description="Erro de validacao")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'thumbnail' => 'nullable|string|max:255',
            'thumbnail_file' => 'nullable|image|max:5120',
            'is_published' => 'boolean',
        ]);

        $validated['slug'] = $this->generateUniqueSlug($validated['title']);
        $validated['is_published'] = $validated['is_published'] ?? false;

        if ($validated['is_published']) {
            $validated['published_at'] = now();
        }

        if ($request->hasFile('thumbnail_file')) {
            $validated['thumbnail'] = $this->storeThumbnail(
                $request->file('thumbnail_file'),
                $validated['slug']
            );
        }

        unset($validated['thumbnail_file']);

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Curso criado com sucesso',
            'data' => $course,
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/courses/{course}",
     *     operationId="courseUpdate",
     *     tags={"Cursos"},
     *     summary="Atualizar curso",
     *     description="Atualiza dados de um curso existente. Requer autenticacao de admin.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="course", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Curso atualizado"),
     *     @OA\Response(response=401, description="Nao autenticado"),
     *     @OA\Response(response=404, description="Curso nao encontrado")
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
            'thumbnail_file' => 'nullable|image|max:5120',
            'is_published' => 'boolean',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $course->id);
        }

        if (isset($validated['is_published']) && $validated['is_published'] && ! $course->is_published) {
            $validated['published_at'] = now();
        }

        if (isset($validated['is_published']) && ! $validated['is_published']) {
            $validated['published_at'] = null;
        }

        if ($request->hasFile('thumbnail_file')) {
            $validated['thumbnail'] = $this->storeThumbnail(
                $request->file('thumbnail_file'),
                $validated['slug'] ?? $course->slug,
                $course->thumbnail
            );
        }

        unset($validated['thumbnail_file']);

        $course->update($validated);

        return response()->json([
            'message' => 'Curso atualizado com sucesso',
            'data' => $course,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/courses/{course}",
     *     operationId="courseDestroy",
     *     tags={"Cursos"},
     *     summary="Excluir curso",
     *     description="Remove permanentemente um curso. Requer autenticacao (admin).",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="course", in="path", required=true, description="ID do curso", @OA\Schema(type="integer", example=1)),
     *
     *     @OA\Response(response=200, description="Curso excluido"),
     *     @OA\Response(response=401, description="Nao autenticado"),
     *     @OA\Response(response=404, description="Curso nao encontrado")
     * )
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Curso excluido com sucesso',
        ]);
    }

    private function storeThumbnail($file, string $slug, ?string $previousUrl = null): string
    {
        $filename = $slug.'-'.Str::uuid().'.'.$file->getClientOriginalExtension();
        $storedPath = Storage::disk('s3')->putFileAs('courses/thumbnails', $file, $filename);

        if ($previousUrl) {
            $previousPath = $this->extractDiskPathFromUrl($previousUrl);

            if ($previousPath) {
                try {
                    Storage::disk('s3')->delete($previousPath);
                } catch (\Throwable $e) {
                    // Nao interrompemos a resposta caso o cleanup falhe.
                }
            }
        }

        return $storedPath;
    }

    private function generateUniqueSlug(string $title, ?int $ignoreCourseId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug !== '' ? $baseSlug : 'curso';
        $counter = 2;

        while (
            Course::query()
                ->when($ignoreCourseId, fn ($query) => $query->where('id', '!=', $ignoreCourseId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function normalizeCourseForResponse(Course $course): void
    {
        $course->thumbnail = $this->toPresignedUrl($course->thumbnail);

        $course->modules->each(function ($module): void {
            $module->lessons->each(function ($lesson): void {
                $lesson->thumbnail = $this->toPresignedUrl($lesson->thumbnail);
                $lesson->video_url = $this->toPresignedUrl($lesson->video_url);

                if ($lesson->relationLoaded('materials')) {
                    $lesson->materials->each(function ($material): void {
                        $material->file_path = $this->toPresignedUrl($material->file_path);
                    });
                }
            });
        });
    }
}
