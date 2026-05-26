<?php

namespace Tests\Feature\Api;

use App\Models\Course;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that an admin can successfully create a course, module, and lesson.
     */
    public function test_admin_can_create_course_module_and_lesson(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        // 1. Criar Curso
        $coursePayload = [
            'title' => 'Curso de Violão Clássico',
            'description' => 'Aprenda violão clássico do zero.',
            'price' => 199.90,
            'is_published' => true,
        ];

        $response = $this->actingAs($admin, 'api')
            ->postJson('/api/v1/courses', $coursePayload);

        $response->assertCreated();
        $this->assertDatabaseHas('courses', [
            'title' => 'Curso de Violão Clássico',
            'is_published' => true,
        ]);

        $courseId = $response->json('data.id');

        // 2. Criar Módulo
        $modulePayload = [
            'title' => 'Módulo 1: Dedilhado Inicial',
            'description' => 'Dedilhado básico de violão.',
            'order' => 1,
        ];

        $response = $this->actingAs($admin, 'api')
            ->postJson("/api/v1/courses/{$courseId}/modules", $modulePayload);

        $response->assertCreated();
        $this->assertDatabaseHas('modules', [
            'title' => 'Módulo 1: Dedilhado Inicial',
            'course_id' => $courseId,
            'order' => 1,
        ]);

        $moduleId = $response->json('data.id');

        // 3. Criar Aula
        $lessonPayload = [
            'title' => 'Aula 1: A Técnica de P.I.M.A.',
            'description' => 'Aprenda dedilhado usando polegar, indicador, médio e anelar.',
            'video_url' => 'http://minio:9000/digital-courses-bucket/aula1.mp4',
            'duration_in_minutes' => 15,
            'is_free_preview' => true,
        ];

        $response = $this->actingAs($admin, 'api')
            ->postJson("/api/v1/modules/{$moduleId}/lessons", $lessonPayload);

        $response->assertCreated();
        $this->assertDatabaseHas('lessons', [
            'title' => 'Aula 1: A Técnica de P.I.M.A.',
            'module_id' => $moduleId,
            'is_free_preview' => true,
        ]);
    }

    /**
     * Test that a student is blocked from creating courses, modules, or lessons.
     */
    public function test_student_cannot_create_course_module_or_lesson(): void
    {
        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT,
        ]);

        // 1. Tentar criar Curso
        $coursePayload = [
            'title' => 'Curso Não Autorizado',
        ];
        $response = $this->actingAs($student, 'api')
            ->postJson('/api/v1/courses', $coursePayload);
        $response->assertForbidden();

        // Criar curso fictício diretamente no banco para testar módulos
        $course = Course::create([
            'title' => 'Curso Fictício',
            'slug' => 'curso-ficticio',
            'description' => 'Fins de teste',
            'price' => 0.00,
            'is_published' => true,
        ]);

        // 2. Tentar criar Módulo
        $modulePayload = [
            'title' => 'Módulo Não Autorizado',
            'order' => 1,
        ];
        $response = $this->actingAs($student, 'api')
            ->postJson("/api/v1/courses/{$course->id}/modules", $modulePayload);
        $response->assertForbidden();

        // Criar módulo fictício diretamente no banco para testar aulas
        $module = Module::create([
            'course_id' => $course->id,
            'title' => 'Módulo Fictício',
            'description' => 'Fins de teste',
            'order' => 1,
        ]);

        // 3. Tentar criar Aula
        $lessonPayload = [
            'title' => 'Aula Não Autorizada',
        ];
        $response = $this->actingAs($student, 'api')
            ->postJson("/api/v1/modules/{$module->id}/lessons", $lessonPayload);
        $response->assertForbidden();
    }

    /**
     * Test authorization for Admin Dashboard.
     */
    public function test_admin_and_instructor_can_access_dashboard_but_student_cannot(): void
    {
        // 1. Admin Acessa
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $response = $this->actingAs($admin, 'api')->getJson('/api/v1/admin/dashboard');
        $response->assertOk();

        // 2. Instructor Acessa
        $instructor = User::factory()->create(['role' => User::ROLE_INSTRUCTOR]);
        $response = $this->actingAs($instructor, 'api')->getJson('/api/v1/admin/dashboard');
        $response->assertOk();

        // 3. Student NÃO Acessa (Forbidden)
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $response = $this->actingAs($student, 'api')->getJson('/api/v1/admin/dashboard');
        $response->assertForbidden();
    }
}
