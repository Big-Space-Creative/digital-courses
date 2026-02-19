<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    public const ROLE_STUDENT = 'student';
    public const ROLE_INSTRUCTOR = 'instructor';
    public const ROLE_ADMIN = 'admin';

    public const SUBSCRIPTION_FREE = 'free';
    public const SUBSCRIPTION_PREMIUM = 'premium';

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
        'subscription_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'subscription_type' => 'string',
        ];
    }

    /*
     |-----------------------------------------------------------
     | Relacionamentos
     |-----------------------------------------------------------
     */

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'enrollments')
            ->withPivot(['expires_at', 'order_id', 'status'])
            ->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function courseProgresses()
    {
        return $this->hasMany(CourseProgress::class);
    }

    /*
     |-----------------------------------------------------------
     | Regras de Negócio
     |-----------------------------------------------------------
     */

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    public function isPremiumStudent(): bool
    {
        return $this->isStudent() && $this->subscription_type === self::SUBSCRIPTION_PREMIUM;
    }

    public function isFreeStudent(): bool
    {
        return $this->isStudent() && $this->subscription_type === self::SUBSCRIPTION_FREE;
    }

    public function hasActiveEnrollment(int|Course $course): bool
    {
        $courseId = $course instanceof Course ? $course->id : $course;

        return $this->enrollments()
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function canAccessLesson(Lesson $lesson): bool
    {
        if (! $this->isStudent()) {
            return true;
        }

        if ($this->isPremiumStudent()) {
            return true;
        }

        return (bool) $lesson->is_free_preview;
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role,
            'avatar_url' => $this->avatar_url,
        ];
    }
}