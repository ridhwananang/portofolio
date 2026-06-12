<?php

namespace App\Actions\Settings;

use App\Models\User;

class UpdateUserPassword
{
    /**
     * Update the user's password.
     *
     * @param User $user
     * @param string $password
     * @return void
     */
    public function execute(User $user, string $password): void
    {
        $user->update([
            'password' => $password,
        ]);
    }
}
