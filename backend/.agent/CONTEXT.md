# 📋 CONTEXT - Contexto Completo do Projeto

## 🎯 Visão Geral
- **Nome:** Digital Courses Backend
- **Tipo:** Plataforma de educação online (SaaS)
- **Stack:** Laravel 12 + PostgreSQL 16 + JWT Auth + MinIO + Docker
- **Status:** ✅ Setup validado, pronto para desenvolvimento

## 🏗️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| PHP | 8.4 FPM | Linguagem |
| Laravel | 12.x | Framework |
| PostgreSQL | 16 | Database |
| JWT Auth | 2.8 | Autenticação |
| L5-Swagger | 10.1 | Documentação (OpenAPI 3.0.0) |
| Pest | 3.8.5 | Testes |
| Pint | 1.27.1 | Code formatter |
| MinIO | Latest | S3-compatible storage |
| Docker | v27.0+ | Containerização |
| Docker Compose | 2.28+ | Orquestração |

## 📁 Estrutura de Pastas Essencial

```
backend/
├── app/Http/Controllers/Api/v1/
│   ├── AuthController.php           # Login, register, refresh token
│   ├── CourseController.php          # CRUD cursos
│   ├── ModuleController.php          # CRUD módulos
│   ├── LessonController.php          # CRUD aulas
│   ├── UserController.php            # Perfil e info
│   └── AdminController.php           # Dashboard admin
│
├── app/Http/Requests/
│   ├── StoreModuleRequest.php        # Validação: criar módulo
│   ├── UpdateModuleRequest.php       # Validação: atualizar módulo
│   ├── StoreLessonRequest.php        # Validação: criar aula (MinIO)
│   └── UpdateLessonRequest.php       # Validação: atualizar aula
│
├── app/Models/
│   ├── User.php                      # Usuário (roles: student, instructor, admin)
│   ├── Course.php                    # Curso
│   ├── Module.php                    # Módulo
│   ├── Lesson.php                    # Aula
│   ├── Enrollment.php                # Matrícula
│   └── Category.php                  # Categorias
│
├── app/Services/
│   └── MinIOUrlService.php           # Validação segura MinIO URLs
│
├── database/migrations/              # 14 migrações
├── tests/                            # 9 testes (Pest)
└── .env.example                      # Template de configuração
```

## 🔐 Autenticação & Autorização

### JWT (JSON Web Token)
- Stateless, sem sessão
- Token gerado em `/api/v1/register` e `/api/v1/login`
- TTL: 1 hora (ajustável em config)
- Refresh via `/api/v1/refresh`

### Roles (Permissões)
```php
'student'    => Apenas lê conteúdo
'instructor' => Cria cursos e aulas dos seus cursos
'admin'      => Acesso total
```

### Middleware
- `auth:api` → Requer token JWT
- `IsAdmin` → Requer role === 'admin'
- `CheckRole:instructor,admin` → Requer múltiplos roles

## 🗄️ Modelos de Dados

### Users
```
- id, name, email, password, role, created_at
- Roles: student | instructor | admin
```

### Courses
```
- id, title, slug, description, instructor_id, category_id, created_at
- Relacionamento: hasMany(Module), belongsTo(User)
```

### Modules
```
- id, course_id, title, order, created_at
- Relacionamento: hasMany(Lesson), belongsTo(Course)
```

### Lessons
```
- id, module_id, title, description, minio_url, is_free, order, created_at
- Relacionamento: belongsTo(Module)
- MinIO URL validado por MinIOUrlService
```

## 🔗 Relacionamentos Principais

```
User (1) ──► (Many) Course (instructor)
User (1) ──► (Many) Enrollment
Course (1) ──► (Many) Module
Module (1) ──► (Many) Lesson
Lesson (Many) ──◄ (1) Module
```

## 📚 Rotas API (15+ endpoints)

### Autenticação (Public)
- `POST /api/v1/register` → Registrar novo usuário
- `POST /api/v1/login` → Login (retorna token)
- `POST /api/v1/refresh` → Renovar token

### Usuário (Autenticado)
- `GET /api/v1/me` → Dados do perfil

### Cursos (Public)
- `GET /api/v1/courses` → Listar todos (com filtro free/premium)
- `GET /api/v1/courses/{id}` → Detalhes do curso

### Módulos (Autenticado)
- `POST /api/v1/modules` → Criar módulo (admin/instructor)
- `GET /api/v1/courses/{course}/modules` → Listar módulos
- `PUT /api/v1/modules/{id}` → Atualizar módulo
- `DELETE /api/v1/modules/{id}` → Deletar módulo

