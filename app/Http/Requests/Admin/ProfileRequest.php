<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'bio' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'education' => ['nullable', 'array'],
            'education.*.school' => ['required_with:education', 'string', 'max:255'],
            'education.*.major' => ['nullable', 'string', 'max:255'],
            'education.*.period' => ['nullable', 'string', 'max:255'],
        ];
    }
}
