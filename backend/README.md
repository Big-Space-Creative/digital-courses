# 🎓 Digital Courses Backend API

Plataforma de cursos online com autenticação JWT, gerenciamento de módulos/lições e armazenamento seguro em MinIO.

> **Status:** ✅ Pronto para desenvolvimento | **Testes:** 9/9 ✓ | **Swagger:** Habilitado

---

## 🚀 Quick Start (5 minutos)

### 1. Clone e Entre na Pasta

```powershell
git clone https://github.com/seu-repo/digital-courses.git
cd digital-courses/backend
```

### 2. Configure o Ambiente

```powershell
Copy-Item .env.example -Destination .env
# Editar .env se necessário (padrões já estão configurados)
```

### 3. Inicie Docker & Migrações

```powershell
docker-compose down -v
docker-compose up -d --build

# Aguarde 30s, depois execute:
Start-Sleep -Seconds 30
docker-compose exec app php artisan migrate
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan jwt:secret
docker-compose exec app php artisan l5-swagger:generate
```

### 4. Acesse

- **API:** http://localhost:8000/api/v1
- **Swagger UI:** http://localhost:8000/api/documentation

---

## 📚 Documentação

**👉 Primeira vez?** Abra [`backend/.agent/FIRST_TIME_SETUP.md`](./agent/FIRST_TIME_SETUP.md)

**Documentação Técnica:**
- [`architecture.md`](./.agent/architecture.md) - Stack, estrutura, convenções
- [`components.md`](./.agent/components.md) - Controllers, Models, exemplos
- [`swagger-config.md`](./.agent/swagger-config.md) - API endpoints documentados
- [`business-rules.md`](./.agent/business-rules.md) - Regras de negócio
- [`best-practices.md`](./.agent/best-practices.md) - Padrões de código
- [`design-system.md`](./.agent/design-system.md) - Padrões JSON/erros

---

## 🏗️ Stack Tecnológico

| Componente | Versão | Descrição |
|-----------|--------|-----------|
| **PHP** | 8.4 FPM | Linguagem/runtime |
| **Laravel** | 12.0 | Framework web |
| **PostgreSQL** | 16 | Banco de dados |
| **JWT Auth** | 2.8 | Autenticação |
| **L5-Swagger** | 10.1.0 | OpenAPI 3.0.0 documentation |
| **Pest** | 3.8.5 | Framework de testes |
| **Pint** | 1.27.1 | Code formatter |
| **MinIO** | Latest | Object storage S3-compatible |
| **Docker Compose** | v2.28+ | Orquestração |

---

## 🔐 Autenticação & Autorização

### JWT Tokens

Registre e faça login para receber tokens:

```powershell
# Registrar
POST /api/v1/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123!",
  "password_confirmation": "senha123!"
}

# Login
POST /api/v1/login
{
  "email": "joao@example.com",
  "password": "senha123!"
}

# Resposta: { token, token_type: "bearer", expires_in: 3600 }
```

### Roles & Permissões

| Role | Permissões |
|------|-----------|
| **student** | Ver cursos/módulos/lições públicas, progresso pessoal |
| **instructor** | Criar/editar módulos/lições em cursos designados |
| **admin** | CRUD completo de cursos, módulos, lições, usuários |

### Headers de Requisição

```powershell
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json
```

---

## 📡 API Endpoints

### Autenticação

```
POST   /api/v1/register         → Registrar novo usuário
POST   /api/v1/login            → Login (retorna token)
POST   /api/v1/logout           → Logout (invalida token)
GET    /api/v1/me               → Dados do usuário atual
POST   /api/v1/refresh          → Renovar token
```

### Cursos

```
GET    /api/v1/courses          → Listar cursos
POST   /api/v1/courses          → Criar curso (admin)
GET    /api/v1/courses/{id}     → Detalhar curso
PUT    /api/v1/courses/{id}     → Atualizar curso (admin)
DELETE /api/v1/courses/{id}     → Deletar curso (admin)
```

