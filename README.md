# digital-courses

Instruções diretas para inicializar o projeto Laravel localmente (PowerShell / Windows).

---

## Requisitos

-   PHP 8.1+
-   Composer
-   Node.js 16+ e npm
-   Git
-   (Opcional) Docker & Docker Compose — para Laravel Sail

## Passos rápidos (PowerShell)

Siga estritamente nesta ordem para evitar problemas comuns.

1. Clonar o repositório (se necessário)

```powershell
git clone <REPO_URL> digital-courses
cd C:\Users\Administrator\source\repos\digital-courses
```

2. Instalar dependências PHP e criar `.env`

```powershell
composer install --no-interaction
Copy-Item .env.example .env
php artisan key:generate
```

3. Banco de dados rápido para dev (SQLite)

```powershell
New-Item -ItemType File -Path database\database.sqlite -Force
# Editar .env: DB_CONNECTION=sqlite e DB_DATABASE=database/database.sqlite
```

4. Migrations e seeders

```powershell
php artisan migrate --seed
```

5. Dependências JS e rodar Vite (frontend)

```powershell
npm install
npm run dev
```

6. Rodar backend local

```powershell
php artisan serve --host=0.0.0.0 --port=8000
# Acesse: http://localhost:8000
```

## Alternativa: Laravel Sail (Docker)

Se não tem PHP/Composer local, use Sail:

```powershell
composer require laravel/sail --dev --no-interaction
php artisan sail:install --with=mysql,redis # ajustar conforme necessário
vendor\bin\artisan sail:up -d
```

## Notas rápidas sobre autenticação (Sanctum) e SPA

-   Para SPA: antes de chamadas autenticadas, chame `/sanctum/csrf-cookie`.
-   Use fetch/axios com credenciais (cookies):

```js
fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });
// depois: fetch('http://localhost:8000/api/rota', { credentials: 'include' })
```

## Problemas comuns e soluções

-   "Project directory is not empty" ao rodar `composer create-project` no root com arquivos: crie em pasta temporária e copie para o root ou crie em `backend/` dentro do repo. Exemplo (Windows):

```powershell
composer create-project --prefer-dist -n laravel/laravel digital-courses-temp
robocopy .\digital-courses-temp .\digital-courses /E /XF README.md
Remove-Item -Recurse -Force .\digital-courses-temp
```

-   Composer pedindo confirmação durante instalação: use `-n` ou `--no-interaction`.
-   CORS/Sanctum: ajustar `config/cors.php` e `config/sanctum.php` com o origin do frontend (ex.: `http://localhost:5173`).

## Scripts úteis

-   `php artisan migrate`
-   `php artisan db:seed`
-   `php artisan test`
-   `npm run dev` (desenvolvimento frontend)
-   `npm run build` (build produção frontend)

## Contato / responsáveis

-   Dono do repositório / responsável: <nome/email>
-   Canal de comunicação: Slack / Teams / etc.

---

## Alterações importantes no banco (resumo)

- Tabelas presentes / adicionadas:
	- `users` (id, name, email UNIQUE, password, email_verified_at, remember_token, timestamps)
	- `password_reset_tokens`, `sessions`
	- `cache`, `cache_locks`
	- `jobs`, `job_batches`, `failed_jobs`
	- `categories` (id, name, timestamps) — criada em 2026-01-07

- Seeders:
	- `DatabaseSeeder` cria um usuário de teste (email: `test@example.com`).

Comandos rápidos para garantir o banco pronto:
```powershell
php artisan migrate
php artisan db:seed
```

Coloque abaixo informações adicionais do projeto (variáveis `.env` obrigatórias, endpoints importantes ou decisões sobre onde ficará o frontend: `resources/views` (Blade), `resources/js` (SPA integrada) ou `frontend/` (repo/pasta separada)).

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

-   [Simple, fast routing engine](https://laravel.com/docs/routing).
-   [Powerful dependency injection container](https://laravel.com/docs/container).
-   Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
-   Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
-   Database agnostic [schema migrations](https://laravel.com/docs/migrations).
-   [Robust background job processing](https://laravel.com/docs/queues).
-   [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

-   **[Vehikl](https://vehikl.com)**
-   **[Tighten Co.](https://tighten.co)**
-   **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
-   **[64 Robots](https://64robots.com)**
-   **[Curotec](https://www.curotec.com/services/technologies/laravel)**
-   **[DevSquad](https://devsquad.com/hire-laravel-developers)**
-   **[Redberry](https://redberry.international/laravel-development)**
-   **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
