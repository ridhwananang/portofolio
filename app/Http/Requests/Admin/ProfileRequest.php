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
        $imageRule = $this->hasFile('image')
            ? ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120']
            : ['nullable'];

        return [
            'name' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'image' => $imageRule,
            'remove_image' => ['nullable'],
            'github_url' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'education' => ['nullable', 'array'],
            'education.*.school' => ['nullable', 'string', 'max:255'],
            'education.*.major' => ['nullable', 'string', 'max:255'],
            'education.*.period' => ['nullable', 'string', 'max:255'],
        ];
    }
}
