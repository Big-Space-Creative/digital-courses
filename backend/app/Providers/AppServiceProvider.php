<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // O link de redefinição de senha aponta para a página do frontend (SPA),
        // não para uma rota web do backend (que é API-only).
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'https://aulasviolao.bigspacecreative.com.br'), '/');

            return $frontendUrl.'/redefinir-senha?token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
