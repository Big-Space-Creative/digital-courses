<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Digital Courses API',
        'documentation' => 'Add your API docs URL here once available.',
    ]);
});