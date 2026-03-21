<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/register",
     *     operationId="authRegister",
     *     tags={"Auth"},
     *     summary="Registrar novo usuário",
     *     description="Cria uma nova conta e retorna access_token + refresh_token.",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation","role"},
     *
     *             @OA\Property(property="name",                 type="string",  example="Alice Silva"),
     *             @OA\Property(property="email",                type="string",  format="email", example="alice@example.com"),
     *             @OA\Property(property="password",             type="string",  format="password", minLength=8, example="secret123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="secret123"),
     *             @OA\Property(property="role",                 type="string",  enum={"student","instructor","admin"}, example="student"),
     *             @OA\Property(property="avatar_url",           type="string",  format="url", nullable=true, example="https://cdn.example.com/avatar.jpg")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Usuário registrado com sucesso",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Usuário registrado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id",         type="integer", example=1),
     *                     @OA\Property(property="name",       type="string",  example="Alice Silva"),
     *                     @OA\Property(property="email",      type="string",  example="alice@example.com"),
     *                     @OA\Property(property="role",       type="string",  example="student"),
     *                     @OA\Property(property="avatar_url", type="string",  example="https://cdn.example.com/avatar.jpg"),
     *                     @OA\Property(property="created_at", type="string",  format="date-time")
     *                 ),
     *                 @OA\Property(property="access_token",  type="string"),
     *                 @OA\Property(property="refresh_token", type="string"),
     *                 @OA\Property(property="token_type",   type="string", example="bearer"),
     *                 @OA\Property(property="expires_in",   type="integer", example=3600)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Erro de validação",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string",  example="Erro de validação"),
     *             @OA\Property(property="errors",  type="object")
     *         )
     *     )
     * )
     */
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
            // Some JWT driver implementations don't expose setTTL on the claims builder.
            // Create a refresh token with a claim type instead and rely on server-side validation.
            $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

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
                    'access_token' => $token,
                    'refresh_token' => $refreshToken,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60,
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

    /**
     * @OA\Post(
     *     path="/api/v1/login",
     *     operationId="authLogin",
     *     tags={"Auth"},
     *     summary="Login do usuário",
     *     description="Autentica o usuário e retorna access_token + refresh_token.",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email","password"},
     *
     *             @OA\Property(property="email",    type="string", format="email",    example="alice@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Login bem-sucedido",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Login bem-sucedido"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user",          type="object"),
     *                 @OA\Property(property="access_token",  type="string"),
     *                 @OA\Property(property="refresh_token", type="string"),
     *                 @OA\Property(property="token_type",    type="string", example="bearer"),
     *                 @OA\Property(property="expires_in",    type="integer", example=3600)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Credenciais inválidas",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string",  example="Credenciais inválidas")
     *         )
     *     )
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciais inválidas',
                ], 401);
            }

            $user = Auth::user();
            // See note above: avoid calling setTTL on the claims builder to keep compatibility
            $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Login bem-sucedido',
                'data' => [
                    'user' => $user,
                    'access_token' => $token,
                    'refresh_token' => $refreshToken,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60,
                ],
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar token',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/logout",
     *     operationId="authLogout",
     *     tags={"Auth"},
     *     summary="Logout",
     *     description="Invalida o token JWT atual.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Logout realizado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status",  type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Successfully logged out")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Token inválido ou ausente")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/v1/me",
     *     operationId="authMe",
     *     tags={"Perfil"},
     *     summary="Usuário autenticado",
     *     description="Retorna os dados do usuário dono do token JWT.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(response=200, description="Usuário autenticado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Usuário autenticado"),
     *             @OA\Property(property="user",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Token inválido ou expirado")
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/v1/profile",
     *     operationId="authUpdateProfile",
     *     tags={"Perfil"},
     *     summary="Atualizar perfil",
     *     description="Atualiza nome, avatar e/ou senha do usuário autenticado. E-mail não pode ser alterado por este endpoint.",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name",                  type="string", example="Alice Novo Nome"),
     *             @OA\Property(property="avatar_url",            type="string", format="url", nullable=true, example="https://cdn.example.com/avatar2.jpg"),
     *             @OA\Property(property="password",              type="string", format="password", minLength=8, example="novasenha123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="novasenha123")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Perfil atualizado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Perfil atualizado com sucesso"),
     *             @OA\Property(property="user",    type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Token inválido"),
     *     @OA\Response(response=422, description="Erro de validação")
     * )
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = JWTAuth::parseToken()->authenticate();

        // Permitir atualizações parciais. Proibimos alteração de e-mail por este endpoint.
        // Campos disponíveis na tabela users: name, avatar_url, password.
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['prohibited'],
            'avatar_url' => ['nullable', 'url', 'max:2048'],
            'password' => ['sometimes', 'required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'O nome é obrigatório.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'email.prohibited' => 'O e-mail não pode ser alterado por este endpoint. Apenas nome, avatar e senha podem ser atualizados.',
            'avatar_url.url' => 'A URL do avatar deve ser válida.',
            'password.min' => 'A senha deve ter no mínimo 8 caracteres.',
            'password.confirmed' => 'A confirmação de senha não confere.',
        ]);

        // Atualiza somente os campos enviados na requisição
        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('avatar_url', $validated)) {
            $user->avatar_url = $validated['avatar_url'];
        }

        if (array_key_exists('password', $validated)) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Perfil atualizado com sucesso',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/refresh",
     *     operationId="authRefresh",
     *     tags={"Auth"},
     *     summary="Renovar access token",
     *     description="Gera um novo access_token usando um refresh_token válido. Envie o refresh_token no header Authorization: Bearer {refresh_token} ou no body.",
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="refresh_token", type="string", description="Refresh token (alternativo ao header Authorization)")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Token renovado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Token renovado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="access_token", type="string"),
     *                 @OA\Property(property="token_type",   type="string", example="bearer"),
     *                 @OA\Property(property="expires_in",   type="integer", example=3600)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=400, description="Refresh token não fornecido"),
     *     @OA\Response(response=401, description="Refresh token inválido ou expirado")
     * )
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            // Pega o refresh token do header ou body
            $refreshToken = $request->bearerToken() ?? $request->input('refresh_token');

            if (! $refreshToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token não fornecido',
                ], 400);
            }

            // Valida que é um refresh token
            JWTAuth::setToken($refreshToken);
            $payload = JWTAuth::getPayload();

            if ($payload->get('type') !== 'refresh') {
                return response()->json([
                    'success' => false,
                    'message' => 'Token inválido',
                ], 401);
            }

            // Gera novo access token
            $user = JWTAuth::authenticate($refreshToken);
            $newAccessToken = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Token renovado com sucesso',
                'data' => [
                    'access_token' => $newAccessToken,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60,
                ],
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao renovar token',
                'error' => $exception->getMessage(),
            ], 401);
        }
    }
}
