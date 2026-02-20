<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\Request;

class LessonController extends Controller
{
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

    public function destroy($lesson_id)
    {
        $lesson = Lesson::findOrFail($lesson_id);
        $lesson->delete();

        return response()->json([
            'message' => 'Aula excluída com sucesso',
        ]);
    }
}
