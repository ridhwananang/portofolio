<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveQuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_code' => ['required', 'string', 'max:20'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder_name' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'bank_code.required' => 'Kode bank wajib dipilih.',
            'account_number.required' => 'Nomor rekening / e-wallet wajib diisi.',
            'account_holder_name.required' => 'Nama pemilik rekening wajib diisi.',
        ];
    }
}