### Módulos

```
POST   /api/v1/courses/{course}/modules          → Criar (admin/instructor)
PUT    /api/v1/courses/{course}/modules/{id}     → Atualizar
DELETE /api/v1/courses/{course}/modules/{id}     → Deletar
```

### Lições

```
POST   /api/v1/modules/{module}/lessons          → Criar (admin/instructor)
GET    /api/v1/lessons/{id}                      → Ver (condicional)
PUT    /api/v1/lessons/{id}                      → Atualizar
DELETE /api/v1/lessons/{id}                      → Deletar
```

**Completo:** Veja [`swagger-config.md`](./.agent/swagger-config.md) ou acesse http://localhost:8000/api/documentation

---

## 🗄️ Banco de Dados

### Migrations Disponíveis

14 migrations executadas automaticamente:

```
✓ users, roles, courses, enrollments
✓ course_progress, materials
✓ modules (título, descrição, ordem)
✓ lessons (video_url, duração, is_free_preview)
✓ soft deletes em courses, modules, lessons
```

### Schema Principais

**Users**
```sql
id, name, email, password, role, subscription_type, 
email_verified_at, created_at, updated_at, deleted_at
```

**Courses**
```sql
id, user_id (instructor), title, slug, description, price, 
thumbnail, is_published, published_at, created_at, updated_at, deleted_at
```

**Modules**
```sql
id, course_id, title, description, order, created_at, updated_at
```

**Lessons**
```sql
id, module_id, title, description, video_url, duration_in_minutes,
is_free_preview, created_at, updated_at
```

---

## 🛡️ Segurança - MinIO

Todas as URLs de vídeo são validadas contra um whitelist:

```env
# .env
MINIO_ALLOWED_HOSTS=minio.example.com,cdn.example.com:9000
```

**Exemplo:**

```json
POST /api/v1/modules/1/lessons

{
  "title": "Aula 1",
  "video_url": "https://minio.example.com/courses/video.mp4",
  "is_free_preview": false
}
```

Validações automáticas:
- ✅ URL deve estar em whitelist
- ✅ Credenciais são sanitizadas (remove user:pass@)
- ✅ URLs inválidas são rejeitadas (422)

---

## 🧪 Testes & Qualidade

### Rodar Testes

```powershell
docker-compose exec app ./vendor/bin/pest

# Output: Tests: 9 passed, 0 failed
```

### Formatar Código

```powershell
docker-compose exec app ./vendor/bin/pint

# Verifica estilo em todos os arquivos PHP
```

### Verificar Erros de Sintaxe

```powershell
docker-compose exec app php -l app/Http/Controllers/Api/v1/*.php
```

---

## 🐳 Docker Compose Services

```yaml
app:      # Laravel FPM (PHP 8.4)  - porta interna: 9000
db:       # PostgreSQL 16           - porta: 5432
minio:    # MinIO Object Storage    - porta: 9000 (UI), 9001 (API)
nginx:    # Reverse Proxy           - porta: 8000
```

**Comandos úteis:**

```powershell
# Ver containers
docker ps

# Ver logs
docker-compose logs -f app
docker-compose logs -f db

# Entrar no container
docker-compose exec app bash

# Reiniciar tudo
docker-compose restart

# Parar tudo
docker-compose down

# Reset completo (CUIDADO: deleta banco!)
docker-compose down -v && docker-compose up -d
```

---

