<?php

namespace App\Policies;

use App\Models\Material;
use App\Models\User;

class MaterialPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === User::ROLE_ADMIN) {
            return true;
        }

        return null;
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function update(User $user, Material $material): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }

    public function delete(User $user, Material $material): bool
    {
        return $user->role === User::ROLE_INSTRUCTOR;
    }
}
