<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:pending_payment,in_progress,in_review,completed,cancelled'],
            'payment_scheme' => ['nullable', 'string', 'in:down_payment,full_payment'],
            'payment_stage' => ['nullable', 'string', 'in:awaiting_dp,dp_paid,awaiting_final,fully_paid'],
            'dp_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'dp_amount' => ['nullable', 'numeric', 'min:0'],
            'remaining_amount' => ['nullable', 'numeric', 'min:0'],
            'staging_url' => ['nullable', 'url', 'max:255'],
            'notes' => ['nullable', 'string'],
            'milestone_progress' => ['nullable', 'array'],
            'handover_data' => ['nullable', 'array'],
            'client_brief' => ['nullable', 'array'],
        ];
    }
}
