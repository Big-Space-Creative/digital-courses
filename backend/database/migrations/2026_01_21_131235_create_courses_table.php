<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->unique('slug', 255);
            $table->text('description', 255)->nullable();
            $table->decimal('price', 8, 2)->default(0.00);
            $table->string('thumbnail', 255)->nullable();
            $table->boolean('is_published');
            $table->softDeletes();
            $table->timestamps('published_at')->nullable()->after('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};