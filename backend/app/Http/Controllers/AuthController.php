<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\JsonResponse as HttpFoundationJsonResponse;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|in:student,instructor,admin',
                'avatar_url' => 'nullable|url|max:2048',
            ], [
                // Mensagens customizadas em português
                'name.required' => 'O nome é obrigatório.',
                'name.max' => 'O nome não pode ter mais de 255 caracteres.',
                'email.required' => 'O e-mail é obrigatório.',
                'email.email' => 'O e-mail deve ser um endereço válido.',
                'email.unique' => 'Este e-mail já está cadastrado.',
                'password.required' => 'A senha é obrigatória.',
                'password.min' => 'A senha deve ter no mínimo 8 caracteres.',
                'password.confirmed' => 'A confirmação de senha não confere.',
                'role.required' => 'O tipo de usuário é obrigatório.',
                'role.in' => 'O tipo de usuário deve ser: student, instructor ou admin.',
                'avatar_url.url' => 'A URL do avatar deve ser válida.',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'avatar_url' => $validated['avatar_url'] ?? '',
            ]);

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Usuário registrado com sucesso',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'avatar_url' => $user->avatar_url,
                        'created_at' => $user->created_at,
                    ],
                    'token' => $token,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao registrar usuário',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Credenciais inválidas',
                ], 401);
            }
        } catch (JWTException $exception) {
            return response()->json([
                'message' => 'Erro ao gerar token',
                'error' => $exception->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Login bem-sucedido',
            'user' => Auth::user(),
            'token' => $token,
        ]);
    }
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully logged out',
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'message' => 'Erro ao fazer logout',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }
    
    public function me(Request $request): JsonResponse
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (JWTException $exception) {
            return response()->json([
                'message' => 'Token inválido ou expirado',
                'error' => $exception->getMessage(),
            ], 401);
        }

        return response()->json([
            'message' => 'Usuário autenticado',
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        $validated = $request->validate([
            'name'=>['required', 'string', 'max:255'],
            'email'=>[
                'required', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($user->id),
        ],
        'avatar_url'=> ['nullable','url','max:2048'],
    ]);
    
     $emailChanged = isset($validated['email']) && $validated['email'] !== $user->email;

        $user->name = $validated['name'];
        $user->avatar_url = $validated['avatar_url'] ?? $user->avatar_url;

        if ($emailChanged) {
            $user->email = $validated['email'];
            // zera verificação para forçar re-verificação do e-mail
            $user->email_verified_at = null;
        }

        $user->save();

        // dispara verificação de e-mail se o model suportar (MustVerifyEmail)
        if ($emailChanged && method_exists($user, 'sendEmailVerificationNotification')) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'user' => $user->fresh(),
        ]);
} public function refresh(): JsonResponse
{
    try {
        $token = JWTAuth::getToken();
        $newToken = JWTAuth::refresh($token);
        
        return response()->json([
            'message' => 'Token refreshed successfully',
            'token' => $newToken,
        ]);
    } catch (JWTException $exception) {
        return response()->json([
            'message' => 'Error refreshing token',
            'error' => $exception->getMessage(),
        ], 500);
    }
}
}