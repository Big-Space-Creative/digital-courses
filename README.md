# digital-courses

Monorepo com backend Laravel em `backend/` e frontend Next.js em `frontend/`.

---

## Requisitos

### Backend (Laravel API)
- PHP 8.2+
- Composer

### Frontend (Next.js)
- Node.js 20+
- npm ou pnpm

### Setup Docker (recomendado)
- Docker Desktop
- Docker Compose

---

## Setup com Docker

Este projeto inclui configuração Docker completa (PHP-FPM, Nginx, PostgreSQL, Redis, MinIO e pgAdmin).

```powershell
# 1. Copiar arquivo de ambiente
Copy-Item backend\.env.example backend\.env

# 2. Subir os containers
docker compose up -d --build

# 3. Gerar chave da aplicação e rodar migrations
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

**Serviços disponíveis:**

| Serviço    | URL                                    |
|------------|----------------------------------------|
| API        | http://localhost:8000                  |
| Swagger UI | http://localhost:8000/api/documentation |
| Frontend   | http://localhost:3000                  |
| pgAdmin    | http://localhost:8080                  |
| PostgreSQL | localhost:5432                         |
| MinIO API  | http://localhost:9000                  |
| MinIO Console | http://localhost:9001               |
| Redis      | localhost:6379                         |

**Comandos úteis Docker:**

```powershell
docker compose up -d                       # Iniciar containers
docker compose down                        # Parar containers
docker compose logs -f app                 # Ver logs
docker compose exec app bash               # Acessar container
docker compose exec app php artisan migrate
docker compose exec app php artisan test
```

---

## Setup local (sem Docker)

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan jwt:secret          # gera JWT_SECRET no .env
php artisan migrate
php artisan serve --port=8000
```

---

## 📄 Documentação Swagger / OpenAPI

A API possui documentação interativa gerada automaticamente via **L5-Swagger** (swagger-php v6).

### Acessar

| URL | Descrição |
|-----|-----------|
| http://localhost:8000/api/documentation | Swagger UI — interface interativa |
| http://localhost:8000/docs              | JSON da spec OpenAPI 3.0          |

### Autenticar no Swagger UI

1. Faça o login via `POST /api/v1/login` dentro do Swagger UI
2. Copie o `access_token` retornado
3. Clique em **Authorize** (cadeado 🔒) no topo da página
4. Cole o token no campo **Value** (sem prefixo — o tipo `bearer` já está configurado)
5. Clique em **Authorize** → **Close**

A partir daí, todos os endpoints protegidos serão autenticados automaticamente.

### Regenerar a spec manualmente

```powershell
docker compose exec app php artisan l5-swagger:generate
```

> Em ambiente de desenvolvimento, a spec é **regerada automaticamente** a cada requisição com `L5_SWAGGER_GENERATE_ALWAYS=true`.

### Variáveis de ambiente relevantes

```env
L5_SWAGGER_GENERATE_ALWAYS=true          # Regenera automaticamente (dev)
L5_SWAGGER_CONST_HOST=http://localhost:8000  # URL base exibida na spec
L5_SWAGGER_BASE_PATH=/api/v1             # Prefixo das rotas
SWAGGER_ENABLED=true                     # Habilita a UI (false bloqueia em produção)
```

### Nota sobre swagger-php v6 e anotações @OA\

O projeto usa **swagger-php v6**, que por padrão escaneia apenas **PHP Attributes** (`#[OA\...]`).
Para que os docblocks `/** @OA\ */` nos controllers sejam reconhecidos, a dependência `doctrine/annotations` deve estar instalada (já está declarada em `composer.json`). Se o Swagger não gerar corretamente, verifique:

```powershell
# Dentro do container
docker compose exec app composer show doctrine/annotations
# Se não estiver instalado:
docker compose exec app composer require doctrine/annotations:^2.0
```

---

## 📡 Referência da API

Base URL: `http://localhost:8000/api/v1`

Todas as requisições autenticadas exigem o header:
```
Authorization: Bearer <access_token>
```

---

## 🔑 Auth — Autenticação JWT

### POST `/register` — Registrar novo usuário

**Body (JSON)**

