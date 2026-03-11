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

### Setup Docker

- Docker Desktop
- Docker Compose

Este projeto inclui configuração Docker completa (PHP-FPM, Nginx, PostgreSQL, Redis, MinIO e pgAdmin).

**Setup rápido (Windows):**

````powershell
# 1. Copiar arquivo de ambiente para o backend
Copy-Item .backend\.env.example .backend\.env

```powershell
# Executar script de inicialização (faz tudo automaticamente)
docker compose up -d --build
````

**Acessar aplicação:**

- API: http://localhost:8000
- **Swagger UI: http://localhost:8000/api/documentation** ← documentação interativa
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

### Testes automatizados

O pacote já inclui um teste de feature cobrindo registro, login e `GET /api/me`. Execute:

```powershell
php artisan test --filter=AuthEndpointsTest
```

## � Documentação Swagger / OpenAPI

A API possui documentação interativa gerada automaticamente via **L5-Swagger** (swagger-php v6 + Swagger UI v5).

### Acessar

| URL | Descrição |
|-----|-----------|
| http://localhost:8000/api/documentation | Swagger UI — interface interativa |
| http://localhost:8000/docs | JSON da spec OpenAPI 3.0 |

### Autenticar no Swagger UI

1. Faça login via `POST /api/v1/auth/login` dentro do próprio Swagger UI
2. Copie o `access_token` retornado
3. Clique em **Authorize** (cadeado 🔒) no topo da página
4. Cole o token no campo **Value**: `Bearer <seu_token>`
5. Clique em **Authorize** → **Close**

A partir daí, todos os endpoints protegidos serão autenticados automaticamente.

### Regenerar a spec manualmente

```powershell
docker exec digital-courses-app php artisan l5-swagger:generate
```

> Em ambiente de desenvolvimento, a spec é **regerada automaticamente** a cada requisição (`L5_SWAGGER_GENERATE_ALWAYS=true`).

### Variáveis de ambiente relevantes

```env
L5_SWAGGER_GENERATE_ALWAYS=true          # Regenera automaticamente (dev)
L5_SWAGGER_CONST_HOST=http://localhost:8000  # URL base exibida na spec
L5_SWAGGER_BASE_PATH=/api/v1            # Prefixo das rotas
```

---

## �📡 Guia rápido da API (para o frontend) / Fluxo manual rápido (cURL ou Postman)

Base URL (dev): `http://localhost:8000/api/v1`

### Autenticação (JWT)

- Após o login, use o token retornado no header:
  - `Authorization: Bearer <TOKEN_JWT>`

### POST `/register` — Registro

**Body (JSON)**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password123",
  "password_confirmation": "Password123",
  "role": "student",
  "avatar_url": ""
}
```

**Response (201)**

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": { "id", "name", "email", "role", "avatar_url", "created_at" },
    "token": "..."
  }
}
```

### POST `/login` — Login

**Body (JSON)**

```json
{
  "email": "alice@example.com",
  "password": "Password123"
}
```

**Response (200/201)**

```json
{
  "message": "Login bem-sucedido",
  "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url", "deleted_at", "created_at", "updated_at" },
  "token": "..."
}
```

### GET `/me` — Perfil autenticado

**Headers**

- `Authorization: Bearer <TOKEN_JWT>`

**Response (200/201)**

```json
{
  "message": "Usuário autenticado",
  "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url", "deleted_at", "created_at", "updated_at" }
}
```

### POST `/me` — Atualizar perfil

> **Observação:** o e-mail **não** pode ser alterado nesse endpoint. Apenas `name`, `phone` e `avatar_url`.

**Headers**

- `Authorization: Bearer <TOKEN_JWT>`

**Body (JSON)**

```json
{
  "name": "Novo Nome",
  "phone": "+55 11 99999-9999",
  "avatar_url": "https://imagem.com/foto.png"
}
```

**Response (201)**

