<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $name = env('ADMIN_NAME', 'Admin');
        $email = env('ADMIN_EMAIL', 'admin@aulasviolao.bigspacecreative.com.br');
        $password = env('ADMIN_PASSWORD');

        if (empty($password)) {
            $this->command->warn("AVISO: A variável ADMIN_PASSWORD não foi definida no .env.");
            $this->command->warn("O usuário admin NÃO será criado ou atualizado até que a senha seja configurada.");
            return;
        }

        $user = User::withTrashed()->where('email', $email)->first();

        $data = [
            'name' => $name,
            'password' => Hash::make($password),
            'role' => User::ROLE_ADMIN,
            'subscription_type' => User::SUBSCRIPTION_FREE,
            'email_verified_at' => now(),
            'avatar_url' => 'https://ui-avatars.com/api/?name=' . urlencode($name),
        ];

        if ($user) {
            if ($user->trashed()) {
                $user->restore();
            }
            $user->update($data);
            $this->command->info("✅ Usuário admin existente atualizado com sucesso ({$email})!");
        } else {
            $data['email'] = $email;
            User::create($data);
            $this->command->info("✅ Usuário admin inicial criado com sucesso ({$email})!");
        }
    }
}
