<?php

namespace App\Providers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Material;
use App\Models\Module;
use App\Policies\CoursePolicy;
use App\Policies\LessonPolicy;
use App\Policies\MaterialPolicy;
use App\Policies\ModulePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Course::class => CoursePolicy::class,
        Module::class => ModulePolicy::class,
        Lesson::class => LessonPolicy::class,
        Material::class => MaterialPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