```json
{
  "name": "Alice Silva",
  "email": "alice@example.com",
  "password": "Password123",
  "password_confirmation": "Password123",
  "role": "student"
}
```

> `role` aceita: `student`, `instructor`, `admin`. Campo `avatar_url` é opcional (URL válida).

**Response (201)**

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Silva",
      "email": "alice@example.com",
      "role": "student",
      "avatar_url": "",
      "created_at": "2026-01-01T00:00:00.000000Z"
    },
    "access_token": "<JWT>",
    "refresh_token": "<JWT_refresh>",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

### POST `/login` — Login

**Body (JSON)**

```json
{
  "email": "alice@example.com",
  "password": "Password123"
}
```

**Response (200)**

```json
{
  "success": true,
  "message": "Login bem-sucedido",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Silva",
      "email": "alice@example.com",
      "email_verified_at": null,
      "role": "student",
      "subscription_type": "free",
      "avatar_url": "",
      "deleted_at": null,
      "created_at": "2026-01-01T00:00:00.000000Z",
      "updated_at": "2026-01-01T00:00:00.000000Z"
    },
    "access_token": "<JWT>",
    "refresh_token": "<JWT_refresh>",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

### GET `/me` — Perfil do usuário autenticado

**Headers:** `Authorization: Bearer <access_token>`

**Response (200)**

```json
{
  "message": "Usuário autenticado",
  "user": {
    "id": 1,
    "name": "Alice Silva",
    "email": "alice@example.com",
    "email_verified_at": null,
    "role": "student",
    "subscription_type": "free",
    "avatar_url": "",
    "deleted_at": null,
    "created_at": "2026-01-01T00:00:00.000000Z",
    "updated_at": "2026-01-01T00:00:00.000000Z"
  }
}
```

---

### POST `/me` — Atualizar perfil

> **Observação:** O e-mail **não** pode ser alterado por este endpoint. Campos disponíveis: `name`, `avatar_url`, `password`.

**Headers:** `Authorization: Bearer <access_token>`

**Body (JSON)** — todos os campos são opcionais:

```json
{
  "name": "Novo Nome",
  "avatar_url": "https://cdn.example.com/avatar.jpg",
  "password": "NovaSenha123",
  "password_confirmation": "NovaSenha123"
}
```

**Response (200)**

```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "user": {
    "id": 1,
    "name": "Novo Nome",
    "email": "alice@example.com",
    "role": "student",
    "subscription_type": "free",
    "avatar_url": "https://cdn.example.com/avatar.jpg"
  }
}
```

---

### POST `/logout` — Logout

**Headers:** `Authorization: Bearer <access_token>`

**Response (200)**

```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

---

### POST `/refresh` — Renovar access token

> Envie o `refresh_token` (obtido no login/register) no header `Authorization` ou no body.

**Headers:** `Authorization: Bearer <refresh_token>`

**Ou Body (JSON):**
```json
{ "refresh_token": "<refresh_token>" }
```

**Response (200)**

```json
{
  "success": true,
  "message": "Token renovado com sucesso",
  "data": {
    "access_token": "<novo_JWT>",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

## 👤 Usuários

### GET `/users` — Listar usuários _(requer: admin)_

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200)**

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student",
    "subscription_type": "free",
    "avatar_url": ""
  }
]
```

---

### PUT `/users/{id}` — Atualizar usuário _(requer: admin)_

**Headers:** `Authorization: Bearer <admin_token>`

**Body (JSON)** — campos opcionais:

```json
{
  "name": "Novo Nome",
  "email": "novo@example.com",
  "role": "instructor"
}
```

**Response (200)**

```json
{
  "message": "Usuário atualizado com sucesso.",
  "user": {
    "id": 1,
    "name": "Novo Nome",
    "email": "novo@example.com",
    "role": "instructor"
  }
}
```

---

## 📚 Cursos

### GET `/courses` — Listar ementa de cursos

**Headers:** `Authorization: Bearer <token>`

Retorna todos os cursos publicados com seus módulos e aulas (sem `video_url`). Use para montar a vitrine/sidebar.

**Response (200)**