## 📂 Estrutura de Arquivos

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/v1/
│   │   │   ├── AuthController.php         ← Autenticação
│   │   │   ├── CourseController.php       ← Cursos
│   │   │   ├── ModuleController.php       ← Módulos ✨
│   │   │   └── LessonController.php       ← Lições ✨
│   │   ├── Requests/
│   │   │   ├── StoreModuleRequest.php     ← Validação ✨
│   │   │   ├── UpdateModuleRequest.php    ← Validação ✨
│   │   │   ├── StoreLessonRequest.php     ← Validação + MinIO ✨
│   │   │   └── UpdateLessonRequest.php    ← Validação ✨
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Course.php
│   │   ├── Module.php                     ← Novo ✨
│   │   ├── Lesson.php                     ← Novo ✨
│   │   └── ...
│   └── Services/
│       └── MinIOUrlService.php            ← Validação MinIO ✨
├── database/
│   ├── migrations/                        ← 14 migrations
│   └── seeders/
├── routes/
│   └── api.php                            ← Definição de rotas
├── config/
│   ├── l5-swagger.php                     ← Swagger config
│   └── ...
├── storage/
├── tests/
│   ├── Feature/
│   └── Unit/
├── .agent/                                ← 📚 Documentação interna
│   ├── FIRST_TIME_SETUP.md               ← 👈 Comece aqui!
│   ├── README.md
│   ├── architecture.md
│   ├── components.md
│   ├── swagger-config.md
│   ├── business-rules.md
│   ├── best-practices.md
│   └── design-system.md
├── .env.example                           ← Template .env
├── docker-compose.yml
├── Dockerfile
└── README.md                              ← Este arquivo
```

---

## 🚨 Troubleshooting

### "Connection refused" ao acessar API

```powershell
# Verificar se containers estão rodando
docker ps

# Se não estão:
docker-compose up -d

# Esperar 30 segundos e testar:
curl http://localhost:8000/api/v1/courses
```

### Swagger não carrega

```powershell
# Verificar SWAGGER_ENABLED no .env
findstr "SWAGGER_ENABLED" .env

# Regenerar:
docker-compose exec app php artisan l5-swagger:generate

# Limpar cache do navegador: Ctrl+Shift+Del
# Reabrir: http://localhost:8000/api/documentation
```

### Testes falhando

```powershell
# Reset banco de testes e rodar testes
docker-compose exec app php artisan migrate:fresh --seed --env=testing
docker-compose exec app ./vendor/bin/pest
```

### Erro ao executar migrations

```powershell
# Aguardar banco ficar pronto
Start-Sleep -Seconds 10
docker-compose exec app php artisan migrate

# Se ainda falhar, verificar logs:
docker-compose logs db | Select-Object -Last 50
```

---

## 📝 Variáveis de Ambiente Importantes

```env
# Laravel
APP_NAME=DigitalCourses
APP_KEY=base64:...              # Gerado automaticamente
APP_ENV=local
DEBUG=true

# Database
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=digital_courses
DB_USERNAME=laravel
DB_PASSWORD=secret

# JWT
JWT_SECRET=...                  # Gerado automaticamente

# Swagger
SWAGGER_ENABLED=true            # 👈 Habilitado por padrão

# MinIO
MINIO_KEY=minioadmin
MINIO_SECRET=minioadmin
MINIO_BUCKET=courses
MINIO_PUBLIC_HOST=http://localhost:9000
MINIO_ALLOWED_HOSTS=minio.example.com
```

---

## 🎯 Próximos Passos

1. **Ler documentação** → Abra `.agent/FIRST_TIME_SETUP.md`
2. **Explorar Swagger** → http://localhost:8000/api/documentation
3. **Rodar testes** → `docker-compose exec app ./vendor/bin/pest`
4. **Fazer primeiro commit** → Consulte `.agent/best-practices.md`

---

## 📞 Suporte

- **Documentação completa:** `backend/.agent/README.md`
- **Primeira clonagem:** `backend/.agent/FIRST_TIME_SETUP.md`
- **Endpoints:** `backend/.agent/swagger-config.md`
- **Arquitetura:** `backend/.agent/architecture.md`

---

## 📄 Licença

MIT License - Veja LICENSE.md para detalhes

---

**Made with ❤️ for Digital Courses Platform**
