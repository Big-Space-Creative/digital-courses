<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Marca todos os usuários existentes (com email_verified_at = null)
     * como verificados, para que o novo fluxo de verificação por e-mail
     * não bloqueie quem já estava cadastrado antes da implementação.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    /**
     * Não há reversão segura — não podemos saber quais usuários
     * eram de fato verificados antes desta migration.
     */
    public function down(): void
    {
        // Intencional: sem rollback para evitar perda de dados.
    }
};
