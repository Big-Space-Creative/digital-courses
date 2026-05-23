<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'email' => 'admin@test.com',
                'name' => 'Admin Teste',
                'role' => User::ROLE_ADMIN,
                'subscription_type' => User::SUBSCRIPTION_FREE,
            ],
            [
                'email' => 'professor@test.com',
                'name' => 'Professor Teste',
                'role' => User::ROLE_INSTRUCTOR,
                'subscription_type' => User::SUBSCRIPTION_FREE,
            ],
            [
                'email' => 'student.free@test.com',
                'name' => 'Aluno Free Teste',
                'role' => User::ROLE_STUDENT,
                'subscription_type' => User::SUBSCRIPTION_FREE,
            ],
            [
                'email' => 'student.premium@test.com',
                'name' => 'Aluno Premium Teste',
                'role' => User::ROLE_STUDENT,
                'subscription_type' => User::SUBSCRIPTION_PREMIUM,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::withTrashed()->where('email', $userData['email'])->first();

            $dataToUpdate = [
                'name' => $userData['name'],
                'password' => Hash::make('password'),
                'role' => $userData['role'],
                'subscription_type' => $userData['subscription_type'],
                'email_verified_at' => now(),
                'avatar_url' => 'https://ui-avatars.com/api/?name=' . urlencode($userData['name']),
            ];

            if ($user) {
                if ($user->trashed()) {
                    $user->restore();
                }
                $user->update($dataToUpdate);
                $this->command->info("Atualizado: {$userData['email']}");
            } else {
                $dataToUpdate['email'] = $userData['email'];
                try {
                    $this->command->info("Criando: {$userData['email']}");
                    $created = User::create($dataToUpdate);
                    $this->command->info("Criado ID: " . ($created ? $created->id : 'NULO'));
                } catch (\Exception $e) {
                    $this->command->error("Erro ao criar usuário {$userData['email']}: " . $e->getMessage());
                }
            }
        }

        $this->command->info("Usuários de teste processados!");
        $this->command->table(
            ['Nome', 'Email', 'Role', 'Plano', 'Senha'],
            [
                ['Admin Teste', 'admin@test.com', 'admin', '-', 'password'],
                ['Professor Teste', 'professor@test.com', 'instructor', '-', 'password'],
                ['Aluno Free Teste', 'student.free@test.com', 'student', 'free', 'password'],
                ['Aluno Premium Teste', 'student.premium@test.com', 'student', 'premium', 'password'],
            ]
        );
    }
}