```json
{
  "message": "Cursos listados com sucesso",
  "data": [
    {
      "id": 1,
      "title": "Violão do Zero",
      "slug": "violao-do-zero",
      "description": "...",
      "price": "49.90",
      "thumbnail": "https://...",
      "is_published": true,
      "modules": [
        {
          "id": 1,
          "title": "Fundamentos",
          "order": 1,
          "lessons": [
            {
              "id": 1,
              "title": "Introdução ao violão",
              "description": "...",
              "duration_in_minutes": 15,
              "is_free_preview": true
            }
          ]
        }
      ]
    }
  ]
}
```

---

### GET `/courses/{id}` — Detalhe de um curso

**Headers:** `Authorization: Bearer <token>`

**Response (200)**

```json
{
  "message": "Curso encontrado",
  "data": { ...curso com módulos e aulas... }
}
```

---

### POST `/courses` — Criar curso _(requer: admin)_

**Headers:** `Authorization: Bearer <admin_token>`

**Body (JSON)**

```json
{
  "title": "Violão do Zero",
  "description": "Aprenda violão desde o início.",
  "price": 49.90,
  "thumbnail": "https://cdn.example.com/thumb.jpg",
  "is_published": false
}
```

> `title` é **obrigatório**. O `slug` é gerado automaticamente a partir do título.

**Response (201)**

```json
{
  "message": "Curso criado com sucesso",
  "data": {
    "id": 1,
    "title": "Violão do Zero",
    "slug": "violao-do-zero",
    "description": "Aprenda violão desde o início.",
    "price": "49.90",
    "thumbnail": "https://cdn.example.com/thumb.jpg",
    "is_published": false,
    "created_at": "2026-01-01T00:00:00.000000Z",
    "updated_at": "2026-01-01T00:00:00.000000Z"
  }
}
```

---

### PUT `/courses/{id}` — Editar curso _(requer: admin)_

**Headers:** `Authorization: Bearer <admin_token>`

**Body (JSON)** — todos opcionais:

```json
{
  "title": "Violão Avançado",
  "description": "Nova descrição",
  "price": 99.90,
  "thumbnail": "https://...",
  "is_published": true
}
```

**Response (200)**

```json
{
  "message": "Curso atualizado com sucesso",
  "data": { ...curso atualizado... }
}
```

---

### DELETE `/courses/{id}` — Excluir curso _(requer: admin)_

> Usa **soft delete** — o registro fica na base com `deleted_at` preenchido.

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200)**

```json
{ "message": "Curso excluído com sucesso" }
```

---

## 🗂️ Módulos _(requer: admin ou instructor)_

### POST `/courses/{course_id}/modules`

**Body (JSON)**

```json
{
  "title": "Fundamentos",
  "description": "Módulo introdutório",
  "order": 1
}
```

**Response (201)**

```json
{
  "message": "Módulo criado com sucesso",
  "data": { ...módulo... }
}
```

---

### PUT `/courses/{course_id}/modules/{module_id}`

**Body (JSON)** — campos opcionais:

```json
{
  "title": "Fundamentos Revisados",
  "order": 2
}
```

**Response (200)**

```json
{
  "message": "Módulo atualizado com sucesso",
  "data": { ...módulo... }
}
```

---

### DELETE `/courses/{course_id}/modules/{module_id}`

**Response (200)**

```json
{ "message": "Módulo excluído com sucesso" }
```

---

## 🎥 Aulas

### GET `/lessons/{lesson_id}` — Visualizar aula e vídeo

**Headers:** `Authorization: Bearer <token>`

**Regras de acesso:**
- `admin` ou `instructor`: acesso total sempre
- `student premium`: acesso a qualquer aula
- `student free`: apenas aulas com `is_free_preview: true`
- Sem autenticação ou student free tentando aula paga → **403 Forbidden**

**Response (200)**

```json
{
  "message": "Aula encontrada",
  "data": {
    "id": 1,
    "module_id": 1,
    "title": "Introdução ao violão",
    "description": "...",
    "video_url": "https://minio.example.com/courses/lesson-1.mp4",
    "duration_in_minutes": 15,
    "is_free_preview": true
  }
}
```

**Response (403)** — quando acesso negado:

```json
{ "message": "Acesso negado. Esta aula é exclusiva para assinantes Premium." }
```

---

