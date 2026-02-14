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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,instructor,admin',
            'avatar_url' => 'nullable|url|max:2048',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            //'password_confirmation' = $password
            'role' => $validated['role'],
            'avatar_url' => $validated['avatar_url'] ?? '',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Usuário registrado com sucesso',
            'user' => $user,
            'token' => $token,
        ], 201);
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
}
}