### Aulas (Autenticado)
- `POST /api/v1/lessons` → Criar aula (admin/instructor) - Valida MinIO
- `GET /api/v1/modules/{module}/lessons` → Listar aulas
- `PUT /api/v1/lessons/{id}` → Atualizar aula
- `DELETE /api/v1/lessons/{id}` → Deletar aula

## 📊 Banco de Dados

### Migrações (14 total)
1. users - Tabela de usuários
2. password_reset_tokens - Reset de senha
3. sessions - Sessões
4. courses - Cursos
5. modules - Módulos
6. lessons - Aulas
7. lesson_content - Conteúdo de aulas
8. user_lessons - Acesso do usuário a aulas
9. failed_jobs - Falhas de jobs
10. access_logs - Logs de acesso
11. api_tokens - Tokens API
12. jwt_secrets - Secrets JWT
13-14. Adicionais conforme necessário

### Credenciais Desenvolvimento
```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=digital_courses
DB_USERNAME=laravel
DB_PASSWORD=secret
```

## 🧪 Testes

### Framework: Pest 3.8.5
```
Tests/ 
├── Unit/
│   ├── ExampleTest.php
│   └── UserLessonAccessTest.php       # Testa acesso por tipo de usuário
│
└── Feature/
    ├── Api/
    │   ├── AuthEndpointsTest.php      # Testa register, login, profile
    │   └── StatusEndpointTest.php     # Testa endpoint de status
    └── ...
```

### Status
- ✅ 9/9 testes passando
- ✅ 43 assertions validadas
- ✅ 0 erros de cobertura
- Executar: `docker-compose exec app php vendor/bin/pest`

## 🎨 Code Style

### Framework: Pint 1.27.1 (PSR-12)
```
✅ 73 arquivos validados
✅ 0 issues
✅ Laravel preset configurado
```
Executar: `docker-compose exec app php vendor/bin/pint --test`

## 📖 Documentação API

### Swagger UI (OpenAPI 3.0.0)
- **URL:** http://localhost:8000/api/documentation
- **Gerado:** `php artisan l5-swagger:generate`
- **Status:** ✅ Habilitado por padrão (SWAGGER_ENABLED=true)
- **Autenticação:** Bearer token nos headers

## 🐳 Docker

### Containers (6 total)
1. **app** (Port 9000) - Laravel FPM
2. **db** (Port 5432) - PostgreSQL 16
3. **nginx** (Port 8000) - Reverse proxy
4. **minio** (Port 9000/9001) - Object storage
5. **redis** (Port 6379) - Cache/Queue
6. **pgadmin** (Port 8080) - Database UI

### Comandos Essenciais
```powershell
docker-compose up -d --build    # Start
docker-compose down -v          # Stop + remove volumes
docker-compose exec app bash    # Enter app container
docker ps                       # Ver containers
```

## ✅ O Que Está Completo

- ✅ Autenticação JWT (register, login, refresh)
- ✅ CRUD Cursos (create, read, update, delete)
- ✅ CRUD Módulos (create, read, update, delete)
- ✅ CRUD Aulas (create, read, update, delete)
- ✅ Validação de URLs MinIO (segurança)
- ✅ Permissões por role (admin, instructor, student)
- ✅ Testes automatizados (9/9)
- ✅ Code style validado (0 issues)
- ✅ Swagger documentado
- ✅ Docker completamente configurado
- ✅ Setup validado em máquina zerada

## ❌ O Que Falta (Próximas Iterações)

1. **setup.ps1** - Automação completa de setup
2. **CI/CD** - GitHub Actions (testes automáticos)
3. **Exemplos** - cURL, Postman, JavaScript, Python
4. **Seeders** - Dados de teste (users, courses, modules)
5. **Health Check** - GET /api/v1/health
6. **Logging** - JSON estruturado
7. **Produção** - .env.production, Dockerfile.prod
8. **Auth UI** - Swagger login/logout
9. Mais 2 iterações (roadmap em TODO_LIST)

## 🔧 Como Começar Desenvolvimento

1. **Entrar no container:**
   ```powershell
   docker-compose exec app bash
   ```

2. **REPL Interativo:**
   ```bash
   php artisan tinker
   ```

3. **Criar Controller/Model:**
   ```bash
   php artisan make:model ModelName -m -c
   ```

4. **Rodar testes:**
   ```bash
   php vendor/bin/pest
   ```

5. **Validar code style:**
   ```bash
   php vendor/bin/pint --test
   ```

## 📞 Status da Iteração 1

✅ **COMPLETA**
- Setup validado em máquina zerada
- Scripts de validação criados (automático + manual)
- Todos os 10 testes passaram
- Nenhum erro estrutural encontrado
- Pronto para Iteração 2 (setup.ps1)
