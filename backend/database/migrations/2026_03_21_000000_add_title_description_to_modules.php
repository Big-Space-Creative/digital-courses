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
        Schema::table('modules', function (Blueprint $table) {
            if (! Schema::hasColumn('modules', 'title')) {
                $table->string('title', 255)->nullable()->after('course_id');
            }
            if (! Schema::hasColumn('modules', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            if (Schema::hasColumn('modules', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('modules', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};
