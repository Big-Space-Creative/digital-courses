# digital-courses

Monorepo com backend Laravel agrupado em `backend/` e pasta dedicada (`frontend/`) para o futuro app React/Next.js que consumirá essa API.

Instruções diretas para inicializar o backend Laravel localmente (PowerShell / Windows).

---

## Requisitos

### Backend (Laravel API)

- PHP 8.2+
- Composer
- Git

### Frontend (Next.js, opcional neste momento)

- Node.js 20+
- npm ou pnpm

### Docker (recomendado para o backend)

- Docker Desktop
- Docker Compose

## Passos rápidos (backend local - PowerShell)

**Use esta opção apenas se NÃO for usar Docker.** Para Docker, veja a seção abaixo.

1. Clonar o repositório (se necessário)

```powershell
git clone <REPO_URL> digital-courses
cd C:\Users\Administrator\source\repos\digital-courses\backend
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

5. Rodar backend local

```powershell
php artisan serve --host=0.0.0.0 --port=8000
# API: http://localhost:8000
```

## Opção Docker (recomendado para desenvolvimento)

Este projeto inclui configuração Docker completa (PHP-FPM, Nginx, PostgreSQL, Redis, MinIO e pgAdmin).

**Setup rápido (Windows):**

```powershell
# Executar script de inicialização (faz tudo automaticamente)
.\docker-init.bat
```

**Setup manual:**

```powershell
# 1. Copiar arquivo de ambiente para o backend
Copy-Item .ackend\.env.example .ackend\.env

# 2. Build e iniciar containers
docker-compose build
docker-compose up -d

# 3. Instalar dependências e configurar (executa dentro do container app)
docker-compose exec app composer install --no-interaction
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate --seed
```

**Acessar aplicação:**

- API: http://localhost:8000
- Frontend dev (quando houver Next.js): http://localhost:3000
- pgAdmin: http://localhost:8080 (email/pwd: definidos em `.env`)
- PostgreSQL: localhost:5432
- MinIO: http://localhost:9000 (API S3) | http://localhost:9001 (console)
- Redis: localhost:6379

**Comandos úteis Docker:**

```powershell
docker-compose up -d              # Iniciar containers
docker-compose down               # Parar containers
docker-compose logs -f app        # Ver logs
docker-compose exec app bash      # Acessar container
docker-compose exec app php artisan migrate
docker-compose exec app php artisan test
```

## Testando os endpoints de registro e login

1. Suba o backend (local ou Docker) e garanta que o `.env` já possui a `JWT_SECRET` (o comando `php artisan jwt:secret` já foi executado anteriormente). A API deve responder em `http://localhost:8000`.
2. Crie/limpe o banco (`php artisan migrate:fresh --seed`) caso queira começar com uma base previsível antes dos testes.

### Fluxo manual rápido (cURL ou Postman)

```powershell
# Registrar um novo usuário
curl -X POST http://localhost:8000/api/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Alice Test",
    "email": "alice@example.com",
    "password": "Password123",
    "password_confirmation": "Password123",
    "role": "student",
    "avatar_url": "https://example.com/avatar.png"
     }'

# Fazer login e recuperar o token JWT
curl -X POST http://localhost:8000/api/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "alice@example.com",
    "password": "Password123"
     }'

# Consultar o perfil autenticado com o token retornado
curl http://localhost:8000/api/me `
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

Dicas para Postman/Insomnia:

- Crie uma coleção e configure a variável `{{baseUrl}} = http://localhost:8000`.
- Requests:
  - `POST {{baseUrl}}/api/register` com o corpo JSON acima.
  - `POST {{baseUrl}}/api/login` para obter o token.
  - `GET {{baseUrl}}/api/me` com o header `Authorization: Bearer {{token}}`.
- Aproveite o recurso "Tests" do Postman para salvar automaticamente o token em uma variável de ambiente após o login.

### Testes automatizados

O pacote já inclui um teste de feature cobrindo registro, login e `GET /api/me`. Execute:

```powershell
php artisan test --filter=AuthEndpointsTest
```

## Alternativa: Laravel Sail (Docker oficial)

Se preferir usar Sail ao invés da configuração customizada:

```powershell
composer require laravel/sail --dev --no-interaction
php artisan sail:install --with=pgsql,redis
vendor\bin\artisan sail:up -d
```

## Notas rápidas sobre autenticação (Sanctum) e SPA

- Para SPA: antes de chamadas autenticadas, chame `/sanctum/csrf-cookie`.
- Use fetch/axios com credenciais (cookies):

```js
fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });
// depois: fetch('http://localhost:8000/api/rota', { credentials: 'include' })
```

## Problemas comuns e soluções

- "Project directory is not empty" ao rodar `composer create-project` no root com arquivos: crie em pasta temporária e copie para `backend/`. Exemplo (Windows):

```powershell
composer create-project --prefer-dist -n laravel/laravel digital-courses-temp
robocopy .\digital-courses-temp .\digital-courses\backend /E /XF README.md
Remove-Item -Recurse -Force .\digital-courses-temp
```

- Composer pedindo confirmação durante instalação: use `-n` ou `--no-interaction`.
- CORS/Sanctum: ajustar `config/cors.php` e `config/sanctum.php` com o origin do frontend (ex.: `http://localhost:3000`).

## Scripts úteis

- `php artisan migrate`
- `php artisan db:seed`
- `php artisan test`

> O frontend Next.js terá seus próprios scripts (`npm run dev`, `npm run build`, etc.) dentro da pasta `frontend/` assim que for criado.

## Frontend (Next.js) – organização

1. Entre na pasta `frontend/` e inicialize o projeto (ex.: `npx create-next-app@latest .`).
2. Mantenha o servidor dev na porta 3000 (já exposta no `docker-compose`).
3. Utilize variáveis de ambiente dedicadas (`frontend/.env.local`) para configurar a URL do backend (`http://localhost:8000`).
4. O serviço `frontend` no `docker-compose` monta essa pasta automaticamente; se `package.json` não existir o container apenas ficará em espera.

> Não instalei o Next.js por você para manter o repositório limpo, mas toda a estrutura e containers já estão preparados.

## Estrutura do repositório

- `backend/` — contém todo o projeto Laravel (app, bootstrap, config, routes, docker configs etc.)
- `frontend/` — pasta reservada para o app React/Next.js; inicialize com `npx create-next-app frontend` quando estiver pronto
- `Dockerfile`, `docker-compose.yml`, `docker-init.bat` — orquestram backend e frontend via containers

## Contato / responsáveis

- Dono do repositório / responsável: <nome/email>
- Canal de comunicação: Slack / Teams / etc.

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

Coloque abaixo informações adicionais do projeto (variáveis `.env` obrigatórias, endpoints importantes e decisões sobre o app em `frontend/`).

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