```json
{
  "message": "Perfil atualizado com sucesso. Observação: o e-mail não pode ser alterado por este endpoint, apenas nome e número.",
  "user": { "id", "name", "email", "email_verified_at", "role", "subscription_type", "avatar_url", "deleted_at", "created_at", "updated_at" }
}
```

### POST `/logout` — Logout

**Headers**

- `Authorization: Bearer <TOKEN_JWT>`

**Response (200/201)**

```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

### POST `/refresh` — Refresh Token

> **Observação:** O token expirado pode ser usado aqui se estiver dentro do período de "refresh_ttl" (padrão de 2 semanas). O backend irá invalidar o token antigo e retornar um novo.

**Headers**

- `Authorization: Bearer <TOKEN_JWT_EXPIRADO_OU_VALIDO>`

**Response (200/201)**

```json
{
  "message": "Token refreshed successfully",
  "token": "eyJ0eXAiOiJKV1Qi..."
}
```

### GET `/users` — Listagem (admin)

**Headers**

- `Authorization: Bearer <TOKEN_JWT>`

**Response (200)**

```json
{
  "message": "Lista de usuários",
  "data": [
    { "id", "name", "email", "role", "subscription_type", "avatar_url", "created_at", "updated_at" }
  ]
}
```

### PUT `/users/{id}` — Atualização (admin)

**Headers**

- `Authorization: Bearer <TOKEN_JWT>`

**Body (JSON)**

```json
{
  "name": "Novo Nome",
  "email": "usuario@exemplo.com",
  "role": "student",
  "subscription_type": "premium",
  "avatar_url": "https://imagem.com/foto.png"
}
```

**Response (200)**

```json
{
  "message": "Usuário atualizado com sucesso",
  "data": {
    "user": { "id", "name", "email", "role", "subscription_type", "avatar_url", "created_at", "updated_at" }
  }
}
```

---

## 🔐 Painel Administrativo — `/api/v1/admin`

> Todas as rotas abaixo exigem:
>
> - `Authorization: Bearer <TOKEN_JWT>` de um usuário com `role: admin`
> - Caso contrário: `403 Forbidden`

### GET `/admin/dashboard` — Métricas gerais

**Response (200)**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 50,
      "students": 40,
      "instructors": 7,
      "admins": 3,
      "premium": 15,
      "free": 25
    },
    "courses": { "total": 12, "published": 9, "draft": 3 },
    "enrollments": { "total": 100, "active": 80 }
  }
}
```

---

### GET `/admin/users` — Listar usuários

**Query params opcionais**

| Param      | Exemplo   | Descrição                                          |
| ---------- | --------- | -------------------------------------------------- |
| `role`     | `student` | Filtra por role (`student`, `instructor`, `admin`) |
| `search`   | `alice`   | Busca por nome ou e-mail                           |
| `per_page` | `20`      | Itens por página (padrão: 20)                      |

**Response (200):** Paginação Laravel com array de usuários.

---

### GET `/admin/users/{id}` — Detalhe de usuário

**Response (200):** Dados completos do usuário + cursos nos quais está matriculado.

---

### PATCH `/admin/users/{id}/role` — Alterar role

**Body (JSON)**

```json
{ "role": "instructor" }
```

- Valores aceitos: `student`, `instructor`, `admin`
- Um admin não pode alterar a própria role

**Response (200)**

```json
{
  "success": true,
  "message": "Role do usuário atualizada de 'student' para 'instructor' com sucesso.",
  "data": { "id", "name", "email", "role" }
}
```

---

### PATCH `/admin/users/{id}/subscription` — Alterar plano do aluno

**Body (JSON)**

```json
{ "subscription_type": "premium" }
```

- Valores aceitos: `free`, `premium`
- Só funciona para usuários com `role: student`

**Response (200)**

```json
{
  "success": true,
  "message": "Plano do aluno atualizado para 'premium' com sucesso.",
  "data": { "id", "name", "email", "subscription_type" }
}
```

