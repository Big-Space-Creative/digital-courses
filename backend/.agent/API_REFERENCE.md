# 🔗 API_REFERENCE - Endpoints Completos

## 📌 Base URL
```
http://localhost:8000/api/v1
```

## 🔐 Autenticação
```
Header: Authorization: Bearer {token}
Tipo: JWT
TTL: 1 hora
Refresh: POST /refresh → novo token
```

---

## 📝 ENDPOINTS

### ✅ AUTH (Public - Sem autenticação)

#### POST /register
Registrar novo usuário
```json
Body:
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123!",
  "password_confirmation": "senha123!"
}

Response 201:
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "student"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### POST /login
Autenticar usuário
```json
Body:
{
  "email": "joao@example.com",
  "password": "senha123!"
}

Response 200:
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "student"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### POST /refresh
Renovar token JWT
```json
Header: Authorization: Bearer {token}

Response 200:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 👤 USER (Autenticado)

#### GET /me
Dados do perfil do usuário logado
```json
Header: Authorization: Bearer {token}

Response 200:
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "student",
  "created_at": "2026-03-21T10:30:00Z"
}
```

---

### 📚 COURSES (Public - Listar, Autenticado - Criar/Editar)

#### GET /courses
Listar todos os cursos
```json
Query Parameters:
  ?free=true          # Apenas cursos grátis
  ?free=false         # Apenas cursos pagos
  ?category=1         # Filtrar por categoria
  ?page=1             # Paginação
  ?per_page=10        # Items por página

Response 200:
{
  "data": [
    {
      "id": 1,
      "title": "Introdução ao Laravel",
      "slug": "introducao-ao-laravel",
      "description": "Aprenda Laravel do zero",
      "instructor": { "id": 2, "name": "Instrutor" },
      "modules_count": 5,
      "lessons_count": 25
    }
  ],
  "pagination": { "current_page": 1, "total": 50 }
}
```

#### GET /courses/{id}
Detalhes completos do curso
```json
Response 200:
{
  "id": 1,
  "title": "Introdução ao Laravel",
  "description": "Aprenda Laravel do zero",
  "instructor": { "id": 2, "name": "Instrutor Expert" },
  "modules": [
    { "id": 1, "title": "Módulo 1", "order": 1 },
    { "id": 2, "title": "Módulo 2", "order": 2 }
  ],
  "created_at": "2026-03-21T10:30:00Z"
}
```

#### POST /courses
Criar novo curso (Admin/Instructor)
```json
Header: Authorization: Bearer {token}
Requer: role === admin || role === instructor

Body:
{
  "title": "Novo Curso",
  "description": "Descrição do curso",
  "category_id": 1
}

Response 201:
{
  "id": 5,
  "title": "Novo Curso",
  "slug": "novo-curso",
  "instructor_id": 2,
  "created_at": "2026-03-21T15:00:00Z"
}
```

#### PUT /courses/{id}
Atualizar curso (Admin ou instrutor proprietário)
```json
Header: Authorization: Bearer {token}

Body: { "title": "Novo título", "description": "..." }

Response 200: { "id": 1, "title": "Novo título", ... }
```

#### DELETE /courses/{id}
Deletar curso (Admin apenas)
```json
Header: Authorization: Bearer {token}
Requer: role === admin

Response 204: (No content)
```

---

### 🏗️ MODULES (Autenticado)

#### GET /courses/{course_id}/modules
Listar módulos do curso
```json
Response 200:
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Módulo 1: Setup",
      "order": 1,
      "lessons_count": 5
    }
  ]
}
```

#### POST /modules
Criar novo módulo (Admin/Instructor)
```json
Header: Authorization: Bearer {token}

Body:
{
  "course_id": 1,
  "title": "Novo Módulo",
  "order": 2
}

Response 201:
{
  "id": 3,
  "course_id": 1,
  "title": "Novo Módulo",
  "order": 2
}
```

Validações (StoreModuleRequest):
```
course_id: required, exists:courses,id
title: required, string, max:255
order: required, integer, min:1
```

#### PUT /modules/{id}
Atualizar módulo (Admin/Instructor proprietário)
```json
Header: Authorization: Bearer {token}

Body: { "title": "Novo título", "order": 3 }

Response 200: { "id": 1, "title": "Novo título", "order": 3 }
```

#### DELETE /modules/{id}
Deletar módulo (Admin/Instructor proprietário)
```json
Header: Authorization: Bearer {token}

Response 204: (No content)
```

---

### 📖 LESSONS (Autenticado)

#### GET /modules/{module_id}/lessons
Listar aulas do módulo
```json
Response 200:
{
  "data": [
    {
      "id": 1,
      "module_id": 1,
      "title": "Aula 1: Básico",
      "description": "Aprenda o básico",
      "minio_url": "https://minio.example.com/courses/video-1.mp4",
      "is_free": true,
      "order": 1
    }
  ]
}
```

#### POST /lessons
Criar nova aula (Admin/Instructor)
```json
Header: Authorization: Bearer {token}

Body:
{
  "module_id": 1,
  "title": "Nova Aula",
  "description": "Descrição da aula",
  "minio_url": "https://minio.example.com/courses/video.mp4",
  "is_free": false,
  "order": 6
}

Response 201:
{
  "id": 25,
  "module_id": 1,
  "title": "Nova Aula",
  "minio_url": "https://minio.example.com/courses/video.mp4",
  "is_free": false,
  "order": 6
}
```

Validações (StoreLessonRequest):
```
module_id: required, exists:modules,id
title: required, string, max:255
minio_url: required, url, minio_valid (validates MinIO security)
is_free: required, boolean
order: required, integer, min:1
```

**MinIO Validation:**
- URL deve conter domínio MinIO configurado
- URL deve estar em bucket autorizado
- Validado por `MinIOUrlService`

#### PUT /lessons/{id}
Atualizar aula (Admin/Instructor proprietário)
```json
Header: Authorization: Bearer {token}

Body: {
  "title": "Novo título",
  "minio_url": "https://minio.example.com/courses/novo-video.mp4",
  "is_free": true
}

Response 200: { "id": 1, "title": "Novo título", ... }
```

#### DELETE /lessons/{id}
Deletar aula (Admin/Instructor proprietário)
```json
Header: Authorization: Bearer {token}

Response 204: (No content)
```

---

## 🔄 Status Codes

| Code | Significado |
|------|------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 204 | No Content - Sucesso sem corpo |
| 400 | Bad Request - Validação falhou |
| 401 | Unauthorized - Token ausente/inválido |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 422 | Unprocessable Entity - Dados inválidos |
| 500 | Server Error - Erro interno |

---

## 💾 Error Response

```json
Response 422:
{
  "message": "Validação falhou",
  "errors": {
    "email": ["O campo email deve ser um email válido"],
    "password": ["O campo password deve ter pelo menos 8 caracteres"]
  }
}
```

---

## 🔐 Segurança MinIO

### URLs Validadas
```
✅ https://minio.example.com/courses/*
✅ https://s3.amazonaws.com/digital-courses/*
❌ https://malicious-site.com/...
❌ file:///etc/passwd
```

### Validação no UpdateLessonRequest
```php
'minio_url' => [
    'required',
    'url',
    new MinIOUrlValidation(),  // Custom rule
]
```

---

## 📊 Swagger UI

**URL:** http://localhost:8000/api/documentation

Todos os endpoints estão documentados no Swagger:
- Descrição completa
- Parâmetros e validações
- Exemplos de requisição/resposta
- Try-it-out funcionando
