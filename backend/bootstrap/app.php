<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ── Proxy reverso (Traefik / Nginx / load balancer) ───────────────────
        // Sem isso, o Laravel ignora os headers X-Forwarded-Proto e gera URLs com
        // "http://" mesmo quando o sistema está atrás de HTTPS via Traefik.
        // Isso quebra: links de verificação de e-mail, JWT, cookies SameSite, etc.
        $middleware->trustProxies(
            at: '*',   // confia em qualquer proxy (Traefik pode ter IP dinâmico)
            headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR     |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST    |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT    |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO   |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_PREFIX,
        );

        $middleware->alias([
            'admin'        => \App\Http\Middleware\IsAdmin::class,
            'role'         => \App\Http\Middleware\CheckRole::class,
            'swagger.auth' => \App\Http\Middleware\SwaggerAuth::class,
        ]);
    })
    ->withProviders([
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class, // <— adicione esta linha
    ])
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