---

### GET `/admin/courses` — Listar cursos (admin)

Retorna **todos** os cursos, inclusive rascunhos não publicados.

**Query params opcionais**

| Param          | Exemplo  | Descrição                       |
| -------------- | -------- | ------------------------------- |
| `search`       | `violão` | Busca no título ou descrição    |
| `is_published` | `true`   | Filtra por status de publicação |
| `per_page`     | `20`     | Itens por página (padrão: 20)   |

**Response (200):** Paginação com `enrollments_count` e `lessons_count` incluídos em cada curso.

---

### GET `/admin/courses/{id}` — Detalhe de curso (admin)

**Response (200):** Curso completo com módulos, aulas e lista de alunos matriculados (id, name, email, subscription_type).

### 📚 Gestão de Cursos (Course Management)

#### GET `/courses` — Listar Ementa

- **Headers:** `Authorization: Bearer <TOKEN>`
- **Acesso:** Qualquer autenticado (estudantes, instrutores, admins).
- **Retorno:** Retorna os cursos ativos, com seus módulos e aulas integradas na mesma árvore JSON.
- **Nota Frontend:** Este endpoint **não** retorna o `video_url` por motivos de segurança. Use-o para montar a sidebar ou listagem visual do curso.

#### GET `/lessons/{lesson_id}` — Visualizar Aula e Vídeo

- **Headers:** `Authorization: Bearer <TOKEN>`
- **Acesso:** O Backend faz a checagem cruzada.
  - Se `role` for `admin` ou `instructor`, libera direto.
  - Se for estudante, só libera se a aula tiver `is_free_preview: true` OU o usuário possuir `subscription_type: 'premium'`.
  - Caso seja estudante Free tentando ver aula Premium, retorna erro HTTP `403 Forbidden`.
- **Retorno:** JSON com os dados completos da aula (`video_url`, materiais extras, etc).

#### Endpoints Administrativos (Criação e Edição)

- **POST/PUT/DELETE `/courses` e `/courses/{id}`:** Apenas `admin`.
- **POST/PUT/DELETE Módulos (`/courses/{course}/modules`):** `admin` e `instructor`.
- **POST/PUT/DELETE Aulas (`/modules/{module}/lessons`):** `admin` e `instructor`.
  - **Importante para o front de criação:** Ao criar/editar a aula, envie o campo booleano `is_free_preview` (`true`/`false`) para determinar se a aula será aberta ao público Free ou restrita aos assinantes Premium.

## Planos de estudantes (free vs premium)

- Todo usuário com `role = student` possui o campo `subscription_type` (`free` ou `premium`).
- Estudantes **premium** têm acesso a todas as aulas do catálogo.
- Estudantes **free** só visualizam aulas marcadas como prévia (`lessons.is_free_preview = true`).
- Instructors/Admins sempre podem ver tudo, independente desse campo.

### Como configurar

1. Defina o plano do estudante (exemplos):

```powershell
php artisan tinker
>>> $user = \App\Models\User::find(1);
>>> $user->subscription_type = 'premium';
>>> $user->save();
```

2. Marque as aulas liberadas para contas free:

```powershell
php artisan tinker
>>> $lesson = \App\Models\Lesson::find(10);
>>> $lesson->is_free_preview = true;
>>> $lesson->save();
```

A lógica de negócio está centralizada em `User::canAccessLesson($lesson)` e coberta pelo teste `UserLessonAccessTest`.

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
    - Colunas extras: `role` (student|instructor|admin), `subscription_type` (free|premium), `avatar_url`, `deleted_at`
  - `password_reset_tokens`, `sessions`
  - `cache`, `cache_locks`
  - `jobs`, `job_batches`, `failed_jobs`
  - `categories` (id, name, timestamps) — criada em 2026-01-07
  - `lessons` inclui `is_free_preview` para liberar aulas a contas free

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
