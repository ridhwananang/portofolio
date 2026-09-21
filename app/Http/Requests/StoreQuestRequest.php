<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:20'],
            'reward_amount' => ['required', 'numeric', 'min:10000', 'max:100000000'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul quest wajib diisi.',
            'description.required' => 'Deskripsi quest wajib diisi.',
            'description.min' => 'Deskripsi quest minimal 20 karakter.',
            'reward_amount.required' => 'Nominal hadiah quest wajib diisi.',
            'reward_amount.min' => 'Nominal hadiah minimal Rp 10.000.',
        ];
    }
}
