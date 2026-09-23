<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TechStackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'badge' => ['required', 'string', 'max:100'],
            'color' => ['required', 'string', 'max:100'],
            'text_color' => ['required', 'string', 'max:100'],
            'accent' => ['required', 'string', 'max:100'],
            'icon_name' => ['required', 'string', 'max:100'],
        ];
    }
}
