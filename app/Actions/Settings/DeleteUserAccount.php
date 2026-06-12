<?php

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DeleteUserAccount
{
    /**
     * Delete the user's account and invalidate the session.
     *
     * @param User $user
     * @param Request $request
     * @return void
     */
    public function execute(User $user, Request $request): void
    {
        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