### POST `/modules/{module_id}/lessons` — Criar aula _(requer: admin ou instructor)_

**Body (JSON)**

```json
{
  "title": "Introdução ao violão",
  "description": "Aula inaugural do curso.",
  "video_url": "https://minio.example.com/courses/lesson-1.mp4",
  "duration_in_minutes": 15,
  "is_free_preview": false
}
```

> `title` é **obrigatório**. `video_url` deve ser uma URL válida apontando para o MinIO.

**Response (201)**

```json
{
  "message": "Aula criada com sucesso",
  "data": { ...aula... }
}
```

---

### POST `/modules/{module_id}/lessons/upload` — Criar aula + upload único no MinIO _(requer: admin ou instructor)_

Endpoint para a tela de criação de lesson do frontend: cria a aula e faz upload do vídeo + materiais em uma única requisição.

**Content-Type:** `multipart/form-data`

**Campos:**

- `title` (string, obrigatório)
- `description` (string, opcional)
- `duration_in_minutes` (int, opcional)
- `is_free_preview` (boolean, opcional)
- `video_file` (file, obrigatório; mp4,mov,avi,mkv,webm)
- `materials[]` (files, opcional; pdf,jpg,jpeg,png,webp,gif,mp4,mov,avi,mkv,webm)
- `material_titles[]` (strings, opcional; mesmo índice de `materials[]`)

**Regras de persistência:**

- Upload no MinIO via disco `s3`
- `lessons.video_url` salvo com URL pública do vídeo
- `materials.file_path` salvo com URL pública de cada material
- `materials.type` classificado em `pdf`, `image`, `video` ou `file`
- Operação transacional: em erro, rollback no banco + tentativa de limpeza dos arquivos no MinIO

**Response (201)**

```json
{
  "message": "Aula criada com upload de vídeo e materiais no MinIO com sucesso",
  "data": {
    "id": 12,
    "module_id": 5,
    "title": "Aula 01 - Introdução",
    "video_url": "http://localhost:9000/courses/.../video.mp4",
    "materials": [
      {
        "id": 31,
        "lesson_id": 12,
        "title": "Slides Aula 01",
        "file_path": "http://localhost:9000/courses/.../slides.pdf",
        "type": "pdf"
      }
    ]
  }
}
```

---

### POST `/lessons/{lesson_id}/materials/upload` — Upload de material avulso _(requer: admin ou instructor)_

Endpoint para anexar material em uma aula já existente.

**Content-Type:** `multipart/form-data`

**Campos:**

- `title` (string, obrigatório)
- `file` (file, obrigatório; pdf,jpg,jpeg,png,webp,gif,mp4,mov,avi,mkv,webm)

**Response (201)**

```json
{
  "message": "Material enviado com sucesso",
  "data": {
    "id": 45,
    "lesson_id": 12,
    "title": "Resumo da Aula",
    "file_path": "http://localhost:9000/courses/.../resumo.pdf",
    "type": "pdf"
  }
}
```

---

### PUT `/lessons/{lesson_id}` — Editar aula _(requer: admin ou instructor)_

**Body (JSON)** — campos opcionais:

```json
{
  "title": "Novo Título",
  "video_url": "https://...",
  "is_free_preview": true,
  "duration_in_minutes": 20
}
```

**Response (200)**

```json
{
  "message": "Aula atualizada com sucesso",
  "data": { ...aula... }
}
```

---

### DELETE `/lessons/{lesson_id}` — Excluir aula _(requer: admin ou instructor)_

**Response (200)**

```json
{ "message": "Aula excluída com sucesso" }
```

---

## 🔐 Painel Administrativo — `/admin`

> Todos os endpoints abaixo exigem `Authorization: Bearer <token>` de um usuário com `role: admin`.

---

### GET `/admin/dashboard` — Métricas gerais

**Response (200)**

