<?php

use Illuminate\Testing\Fluent\AssertableJson;

it('returns basic API status metadata', function () {
    $response = $this->getJson('/api/status');

    $response
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('name', config('app.name', 'digital-courses'))
            ->has('environment')
            ->has('timestamp')
        );
});
