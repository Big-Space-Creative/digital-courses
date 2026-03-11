<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protege as rotas do Swagger UI.
 *
 * Comportamento por ambiente:
 *  - local / testing  → acesso livre (sem restrição)
 *  - staging          → exige HTTP Basic Auth com SWAGGER_USER / SWAGGER_PASSWORD do .env
 *  - production       → bloqueado completamente (404) a menos que SWAGGER_ENABLED=true no .env
 *
 * Para habilitar em staging/produção, defina no .env:
 *   SWAGGER_ENABLED=true
 *   SWAGGER_USER=admin
 *   SWAGGER_PASSWORD=senha-forte-aqui
 */
class SwaggerAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $env = app()->environment();

        // Em produção: bloqueado por padrão, só libera se SWAGGER_ENABLED=true
        if ($env === 'production') {
            if (env('SWAGGER_ENABLED', 'false') !== 'true') {
                abort(404);
            }
        }

        // Em staging ou produção (quando habilitado): exige Basic Auth
        if (in_array($env, ['production', 'staging'])) {
            $user     = env('SWAGGER_USER');
            $password = env('SWAGGER_PASSWORD');

            if (! $user || ! $password) {
                // Sem credenciais configuradas → bloqueia
                abort(403, 'Swagger não está disponível neste ambiente.');
            }

            if (
                $request->getUser() !== $user ||
                $request->getPassword() !== $password
            ) {
                return response('Acesso negado.', 401, [
                    'WWW-Authenticate' => 'Basic realm="Digital Courses API Docs"',
                ]);
            }
        }

        return $next($request);
    }
}
