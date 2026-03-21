# 🏗️ ARCHITECTURE - Arquitetura Técnica# 🏗️ Arquitetura do Projeto - Digital Courses (Backend)



## 📦 Stack Completo> Estrutura, padrões e convenções de código do projeto backend (Laravel 12).



| Layer | Tecnologia | Versão | Propósito |---

|-------|-----------|--------|----------|

| **Runtime** | PHP | 8.4 FPM | Linguagem |## 📋 Sumário

| **Framework** | Laravel | 12.x | Backend |

| **Database** | PostgreSQL | 16 | Persistence |- [Stack Tecnológico](#stack-tecnológico)

| **Cache** | Redis | Latest | Cache/Queue |- [Estrutura de Pastas](#estrutura-de-pastas)

| **Storage** | MinIO | Latest | S3-compatible |- [Convenções de Nomenclatura](#convenções-de-nomenclatura)

| **Auth** | JWT | 2.8 | Stateless auth |- [Modelos de Dados](#modelos-de-dados)

| **Docs** | Swagger/OpenAPI | 3.0.0 | API docs |- [Arquitetura de Controllers](#arquitetura-de-controllers)

| **Testing** | Pest | 3.8.5 | Tests |- [Autenticação & Autorização](#autenticação--autorização)

| **Quality** | Pint | 1.27.1 | PSR-12 |- [Roteamento & Versionamento](#roteamento--versionamento)

| **Container** | Docker Compose | 2.28+ | Orquestração |- [Documentação com Swagger](#documentação-com-swagger)



## 🗂️ Estrutura de Código---



```## Stack Tecnológico

app/Http/Controllers/Api/v1/

├── AuthController.php              (register, login, refresh)| Tecnologia     | Versão | Propósito              |

├── CourseController.php             (CRUD cursos)| -------------- | ------ | ---------------------- |

├── ModuleController.php             (CRUD módulos)| **PHP**        | 8.2+   | Linguagem base         |

├── LessonController.php             (CRUD aulas + MinIO)| **Laravel**    | 12.x   | Framework web          |

├── UserController.php               (perfil do usuário)| **PostgreSQL** | 14+    | Banco de dados         |

└── AdminController.php              (dashboard admin)| **JWT Auth**   | 2.8    | Autenticação stateless |

| **L5-Swagger** | 10.1   | Documentação OpenAPI   |

app/Http/Requests/| **Pest**       | 3.8    | Framework de testes    |

├── StoreModuleRequest.php           (validação: criar módulo)| **Docker**     | Latest | Containerização        |

├── UpdateModuleRequest.php          (validação: atualizar módulo)

├── StoreLessonRequest.php           (validação: criar aula + MinIO)### Scripts Disponíveis

└── UpdateLessonRequest.php          (validação: atualizar aula)

```bash

app/Http/Middleware/composer setup           # Setup inicial (install + migrate)

├── IsAdmin.php                      (role === admin)composer dev            # Inicia servidor Laravel (port 8000)

├── CheckRole.php                    (múltiplos roles)php artisan migrate     # Executa migrations

└── Cors.php                         (CORS headers)php artisan seed        # Executa seeders

php artisan tinker      # Shell interativo

app/Models/l5-swagger:generate     # Gera documentação Swagger

├── User.php                         (roles: student|instructor|admin)docker-compose up       # Inicia containers

├── Course.php                       (cursos com instructor_id)```

├── Module.php                       (módulos com order)

├── Lesson.php                       (aulas com minio_url)---

├── Enrollment.php                   (matrículas de usuários)

└── ...## Estrutura de Pastas



app/Services/```

└── MinIOUrlService.php              (validação segura de URLs)backend/

├── .agent/                      # 📁 Documentação interna do projeto

database/migrations/│   ├── architecture.md

└── 14 migrations (users → lessons)│   └── ...

│

tests/├── app/

├── Unit/ExampleTest.php│   ├── Console/

├── Unit/UserLessonAccessTest.php    (acesso por role)│   │   └── Commands/            # Comandos Artisan customizados

└── Feature/Api/│   │       └── DiagnoseCoursePost.php (exemplo)

    ├── AuthEndpointsTest.php│   │

    └── StatusEndpointTest.php│   ├── Http/

│   │   ├── Controllers/

routes/│   │   │   ├── AuthController.php         # Autenticação (login, register, refresh)

└── api.php                          (rotas versionadas /api/v1)│   │   │   ├── SwaggerInfo.php            # Info swagger geral

```│   │   │   └── Api/

│   │   │       └── v1/

## 🔗 Data Relationships│   │   │           ├── CourseController.php    # CRUD de cursos

│   │   │           ├── ModuleController.php    # CRUD de módulos

```│   │   │           ├── LessonController.php    # CRUD de aulas

User (1) ──► (Many) Course (as instructor)│   │   │           ├── UserController.php      # Info de usuário

User (1) ──► (Many) Enrollment│   │   │           └── AdminController.php     # Dashboard admin

Course (1) ──► (Many) Module│   │   │

Module (1) ──► (Many) Lesson│   │   ├── Requests/            # Form Request classes (validação)

Lesson (Many) ◄── (1) Module│   │   │   ├── StoreModuleRequest.php     # Validação create module

```│   │   │   ├── UpdateModuleRequest.php    # Validação update module

│   │   │   ├── StoreLessonRequest.php     # Validação create lesson (MinIO validated)

## 🔐 Autenticação & Segurança│   │   │   └── UpdateLessonRequest.php    # Validação update lesson

│   │   │

### JWT Flow│   │   └── Middleware/

1. POST /register ou /login → Token JWT│   │       ├── IsAdmin.php          # Verifica se role === 'admin'

2. Cliente armazena token│   │       ├── CheckRole.php         # Verifica múltiplas roles (role:admin,instructor)

3. Cada request: `Authorization: Bearer {token}`│   │       ├── SwaggerAuth.php       # Controle de acesso ao Swagger

4. Middleware `auth:api` valida│   │       └── Cors.php              # CORS configuration

5. TTL: 1 hora│   │

│   ├── Models/

### Roles & Permissions│   │   ├── User.php              # Usuário (student, instructor, admin)

```│   │   ├── Course.php            # Curso

student    → Lê conteúdo apenas│   │   ├── Module.php            # Módulo do curso

instructor → Cria cursos e aulas dos seus cursos│   │   ├── Lesson.php            # Aula/Lição

admin      → Acesso total│   │   ├── Material.php          # Material da aula

```│   │   ├── Enrollment.php        # Matrícula do usuário no curso

│   │   ├── CourseProgress.php    # Progresso do usuário no curso

### MinIO URL Validation│   │   ├── Comment.php           # Comentários em aulas

- Whitelist de domínios│   │   ├── Order.php             # Pedidos/Compras

- Whitelist de buckets│   │   └── Category.php          # Categorias de cursos

- HTTPS only│   │

- Sanitização de paths│   ├── Services/                 # Serviços de negócio

│   │   └── MinIOUrlService.php   # Validação segura de URLs MinIO

## 📊 14 Migrações│   │

│   └── Policies/                 # Autorização por modelo (ainda não usado)

```│

1. users              (id, name, email, password, role)├── bootstrap/

2. password_reset_tokens│   └── app.php                   # Configuração bootstrap (middleware, providers)

3. sessions│

4. courses            (id, title, description, instructor_id)├── config/

5. modules            (id, course_id, title, order)│   ├── app.php                   # Configurações gerais

6. lessons            (id, module_id, title, minio_url, is_free)│   ├── auth.php                  # Config de autenticação

7. lesson_content     (conteúdo complementar)│   ├── jwt.php                   # Config JWT Auth

8. user_lessons       (acesso controle: free/premium)│   ├── l5-swagger.php            # Config Swagger

9. failed_jobs│   ├── database.php              # Config banco de dados

10. access_logs│   └── ...

11. api_tokens│

12. jwt_secrets├── database/

13-14. Adicionais│   ├── migrations/               # Migrations do banco

```│   │   ├── create_users_table

│   │   ├── create_courses_table

## 🧪 Testes (9 total)│   │   ├── create_modules_table

│   │   ├── create_lessons_table

```│   │   ├── create_enrollments_table

Unit Tests:│   │   └── ...

✓ ExampleTest - Básico│   │

✓ UserLessonAccessTest - Acesso por role (free/premium)│   ├── factories/                # Model factories (testes)

│   │   └── UserFactory.php

Feature Tests:│   │

✓ AuthEndpointsTest - register, login, profile (3 testes)│   └── seeders/                  # Seeders (popular banco)

✓ StatusEndpointTest - endpoint de status (1 teste)│       └── DatabaseSeeder.php

```│

├── docker/

**Status:** ✅ 9/9 passando | 43 assertions | 1.02s│   ├── php/

│   │   ├── Dockerfile            # Dockerfile PHP

**Executar:**│   │   └── entrypoint.sh          # Script de inicialização

```bash│   │

docker-compose exec app php vendor/bin/pest│   └── postgres/

```│       └── Dockerfile            # Dockerfile PostgreSQL

│

## 🎨 Code Quality├── public/

│   ├── index.php                 # Entry point da aplicação

**Pint (PSR-12):**│   └── docs/                     # Swagger UI gerado

- 73 arquivos validados│

- 0 issues├── resources/

- Laravel preset│   └── views/                    # Views (pouco usado em API)

│

**Executar:**├── routes/

```bash│   ├── api.php                   # Rotas da API (versionadas em /api/v1)

docker-compose exec app php vendor/bin/pint --test│   ├── web.php                   # Rotas web (pouco usado)

```│   └── console.php               # Rotas de CLI

│

## 📖 Swagger/OpenAPI 3.0.0├── storage/

│   ├── api-docs/                 # Swagger spec gerado

**URL:** http://localhost:8000/api/documentation│   │   ├── api-docs.json         # OpenAPI spec

│   │   └── ...

Todos os 15+ endpoints documentados:│   │

- Descripção e parâmetros│   └── logs/                     # Logs da aplicação

- Exemplos de requisição/resposta│

- Try-it-out funcional├── tests/

- Autenticação Bearer token│   ├── Feature/                  # Testes de funcionalidade (HTTP)

│   ├── Unit/                     # Testes unitários

**Geração:**│   └── Pest.php                  # Configuração Pest

```bash│

docker-compose exec app php artisan l5-swagger:generate├── .env                          # Variáveis de ambiente (NÃO committar)

```├── .env.example                  # Template de .env

├── docker-compose.yml            # Definição dos containers

## 🐳 Docker Services├── composer.json                 # Dependências do projeto

├── phpunit.xml                   # Config testes

```└── artisan                        # CLI do Laravel

app        (Laravel FPM, port 9000)```

db         (PostgreSQL 16, port 5432)

nginx      (Reverse proxy, port 8000)---

redis      (Cache, port 6379)

minio      (S3 storage, port 9000/9001)## Convenções de Nomenclatura

pgadmin    (DB UI, port 8080)

```### Arquivos e Pastas



## 🔄 Request Flow| Tipo        | Convenção                | Exemplo                                      |

| ----------- | ------------------------ | -------------------------------------------- |

### Criar Aula (POST /lessons)| Controllers | PascalCase               | `CourseController.php`                       |

| Models      | PascalCase (singular)    | `User.php`, `Course.php`                     |

```| Migrations  | snake_case com timestamp | `2026_01_21_131235_create_courses_table.php` |

1. Client request com token| Seeders     | PascalCase               | `DatabaseSeeder.php`                         |

   ↓| Factories   | ModelFactory             | `UserFactory.php`                            |

2. Middleware auth:api → valida JWT| Traits      | PascalCase               | `HasRoles.php`                               |

   ↓| Commands    | kebab-case               | `diagnose:course-post`                       |

3. Middleware CheckRole:admin,instructor → valida role| Middleware  | PascalCase               | `IsAdmin.php`                                |

   ↓| Config      | snake_case               | `jwt.php`, `l5-swagger.php`                  |

4. LessonController@store()

   ↓### Dentro do Código

5. StoreLessonRequest::rules()

   - module_id: exists:modules,id| Contexto                 | Convenção            | Exemplo                              |

   - title: string, max:255| ------------------------ | -------------------- | ------------------------------------ |

   - minio_url: url, MinIOUrlValidation ← CUSTOM| Classes                  | PascalCase           | `class CourseController`             |

   ↓| Métodos                  | camelCase            | `public function storeAction()`      |

6. MinIOUrlService::validateUrl()| Propriedades             | camelCase            | `protected $fillable = [...]`        |

   - Domínio whitelist? ✓| Constantes (classe)      | SCREAMING_SNAKE_CASE | `const ROLE_ADMIN = 'admin'`         |

   - Bucket whitelist? ✓| Variáveis locais         | camelCase            | `$courseData`, `$isPublished`        |

   - Protocolo HTTPS? ✓| Parâmetros de rota       | snake_case           | `/courses/{course_id}`               |

   ↓| JSON (request/response)  | snake_case           | `"is_published"`, `"created_at"`     |

7. Lesson::create($validated)| Enums/Constantes globais | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |

   ↓

8. Response 201 + JSON### Padrões Específicos

```

**Models:**

## 📝 Controllers - Pattern

```php

Cada controller segue RESTful:class User extends Authenticatable

{

```php    public const ROLE_STUDENT = 'student';

class XxxController extends Controller    public const ROLE_INSTRUCTOR = 'instructor';

{    public const ROLE_ADMIN = 'admin';

    // GET /resource

    public function index() { ... }    public const SUBSCRIPTION_FREE = 'free';

        public const SUBSCRIPTION_PREMIUM = 'premium';

    // GET /resource/{id}}

    public function show($id) { ... }```

    

    // POST /resource**Controllers (API):**

    public function store(Request $r) { ... }

    ```php

    // PUT /resource/{id}class CourseController extends Controller

    public function update($id, Request $r) { ... }{

        public function index()           // Listar

    // DELETE /resource/{id}    public function show($id)         // Detalhar

    public function destroy($id) { ... }    public function store(Request $r) // Criar

}    public function update($id, $r)   // Atualizar

```    public function destroy($id)      // Deletar

}

## 🔐 Middleware Stack```



```**Middleware:**

auth:api              → Valida JWT token

admin                 → role === 'admin'- `IsAdmin.php` - Valida se usuário é admin

role:admin,instructor → role IN ('admin', 'instructor')- `CheckRole.php` - Valida múltiplos papéis

cors                  → Headers CORS- `SwaggerAuth.php` - Controle de acesso ao Swagger

```

---

## 📋 O Que Falta (Roadmap)

## Modelos de Dados

1. **Iteração 2:** setup.ps1 - Automação de setup

2. **Iteração 3:** GitHub Actions - CI/CD### Entity Relationship Diagram (ERD)

3. **Iteração 4:** Exemplos - cURL, Postman, JS, Python

4. **Iteração 5:** Seeders - Dados de teste```

5. **Iteração 6-8:** Logging, Health Check, UI AuthUser

6. **Iteração 9-10:** Produção (.env.prod, Docker.prod)├── id (PK)

├── name

## ✅ Checklist para Nova Feature├── email (UNIQUE)

├── password

- [ ] Endpoint versionado (`/api/v1/`)?├── role (student|instructor|admin)

- [ ] Validação com Form Request?├── subscription_type (free|premium)

- [ ] Middleware auth/roles aplicado?├── avatar_url

- [ ] Testes escritos?├── email_verified_at

- [ ] Documentado com Swagger annotations?├── deleted_at (soft delete)

- [ ] HTTP status code correto?└── timestamps

- [ ] Response segue padrão JSON?

- [ ] Erros tratados?Course

- [ ] MinIO URL validado (se necessário)?├── id (PK)

├── title
├── slug (UNIQUE)
├── description
├── price (decimal)
├── thumbnail
├── is_published (boolean)
├── published_at
├── deleted_at (soft delete)
└── timestamps

Module
├── id (PK)
├── course_id (FK)
├── title
├── description
├── order (sequência)
└── timestamps

Lesson
├── id (PK)
├── module_id (FK)
├── title
├── description
├── video_url
├── duration_in_minutes
├── is_free_preview (boolean)
├── deleted_at (soft delete)
└── timestamps

Enrollment
├── id (PK)
├── user_id (FK)
├── course_id (FK)
├── order_id (FK nullable)
├── status (active|expired|completed)
├── expires_at
└── timestamps
```

### Relacionamentos Principais

- **User → Enrollment**: Um usuário pode ter múltiplas matrículas
- **Course → Enrollment**: Um curso pode ter múltiplas matrículas
- **Course → Module**: Um curso tem múltiplos módulos
- **Module → Lesson**: Um módulo tem múltiplas aulas
- **Lesson → Material**: Uma aula pode ter múltiplos materiais
- **User → Order**: Um usuário tem múltiplos pedidos

### Soft Deletes (Exclusão Lógica)

Os modelos `User`, `Course`, e `Lesson` usam soft delete:

- Possui coluna `deleted_at` (nullable timestamp)
- Não são removidos do banco, apenas marcados como deletados
- Consultas automáticas excluem registros com `deleted_at` preenchido

---

## Arquitetura de Controllers

---

## Arquitetura de Controllers

### Estrutura de um Controller API

```php
<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    // ✅ GET - Listar todos (public)
    public function index(): JsonResponse
    {
        $courses = Course::with('modules.lessons')->get();
        return response()->json([
            'message' => 'Cursos listados com sucesso',
            'data' => $courses,
        ]);
    }

    // ✅ GET - Detalhar um (public)
    public function show($id): JsonResponse
    {
        $course = Course::with('modules.lessons')->findOrFail($id);
        return response()->json([
            'message' => 'Curso encontrado',
            'data' => $course,
        ]);
    }

    // ✅ POST - Criar novo (admin only)
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'thumbnail' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $course = Course::create($validated);
        return response()->json([
            'message' => 'Curso criado com sucesso',
            'data' => $course,
        ], 201);
    }

    // ✅ PUT - Atualizar (admin only)
    public function update($id, Request $request): JsonResponse
    {
        $course = Course::findOrFail($id);
        $course->update($request->validate([...]));
        return response()->json([
            'message' => 'Curso atualizado com sucesso',
            'data' => $course,
        ]);
    }

    // ✅ DELETE - Deletar (admin only)
    public function destroy($id): JsonResponse
    {
        Course::findOrFail($id)->delete();
        return response()->json([
            'message' => 'Curso deletado com sucesso',
        ]);
    }
}
```

### Padrões de Response

**Sucesso (200/201):**

```json
{
  "message": "Descrição amigável da operação",
  "data": {
    /* dados retornados */
  }
}
```

**Erro (400/422/403/404/500):**

```json
{
  "message": "Descrição do erro",
  "errors": {
    /* detalhes de validação se houver */
  }
}
```

---

## Autenticação & Autorização

### Autenticação com JWT

**Flow:**

1. Usuário faz login com email + password
2. Sistema valida credenciais
3. Retorna `access_token` (JWT) + `refresh_token`
4. Cliente envia token no header: `Authorization: Bearer {token}`
5. Middleware `auth:api` valida o token

**Token JWT contém:**

```php
[
    'sub' => $user->id,              // Subject (user ID)
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role,           // Papé: student|instructor|admin
    'iat' => now()->timestamp,       // Issued at
    'exp' => now()->addHour()->timestamp, // Expira em 1 hora
]
```

**Config**: `config/jwt.php`

### Autorização (Roles & Permissions)

**Middleware de Roles:**

| Middleware              | Uso                             | Exemplo                                      |
| ----------------------- | ------------------------------- | -------------------------------------------- |
| `auth:api`              | Valida JWT token                | Requerido em toda requisição autenticada     |
| `admin`                 | role === 'admin'                | `Route::middleware('admin')->group(...)`     |
| `role:admin,instructor` | role IN ('admin', 'instructor') | `Route::middleware('role:admin,instructor')` |

**Estrutura de Rotas com Autorização:**

```php
Route::middleware('auth:api')->group(function() {
    // Públicas (autenticadas)
    Route::get('/courses', ...);

    // Apenas Admin
    Route::middleware('admin')->group(function() {
        Route::post('/courses', ...);        // Criar
        Route::put('/courses/{id}', ...);    // Editar
        Route::delete('/courses/{id}', ...); // Deletar
    });

    // Admin ou Instrutor
    Route::middleware('role:admin,instructor')->group(function() {
        Route::post('/courses/{id}/modules', ...);
    });
});
```

**Roles Disponíveis:**

- `student` - Aluno (apenas consome cursos)
- `instructor` - Instrutor (cria e gerencia conteúdo)
- `admin` - Administrador (acesso total)

---

## Roteamento & Versionamento

### Versionamento de API

Todas as rotas da API estão versionadas em `/api/v1/`:

```
GET    /api/v1/courses              # Listar
GET    /api/v1/courses/{id}         # Detalhar
POST   /api/v1/courses              # Criar (admin)
PUT    /api/v1/courses/{id}         # Editar (admin)
DELETE /api/v1/courses/{id}         # Deletar (admin)

POST   /api/v1/auth/register        # Registrar
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/logout          # Logout (autenticado)
POST   /api/v1/auth/refresh         # Renovar token (autenticado)
GET    /api/v1/auth/me              # Dados do usuário logado (autenticado)
POST   /api/v1/auth/me              # Editar perfil (autenticado)
```

### Estrutura de Rotas

Arquivo: `routes/api.php`

```php
// Root endpoint (info da API)
GET /api/

// Versionado em /api/v1/
Route::prefix('v1')->group(function() {
    // Auth (públicas)
    Route::controller(AuthController::class)->group(function() {
        Route::post('/register', 'register');
        Route::post('/login', 'login');

        // Autenticadas
        Route::middleware('auth:api')->group(function() {
            Route::get('/me', 'me');
            Route::post('/me', 'updateProfile');
            Route::post('/logout', 'logout');
            Route::post('/refresh', 'refresh');
        });
    });

    // Courses (públicas + restrições)
    Route::middleware('auth:api')->group(function() {
        Route::get('/courses', [CourseController::class, 'index']);
        Route::get('/courses/{course}', [CourseController::class, 'show']);

        Route::middleware('admin')->group(function() {
            Route::post('/courses', [CourseController::class, 'store']);
            Route::put('/courses/{course}', [CourseController::class, 'update']);
            Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        });
    });
});
```

---

## Documentação com Swagger

### OpenAPI Spec

A API é documentada com **Swagger/OpenAPI 3.0** usando annotations:

**Instalação:**

```bash
composer require darkaonline/l5-swagger doctrine/annotations
php artisan l5-swagger:generate
```

**Acessar:**

- Documentação UI: http://localhost:8000/api/documentation
- JSON Spec: http://localhost:8000/docs

### Annotations no Controller

```php
class CourseController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/courses",
     *     operationId="courseIndex",
     *     tags={"Cursos"},
     *     summary="Listar cursos",
     *     description="Retorna todos os cursos com módulos e aulas",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Cursos listados")
     * )
     */
    public function index() { ... }
}
```

**Configuração:** `config/l5-swagger.php`

---

## Gerenciamento de Estado

### Quando Usar Cada Abordagem

| Tipo de Estado | Onde Armazenar |
| -------------- | -------------- |

---

## Organização de Imports

**Ordem recomendada em Controllers:**

```php
<?php

namespace App\Http\Controllers\Api\v1;

// 1. Core do Laravel
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// 2. Models
use App\Models\Course;
use App\Models\Module;

// 3. Validações/Exceptions
use Illuminate\Validation\Rule;

// 4. Facades (se necessário)
use Illuminate\Support\Facades\Cache;

// 5. Classes próprias
use App\Http\Controllers\Controller;

class CourseController extends Controller
{
    // ...
}
```

**Ordem recomendada em Models:**

```php
<?php

namespace App\Models;

// 1. Core Laravel
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

// 2. Traits e Contratos
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    // ...
}
```

---

## 🎯 Best Practices

### 1. Controllers

- ✅ Use resource controllers (index, show, store, update, destroy)
- ✅ Valide sempre com `$request->validate()`
- ✅ Retorne JSON com mensagem descritiva
- ✅ Use HTTP status codes corretos (201 para create, 200 para update, etc)
- ❌ Não coloque lógica de negócio complexa - mova para Model ou Service

### 2. Models

- ✅ Use `$fillable` para mass assignment seguro
- ✅ Defina `$casts` para tipagem automática
- ✅ Use soft delete para dados sensíveis
- ✅ Define relacionamentos com métodos descritivos
- ✅ Use constantes para valores enumerados (ROLE_ADMIN, etc)
- ❌ Não use `$guarded = []` (inseguro)

### 3. Validação

- ✅ Valide em `$request->validate()`
- ✅ Use regras customizadas quando necessário
- ✅ Mensagens de erro em português
- ✅ Retorne 422 para erro de validação
- ❌ Não deixe passar dados não validados

### 4. Autenticação

- ✅ Use middleware `auth:api` para rotas protegidas
- ✅ Use middleware `admin` para rotas exclusivas admin
- ✅ Sempre retorne 401 para token inválido/expirado
- ✅ Sempre retorne 403 para falta de permissão
- ❌ Não exponha mensagens de erro sensíveis

### 5. API Response

- ✅ Sempre retorne JSON
- ✅ Inclua campo `message` descritivo
- ✅ Use `data` para envelope dos dados
- ✅ Inclua `errors` em caso de validação falhar
- ✅ Use status codes HTTP corretos
- ❌ Não retorne dados sem estrutura

**Exemplo:**

```php
// ✅ Correto
return response()->json([
    'message' => 'Curso criado com sucesso',
    'data' => $course,
], 201);

// ❌ Evitar
return response()->json($course);
```

### 6. Migrations

- ✅ Uma alteração por migration
- ✅ Use timestamps para versionamento
- ✅ Defina índices e constraints
- ✅ Use soft deletes quando apropriado
- ❌ Nunca modifique migration já executada - crie uma nova

### 7. Testes

- ✅ Escreva testes para lógica crítica
- ✅ Use factories para dados de teste
- ✅ Teste caminos felizes e casos de erro
- ✅ Use `Pest` framework
- ❌ Não pule testes de autenticação/autorização

---

## 🔐 Segurança

### CORS (Cross-Origin Resource Sharing)

**Config:** `config/cors.php` + Middleware `\App\Http\Middleware\Cors::class`

Permite requisições do frontend (diferentes domínios):

```php
'allowed_origins' => [
    'http://localhost:3000',        // Dev frontend
    'http://localhost:5173',        // Vite dev
    'https://seudominio.com',       // Produção
],
```

### JWT Security

- Token expira em 1 hora
- Refresh token para renovar
- Secret key em `.env` (nunca commitar)
- Sempre use HTTPS em produção

### Validação

- Valide TODOS os inputs com `$request->validate()`
- Use regras apropriadas (`email`, `url`, `numeric`, etc)
- Sanitize outputs automaticamente com Eloquent

---

## 📊 Checklist de Arquitetura

Antes de adicionar uma nova feature:

- [ ] O endpoint está versionado (`/api/v1/`)?
- [ ] Há validação de inputs?
- [ ] Há testes escritos?
- [ ] Está documentado com Swagger annotations?
- [ ] Controllers seguem RESTful?
- [ ] Middleware de auth/roles está aplicado?
- [ ] Response segue o padrão JSON?
- [ ] HTTP status code está correto?
- [ ] Errors são tratados?
- [ ] Soft delete foi considerado?

---

## 📚 Recursos

- **Laravel Docs**: https://laravel.com/docs
- **JWT Auth**: https://github.com/PHPOpenSourceSaver/jwt-auth
- **Pest**: https://pestphp.com
- **Swagger/OpenAPI**: https://swagger.io
- **REST Best Practices**: https://restfulapi.net
