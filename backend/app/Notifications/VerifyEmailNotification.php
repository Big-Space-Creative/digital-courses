<?php

namespace App\Notifications;

use App\Mail\VerifyEmail as VerifyEmailMailable;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends BaseVerifyEmail
{
    /**
     * Gera a URL de verificação assinada pelo backend.
     * O link no e-mail aponta para o endpoint da API, que após validar
     * redireciona o usuário para o frontend — evitando qualquer acoplamento
     * de URL no template de e-mail e garantindo a integridade da assinatura.
     */
    protected function verificationUrl(mixed $notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addHours(24),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    /**
     * Envia o e-mail customizado com a identidade visual da plataforma.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        /** @var User $notifiable */
        \Illuminate\Support\Facades\Mail::to($notifiable->email)
            ->send(new VerifyEmailMailable($notifiable, $verificationUrl));

        // Retorna um MailMessage vazio para satisfazer o contrato da interface.
        // O envio real é feito via Mail::send acima usando o Mailable customizado.
        return (new MailMessage)->subject('')->line('');
    }
}
