<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $imageRule = $this->isMethod('post') ? ['required', 'image', 'max:10240'] : ['nullable', 'image', 'max:10240'];

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'tags' => ['required', 'array', 'min:1'],
            'tags.*' => ['string', 'max:50'],
            'mockup_type' => ['required', 'string', 'max:50'],
            'image' => $imageRule,
        ];
    }
}
