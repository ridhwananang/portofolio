<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $fileRule = $this->isMethod('post')
            ? ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:15360']
            : ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:15360'];

        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'issuer' => ['required', 'string', 'max:255'],
            'credential_id' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'string', 'max:100'],
            'duration' => ['required', 'string', 'max:100'],
            'skills' => ['required', 'array', 'min:1'],
            'skills.*' => ['string', 'max:50'],
            'file' => $fileRule,
        ];
    }
}
