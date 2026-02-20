<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function store(Request $request, $course_id)
    {
        $course = Course::findOrFail($course_id);

        $validated = $request->validate([
            'order' => 'required|integer|min:0',
        ]);

        $module = $course->modules()->create($validated);

        return response()->json([
            'message' => 'Módulo criado com sucesso',
            'data' => $module,
        ], 201);
    }

    public function update(Request $request, $course_id, $module_id)
    {
        $module = Module::where('course_id', $course_id)->findOrFail($module_id);

        $validated = $request->validate([
            'order' => 'sometimes|integer|min:0',
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Módulo atualizado com sucesso',
            'data' => $module,
        ]);
    }

    public function destroy($course_id, $module_id)
    {
        $module = Module::where('course_id', $course_id)->findOrFail($module_id);
        $module->delete();

        return response()->json([
            'message' => 'Módulo excluído com sucesso',
        ]);
    }
}
