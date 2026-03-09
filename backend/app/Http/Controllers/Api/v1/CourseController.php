<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
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

        if (isset($validated['is_published']) && $validated['is_published'] && !$course->is_published) {
            $validated['published_at'] = now();
        }

        $course->update($validated);

        return response()->json([
            'message' => 'Curso atualizado com sucesso',
            'data' => $course,
        ]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Curso excluído com sucesso',
        ]);
    }
}
