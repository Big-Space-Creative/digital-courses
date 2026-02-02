<?php

namespace Tests\Unit;

use App\Models\Lesson;
use App\Models\User;
use Tests\TestCase;

class UserLessonAccessTest extends TestCase
{
    public function test_premium_student_can_access_any_lesson(): void
    {
        $user = User::factory()->premiumStudent()->make();
        $lesson = new Lesson(['is_free_preview' => false]);

        $this->assertTrue($user->canAccessLesson($lesson));
    }

    public function test_free_student_only_accesses_lessons_marked_as_free(): void
    {
        $user = User::factory()->student()->make([
            'subscription_type' => 'free',
        ]);

        $freeLesson = new Lesson(['is_free_preview' => true]);
        $paidLesson = new Lesson(['is_free_preview' => false]);

        $this->assertTrue($user->canAccessLesson($freeLesson));
        $this->assertFalse($user->canAccessLesson($paidLesson));
    }

    public function test_non_student_roles_can_access_any_lesson(): void
    {
        $user = User::factory()->make([
            'role' => 'admin',
        ]);

        $lesson = new Lesson(['is_free_preview' => false]);

        $this->assertTrue($user->canAccessLesson($lesson));
    }
}
