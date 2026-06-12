<?php

namespace App\Actions\Settings;

use App\Models\User;

class UpdateProfileInformation
{
    /**
     * Update the user's profile information.
     *
     * @param User $user
     * @param array $input
     * @return void
     */
    public function execute(User $user, array $input): void
    {
        $user->fill($input);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
    }
}
