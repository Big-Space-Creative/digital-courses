<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use OpenApi\Annotations as OA;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

/**
 * @OA\Tag(name="Auth",    description="Autenticação e gerenciamento de tokens")
 * @OA\Tag(name="Perfil",  description="Dados e atualização do perfil do usuário")
 * @OA\Tag(name="E-mail",  description="Verificação de e-mail")
 */
class AuthController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/v1/register",
     *     operationId="authRegister",
     *     tags={"Auth"},
     *     summary="Registrar novo usuário",
     *     description="Cria uma nova conta e envia e-mail de verificação. O login só é liberado após o usuário confirmar o e-mail.",
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
     *         description="Usuário registrado — e-mail de verificação enviado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="Conta criada com sucesso. Verifique seu e-mail para ativar o acesso."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id",         type="integer", example=1),
     *                     @OA\Property(property="name",       type="string",  example="Alice Silva"),
     *                     @OA\Property(property="email",      type="string",  example="alice@example.com"),
     *                     @OA\Property(property="role",       type="string",  example="student"),
     *                     @OA\Property(property="avatar_url", type="string",  example="https://cdn.example.com/avatar.jpg"),
     *                     @OA\Property(property="created_at", type="string",  format="date-time")
     *                 )
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
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                'avatar_url' => 'nullable|url|max:2048',
            ], [
                'name.required'      => 'O nome é obrigatório.',
                'name.max'           => 'O nome não pode ter mais de 255 caracteres.',
                'email.required'     => 'O e-mail é obrigatório.',
                'email.email'        => 'O e-mail deve ser um endereço válido.',
                'email.unique'       => 'Este e-mail já está cadastrado.',
                'password.required'  => 'A senha é obrigatória.',
                'password.min'       => 'A senha deve ter no mínimo 8 caracteres.',
                'password.confirmed' => 'A confirmação de senha não confere.',
                'avatar_url.url'     => 'A URL do avatar deve ser válida.',
            ]);

            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => Hash::make($validated['password']),
                'role'       => 'student',
                'avatar_url' => $validated['avatar_url'] ?? '',
            ]);

            // Tenta enviar o e-mail de verificação.
            // Se o SMTP não estiver configurado, o erro é capturado silenciosamente:
            // o usuário é criado com sucesso e poderá verificar o e-mail depois.
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Exception $mailException) {
                // Log para diagnóstico — não interrompe o fluxo de cadastro
                \Illuminate\Support\Facades\Log::warning(
                    'Email de verificação não enviado para ' . $user->email . ': ' . $mailException->getMessage()
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Conta criada com sucesso. Verifique seu e-mail para ativar o acesso.',
                'data'    => [
                    'user' => [
                        'id'         => $user->id,
                        'name'       => $user->name,
                        'email'      => $user->email,
                        'role'       => $user->role,
                        'avatar_url' => $user->avatar_url,
                        'created_at' => $user->created_at,
                    ],
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao registrar usuário',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/v1/login",
     *     operationId="authLogin",
     *     tags={"Auth"},
     *     summary="Login do usuário",
     *     description="Autentica o usuário e retorna access_token + refresh_token. Exige e-mail verificado.",
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
     *     ),
     *
     *     @OA\Response(response=403, description="E-mail não verificado",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success",           type="boolean", example=false),
     *             @OA\Property(property="message",           type="string",  example="E-mail não verificado."),
     *             @OA\Property(property="email_verified",    type="boolean", example=false),
     *             @OA\Property(property="resend_endpoint",   type="string",  example="/api/v1/email/resend")
     *         )
     *     )
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            // Bloqueia o login antes de gerar qualquer token.
            // O usuário precisa verificar o e-mail primeiro.
            // Nota: fazemos o lookup antes do attempt() para evitar gerar
            // um token JWT que precisaríamos invalidar logo em seguida.
            $candidate = User::where('email', $credentials['email'])->first();

            if ($candidate && ! $candidate->hasVerifiedEmail()) {
                return response()->json([
                    'success'        => false,
                    'message'        => 'Verifique seu e-mail antes de fazer login. Acesse sua caixa de entrada e clique no link enviado.',
                    'email_verified' => false,
                ], 403);
            }

            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciais inválidas',
                ], 401);
            }

            /** @var User $user */
            $user = Auth::user();

            $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Login bem-sucedido',
                'data'    => [
                    'user'          => $user,
                    'access_token'  => $token,
                    'refresh_token' => $refreshToken,
                    'token_type'    => 'bearer',
                    'expires_in'    => config('jwt.ttl') * 60,
                ],
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar token',
                'error'   => $exception->getMessage(),
            ], 500);
        }
    }


    // ──────────────────────────────────────────────────────────────────────────
    // EMAIL VERIFY
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Get(
     *     path="/api/v1/email/verify/{id}/{hash}",
     *     operationId="emailVerify",
     *     tags={"E-mail"},
     *     summary="Verificar e-mail",
     *     description="Valida o link assinado recebido por e-mail. Após verificar, redireciona para o frontend.",
     *
     *     @OA\Parameter(name="id",        in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="hash",      in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Parameter(name="expires",   in="query", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="signature", in="query", required=true, @OA\Schema(type="string")),
     *
     *     @OA\Response(response=302, description="Redirecionamento para o frontend após verificação"),
     *     @OA\Response(response=400, description="Hash inválido"),
     *     @OA\Response(response=410, description="Link expirado")
     * )
     */
    public function verifyEmail(Request $request, int $id, string $hash): RedirectResponse
    {
        $frontendBase = rtrim(config('app.frontend_url'), '/');

        /** @var User|null $user */
        $user = User::find($id);

        // Usuário não encontrado ou hash inválido
        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect("{$frontendBase}/email-verified?status=invalid");
        }

        // Já verificado anteriormente
        if ($user->hasVerifiedEmail()) {
            return redirect("{$frontendBase}/email-verified?status=already-verified");
        }

        // Marca o e-mail como verificado e dispara evento nativo do Laravel
        $user->markEmailAsVerified();
        event(new Verified($user));

        // ── Auto-login: gera um token de uso único (one-time token) ──────────
        // Armazenado no cache com TTL de 5 minutos.
        // O frontend trocará esse token por um par JWT via POST /email/token-exchange.
        // Cache::pull() consome e deleta atomicamente — previne reutilização.
        $oneTimeToken = \Illuminate\Support\Str::random(64);
        \Illuminate\Support\Facades\Cache::put(
            "email_autologin:{$oneTimeToken}",
            $user->id,
            now()->addMinutes(5)
        );

        return redirect("{$frontendBase}/email-verified?status=success&token={$oneTimeToken}");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // RESEND VERIFICATION
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/v1/email/resend",
     *     operationId="emailResend",
     *     tags={"E-mail"},
     *     summary="Reenviar e-mail de verificação",
     *     description="Reenvio do e-mail de verificação. Não requer autenticação — basta o e-mail cadastrado.",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email"},
     *
     *             @OA\Property(property="email", type="string", format="email", example="alice@example.com")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="E-mail reenviado (ou já verificado)",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string",  example="E-mail de verificação reenviado com sucesso.")
     *         )
     *     ),
     *     @OA\Response(response=422, description="E-mail inválido")
     * )
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'O e-mail é obrigatório.',
            'email.email'    => 'Informe um e-mail válido.',
        ]);

        $user = User::where('email', $request->email)->first();

        // Resposta genérica — anti-enumeração
        if (! $user || $user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'message' => 'Se este e-mail estiver cadastrado e ainda não verificado, um novo link será enviado em instantes.',
            ]);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Reenvio de e-mail falhou: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'E-mail de verificação reenviado com sucesso.',
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AUTO-LOGIN (troca de one-time token por JWT)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/v1/email/token-exchange",
     *     operationId="emailTokenExchange",
     *     tags={"E-mail"},
     *     summary="Trocar one-time token por JWT",
     *     description="Após a verificação de e-mail, o frontend envia o token de uso único e recebe um par JWT para login automático. O token é consumido e invalidado após o uso.",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"token"},
     *
     *             @OA\Property(property="token", type="string", example="abc123...")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="JWT retornado com sucesso"),
     *     @OA\Response(response=401, description="Token inválido ou expirado")
     * )
     */
    public function autoLogin(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        // Cache::pull() retorna o valor E o deleta atomicamente (uso único)
        $userId = \Illuminate\Support\Facades\Cache::pull("email_autologin:{$request->token}");

        if (! $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido ou expirado. Faça login manualmente.',
            ], 401);
        }

        /** @var User|null $user */
        $user = User::find($userId);

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado.',
            ], 404);
        }

        $token        = JWTAuth::fromUser($user);
        $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Login automático realizado com sucesso!',
            'data'    => [
                'user'          => $user,
                'access_token'  => $token,
                'refresh_token' => $refreshToken,
                'token_type'    => 'bearer',
                'expires_in'    => config('jwt.ttl') * 60,
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // ──────────────────────────────────────────────────────────────────────────

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
                'status'  => 'success',
                'message' => 'Successfully logged out',
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'message' => 'Erro ao fazer logout',
                'error'   => $exception->getMessage(),
            ], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ME
    // ──────────────────────────────────────────────────────────────────────────

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
                'error'   => $exception->getMessage(),
            ], 401);
        }

        return response()->json([
            'message' => 'Usuário autenticado',
            'user'    => $user,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UPDATE PROFILE
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/v1/me",
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

        $validated = $request->validate([
            'name'       => ['sometimes', 'required', 'string', 'max:255'],
            'email'      => ['prohibited'],
            'avatar_url' => ['nullable', 'url', 'max:2048'],
            'password'   => ['sometimes', 'required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required'      => 'O nome é obrigatório.',
            'name.max'           => 'O nome não pode ter mais de 255 caracteres.',
            'email.prohibited'   => 'O e-mail não pode ser alterado por este endpoint.',
            'avatar_url.url'     => 'A URL do avatar deve ser válida.',
            'password.min'       => 'A senha deve ter no mínimo 8 caracteres.',
            'password.confirmed' => 'A confirmação de senha não confere.',
        ]);

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
            'user'    => $user->fresh(),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // REFRESH TOKEN
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * @OA\Post(
     *     path="/api/v1/refresh",
     *     operationId="authRefresh",
     *     tags={"Auth"},
     *     summary="Renovar access token",
     *     description="Gera um novo access_token usando um refresh_token válido.",
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
            $refreshToken = $request->bearerToken() ?? $request->input('refresh_token');

            if (! $refreshToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token não fornecido',
                ], 400);
            }

            JWTAuth::setToken($refreshToken);
            $payload = JWTAuth::getPayload();

            if ($payload->get('type') !== 'refresh') {
                return response()->json([
                    'success' => false,
                    'message' => 'Token inválido',
                ], 401);
            }

            $user = JWTAuth::authenticate($refreshToken);
            $newAccessToken = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'Token renovado com sucesso',
                'data'    => [
                    'access_token' => $newAccessToken,
                    'token_type'   => 'bearer',
                    'expires_in'   => config('jwt.ttl') * 60,
                ],
            ]);
        } catch (JWTException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao renovar token',
                'error'   => $exception->getMessage(),
            ], 401);
        }
    }
}
