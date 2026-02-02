<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'video_url',
        'duration_in_minutes',
        'is_free_preview',
    ];

    protected $casts = [
        'duration_in_minutes' => 'integer',
        'is_free_preview' => 'boolean',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function courseProgresses()
    {
        return $this->hasMany(CourseProgress::class);
    }
}
