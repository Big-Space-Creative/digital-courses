<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Confirme seu e-mail — {{ $appName }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0f0f13;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #e4e4e7;
        }

        .wrapper {
            max-width: 600px;
            margin: 40px auto;
            background: #18181b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
        }

        /* ── Header ── */
        .header {
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
            padding: 40px 48px 36px;
            text-align: center;
        }

        .header .logo {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
        }

        .header .logo span {
            color: #c4b5fd;
        }

        /* ── Body ── */
        .body {
            padding: 48px;
        }

        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #f4f4f5;
            margin: 0 0 16px;
        }

        .text {
            font-size: 15px;
            line-height: 1.7;
            color: #a1a1aa;
            margin: 0 0 24px;
        }

        /* ── Button ── */
        .btn-wrapper {
            text-align: center;
            margin: 32px 0;
        }

        .btn {
            display: inline-block;
            padding: 14px 36px;
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
            color: #ffffff !important;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 10px;
            letter-spacing: 0.2px;
            transition: opacity 0.2s;
        }

        /* ── Divider ── */
        .divider {
            border: none;
            border-top: 1px solid #27272a;
            margin: 32px 0;
        }

        /* ── URL fallback ── */
        .url-fallback {
            font-size: 13px;
            color: #71717a;
            word-break: break-all;
        }

        .url-fallback a {
            color: #a78bfa;
            text-decoration: underline;
        }

        /* ── Notice ── */
        .notice {
            background: #1c1c24;
            border-left: 3px solid #f59e0b;
            border-radius: 6px;
            padding: 14px 18px;
            font-size: 13px;
            color: #a1a1aa;
            margin: 24px 0 0;
        }

        .notice strong {
            color: #fbbf24;
        }

        /* ── Footer ── */
        .footer {
            padding: 24px 48px;
            background: #111113;
            text-align: center;
            font-size: 12px;
            color: #52525b;
            border-top: 1px solid #1f1f23;
        }

        .footer a {
            color: #7c3aed;
            text-decoration: none;
        }
    </style>
</head>
<body>
<div class="wrapper">

    <!-- Header -->
    <div class="header">
        <div class="logo">
            Digital<span>Courses</span>
        </div>
    </div>

    <!-- Body -->
    <div class="body">
        <p class="greeting">Olá, {{ $user->name }} 👋</p>

        <p class="text">
            Estamos felizes em ter você por aqui! Para ativar sua conta e começar a explorar
            nossos cursos, confirme o seu endereço de e-mail clicando no botão abaixo.
        </p>

        <div class="btn-wrapper">
            <a href="{{ $verificationUrl }}" class="btn">
                ✉️ &nbsp;Verificar meu e-mail
            </a>
        </div>

        <p class="text">
            Se o botão não funcionar, copie e cole o link abaixo diretamente no seu navegador:
        </p>

        <p class="url-fallback">
            <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
        </p>

        <div class="notice">
            <strong>⚠️ Atenção:</strong> este link expira em <strong>{{ $expiresInHours }} horas</strong>.
            Após esse prazo, solicite um novo e-mail de verificação na tela de login.
        </div>

        <hr class="divider" />

        <p class="text" style="margin:0; font-size:13px;">
            Se você não criou uma conta em <strong>{{ $appName }}</strong>, ignore este e-mail
            com segurança — nenhuma ação será tomada.
        </p>
    </div>

    <!-- Footer -->
    <div class="footer">
        © {{ date('Y') }} {{ $appName }}. Todos os direitos reservados.<br />
        Você está recebendo este e-mail porque se cadastrou em nossa plataforma.
    </div>

</div>
</body>
</html>