```json
{
  "success": true,
  "message": "Dashboard carregado com sucesso",
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

**Query params opcionais:**

| Param      | Exemplo   | Descrição                             |
|------------|-----------|---------------------------------------|
| `role`     | `student` | Filtra por role (student/instructor/admin) |
| `search`   | `alice`   | Busca por nome ou e-mail              |
| `per_page` | `20`      | Itens por página (padrão: 20)         |

**Response (200):** Paginação Laravel com array de usuários.

---

### GET `/admin/users/{id}` — Detalhe de usuário

**Response (200):** Dados completos do usuário + cursos matriculados.

---

### PATCH `/admin/users/{id}/role` — Alterar role

> Um admin **não pode** alterar a própria role.

**Body (JSON)**

```json
{ "role": "instructor" }
```

Valores aceitos: `student`, `instructor`, `admin`

**Response (200)**

```json
{
  "success": true,
  "message": "Role do usuário atualizada de 'student' para 'instructor' com sucesso.",
  "data": { "id": 2, "name": "Bob", "email": "bob@example.com", "role": "instructor" }
}
```

---

### PATCH `/admin/users/{id}/subscription` — Alterar plano do aluno

> Só funciona para usuários com `role: student`.

**Body (JSON)**

```json
{ "subscription_type": "premium" }
```

Valores aceitos: `free`, `premium`

**Response (200)**

```json
{
  "success": true,
  "message": "Plano do aluno atualizado para 'premium' com sucesso.",
  "data": { "id": 3, "name": "Carol", "email": "carol@example.com", "subscription_type": "premium" }
}
```

---

### GET `/admin/courses` — Listar cursos (admin)

Retorna **todos** os cursos, inclusive rascunhos.

**Query params opcionais:**

| Param          | Exemplo  | Descrição                        |
|----------------|----------|----------------------------------|
| `search`       | `violão` | Busca no título ou descrição     |
| `is_published` | `true`   | Filtra por status de publicação  |
| `per_page`     | `20`     | Itens por página (padrão: 20)    |

**Response (200):** Paginação com `enrollments_count` e `lessons_count` em cada curso.

---

### GET `/admin/courses/{id}` — Detalhe de curso (admin)

**Response (200):** Curso completo com módulos, aulas e lista de alunos matriculados.

---

## 📋 Planos de estudantes (free vs premium)

- Usuários com `role: student` possuem `subscription_type` (`free` ou `premium`).
- **Student premium**: acesso a todas as aulas.
- **Student free**: acesso apenas às aulas com `is_free_preview: true`.
- **Instructor/Admin**: acesso irrestrito, independente do subscription.

### Configurar via Tinker

```powershell
docker compose exec app php artisan tinker
>>> $user = \App\Models\User::find(1);
>>> $user->subscription_type = 'premium';
>>> $user->save();
```

```powershell
>>> $lesson = \App\Models\Lesson::find(10);
>>> $lesson->is_free_preview = true;
>>> $lesson->save();
```

A lógica está em `app/Http/Controllers/Api/v1/LessonController.php` e coberta pelo teste `UserLessonAccessTest`.

---

## 🗺️ Mapa completo de rotas

| Método | Endpoint | Acesso | Controller |
|--------|----------|--------|------------|
| `POST` | `/api/v1/register` | Público | `AuthController@register` |
| `POST` | `/api/v1/login` | Público | `AuthController@login` |
| `GET`  | `/api/v1/me` | Autenticado | `AuthController@me` |
| `POST` | `/api/v1/me` | Autenticado | `AuthController@updateProfile` |
| `POST` | `/api/v1/logout` | Autenticado | `AuthController@logout` |
| `POST` | `/api/v1/refresh` | Autenticado | `AuthController@refresh` |
| `GET`  | `/api/v1/users` | Admin | `UserController@index` |
| `PUT`  | `/api/v1/users/{id}` | Admin | `UserController@update` |
| `GET`  | `/api/v1/courses` | Autenticado | `CourseController@index` |
| `GET`  | `/api/v1/courses/{id}` | Autenticado | `CourseController@show` |
| `POST` | `/api/v1/courses` | Admin | `CourseController@store` |
| `PUT`  | `/api/v1/courses/{id}` | Admin | `CourseController@update` |
| `DELETE` | `/api/v1/courses/{id}` | Admin | `CourseController@destroy` |
| `POST` | `/api/v1/courses/{id}/modules` | Admin, Instructor | `ModuleController@store` |
| `PUT`  | `/api/v1/courses/{id}/modules/{mod}` | Admin, Instructor | `ModuleController@update` |
| `DELETE` | `/api/v1/courses/{id}/modules/{mod}` | Admin, Instructor | `ModuleController@destroy` |
| `GET`  | `/api/v1/lessons/{id}` | Autenticado* | `LessonController@show` |
| `POST` | `/api/v1/modules/{id}/lessons` | Admin, Instructor | `LessonController@store` |
| `POST` | `/api/v1/modules/{id}/lessons/upload` | Admin, Instructor | `LessonController@storeWithUpload` |
| `PUT`  | `/api/v1/lessons/{id}` | Admin, Instructor | `LessonController@update` |
| `DELETE` | `/api/v1/lessons/{id}` | Admin, Instructor | `LessonController@destroy` |
| `POST` | `/api/v1/lessons/{id}/materials/upload` | Admin, Instructor | `LessonController@uploadMaterial` |
| `GET`  | `/api/v1/admin/dashboard` | Admin | `AdminController@dashboard` |
| `GET`  | `/api/v1/admin/users` | Admin | `AdminController@listUsers` |
| `GET`  | `/api/v1/admin/users/{id}` | Admin | `AdminController@showUser` |
| `PATCH` | `/api/v1/admin/users/{id}/role` | Admin | `AdminController@updateUserRole` |
| `PATCH` | `/api/v1/admin/users/{id}/subscription` | Admin | `AdminController@updateUserSubscription` |
| `GET`  | `/api/v1/admin/courses` | Admin | `AdminController@listCourses` |
| `GET`  | `/api/v1/admin/courses/{id}` | Admin | `AdminController@showCourse` |

> \* `GET /lessons/{id}`: autenticado, mas o acesso à aula depende do plano (free/premium) e do flag `is_free_preview`.

---

## 🧪 Testes automatizados

```powershell
# Todos os testes
docker compose exec app php artisan test

