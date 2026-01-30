<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'thumbnail',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'bool',
        'price' => 'decimal:2',
    ];

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function lessons()
    {
        return $this->hasManyThrough(
            Lesson::class,
            Module::class,
            'course_id',
            'module_id',
            'id',
            'id'
        );
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot(['expires_at', 'order_id', 'status'])
            ->withTimestamps();
    }

    public function totalDurationSeconds(): int
    {
        return (int) $this->lessons()->sum('duration_seconds');
    }

    public function totalDurationMinutes(): int
    {
        return (int) ceil($this->totalDurationSeconds() / 60);
    }
}
