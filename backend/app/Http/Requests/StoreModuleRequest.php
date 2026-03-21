<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Autoriza se usuário é admin ou instructor
        return in_array(auth()->user()?->role, ['admin', 'instructor']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'order' => 'required|integer|min:0|max:999',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'O título do módulo é obrigatório',
            'title.max' => 'O título não pode exceder 255 caracteres',
            'description.max' => 'A descrição não pode exceder 2000 caracteres',
            'order.required' => 'A ordem do módulo é obrigatória',
            'order.integer' => 'A ordem deve ser um número inteiro',
            'order.min' => 'A ordem deve ser no mínimo 0',
            'order.max' => 'A ordem não pode exceder 999',
        ];
    }
}
