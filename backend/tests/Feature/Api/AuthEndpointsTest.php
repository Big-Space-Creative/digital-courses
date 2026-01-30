<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_payload(): void
    {
        $payload = [
            'name' => 'Alice Example',
            'email' => 'alice@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'student',
            'avatar_url' => 'https://example.com/avatar.png',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response
            ->assertCreated()
            ->assertJsonStructure([
                'message',
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'avatar_url',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'alice@example.com',
            'role' => 'student',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $password = 'Password123';
        $user = User::factory()->create([
            'email' => 'bob@example.com',
            'password' => Hash::make($password),
            'role' => 'instructor',
            'avatar_url' => 'https://example.com/bob.png',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'message',
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                ],
            ])
            ->assertJsonPath('user.email', 'bob@example.com');
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'charlie@example.com',
            'password' => Hash::make('Password123'),
            'role' => 'admin',
            'avatar_url' => 'https://example.com/charlie.png',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'dani@example.com',
            'role' => 'student',
            'avatar_url' => 'https://example.com/dani.png',
        ]);

        $token = JWTAuth::fromUser($user);

        $response = $this->getJson('/api/me', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.email', 'dani@example.com');
    }
}
