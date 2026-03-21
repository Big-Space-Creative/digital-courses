<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRequest extends FormRequest
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
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:5000',
            'video_url' => 'nullable|string|max:2048',
            'duration_in_minutes' => 'nullable|integer|min:1|max:1440',
            'is_free_preview' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.max' => 'O título não pode exceder 255 caracteres',
            'description.max' => 'A descrição não pode exceder 5000 caracteres',
            'video_url.max' => 'A URL do vídeo não pode exceder 2048 caracteres',
            'duration_in_minutes.integer' => 'A duração deve ser um número inteiro',
            'duration_in_minutes.min' => 'A duração deve ser no mínimo 1 minuto',
            'duration_in_minutes.max' => 'A duração não pode exceder 1440 minutos (24h)',
            'is_free_preview.boolean' => 'O campo preview gratuito deve ser um booleano',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitizar URL do vídeo (remover espaços em branco)
        if ($this->has('video_url')) {
            $url = trim($this->get('video_url'));

            // Validar que é URL MinIO se fornecida
            if (! empty($url)) {
                $this->merge(['video_url' => $url]);
            }
        }
    }
}