# Filtrar por suíte
docker compose exec app php artisan test --filter=AuthEndpointsTest
docker compose exec app php artisan test --filter=UserLessonAccessTest
```

Arquivos de teste em `backend/tests/`:
- `AuthEndpointsTest.php` — registro, login, me
- `StatusEndpointTest.php` — health check
- `UserLessonAccessTest.php` — controle de acesso free/premium
- `ExampleTest.php` — teste padrão Laravel

---

## 🗄️ Estrutura do banco de dados

**Tabelas principais:**

| Tabela    | Colunas relevantes |
|-----------|--------------------|
| `users`   | `id`, `name`, `email`, `password`, `role` (student\|instructor\|admin), `subscription_type` (free\|premium), `avatar_url`, `deleted_at` |
| `courses` | `id`, `title`, `slug`, `description`, `price`, `thumbnail`, `is_published`, `published_at`, `deleted_at` |
| `modules` | `id`, `course_id`, `title`, `description`, `order` |
| `lessons` | `id`, `module_id`, `title`, `description`, `video_url`, `duration_in_minutes`, `is_free_preview` |
| `categories` | `id`, `name` |
| `enrollments` | `id`, `user_id`, `course_id`, `status` |

---

## 📁 Estrutura do repositório

```
digital-courses/
├── backend/          # Laravel 12 (PHP 8.2+)
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php        # login, register, me, logout, refresh, updateProfile
│   │   │   └── Api/v1/
│   │   │       ├── CourseController.php
│   │   │       ├── ModuleController.php
│   │   │       ├── LessonController.php
│   │   │       ├── AdminController.php
│   │   │       └── UserController.php
│   │   ├── Http/Middleware/
│   │   │   ├── IsAdmin.php               # alias: 'admin'
│   │   │   ├── CheckRole.php             # alias: 'role'
│   │   │   └── SwaggerAuth.php           # alias: 'swagger.auth'
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Course.php
│   │       ├── Module.php
│   │       └── Lesson.php
│   ├── routes/api.php                    # Todas as rotas API
│   ├── config/l5-swagger.php             # Configuração Swagger
│   └── database/migrations/              # 14 migrations
├── frontend/         # Next.js 16 + React 19 + Tailwind 4
├── docker-compose.yml
└── README.md
```

---

## Contato / responsáveis

- Responsável: Big Space Creative
- Repositório: Big-Space-Creative/digital-courses
