# Digital Courses Backend

Backend Laravel 12 da plataforma de cursos online com JWT, MinIO e Swagger.

## Subir com Docker

```powershell
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
docker compose exec app php artisan l5-swagger:generate
```

## URLs

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/api/documentation
- Swagger JSON: http://localhost:8000/docs

## Autenticação

Use `Authorization: Bearer <token>` para rotas protegidas.

## Rotas API (estado atual)

### Auth
- POST `/api/v1/register`
- POST `/api/v1/login`
- POST `/api/v1/logout`
- POST `/api/v1/refresh`
- GET `/api/v1/me`
- POST `/api/v1/me`

### Usuários
- GET `/api/v1/users` (admin)
- PUT `/api/v1/users/{id}` (admin)

### Cursos
- GET `/api/v1/courses`
- GET `/api/v1/courses/{course}`
- POST `/api/v1/courses` (admin)
- PUT `/api/v1/courses/{course}` (admin)
- DELETE `/api/v1/courses/{course}` (admin)

### Módulos
- POST `/api/v1/courses/{course}/modules` (admin/instructor)
- PUT `/api/v1/courses/{course}/modules/{module}` (admin/instructor)
- DELETE `/api/v1/courses/{course}/modules/{module}` (admin/instructor)

### Aulas
- GET `/api/v1/lessons/{lesson}`
- POST `/api/v1/modules/{module}/lessons` (admin/instructor)
- PUT `/api/v1/lessons/{lesson}` (admin/instructor)
- DELETE `/api/v1/lessons/{lesson}` (admin/instructor)

### Uploads MinIO
- POST `/api/v1/modules/{module}/lessons/upload` (admin/instructor)
  - Cria a lesson + upload de vídeo + upload opcional de materiais na mesma requisição multipart.
- POST `/api/v1/lessons/{lesson}/materials/upload` (admin/instructor)
  - Upload avulso de material (pdf/imagem/vídeo) para uma lesson existente.

### Admin
- GET `/api/v1/admin/dashboard`
- GET `/api/v1/admin/users`
- GET `/api/v1/admin/users/{id}`
- PATCH `/api/v1/admin/users/{id}/role`
- PATCH `/api/v1/admin/users/{id}/subscription`
- GET `/api/v1/admin/courses`
- GET `/api/v1/admin/courses/{id}`

## MinIO (upload unificado)

Endpoint recomendado para o frontend na tela de criar lesson:

- `POST /api/v1/modules/{module}/lessons/upload`
- Content-Type: `multipart/form-data`
- Campos:
  - `title` (obrigatório)
  - `description` (opcional)
  - `duration_in_minutes` (opcional)
  - `is_free_preview` (opcional)
  - `video_file` (obrigatório)
  - `materials[]` (opcional)
  - `material_titles[]` (opcional)

## Swagger

A documentação OpenAPI é gerada por annotations dos controllers e pelo arquivo base em `app/Http/Controllers/SwaggerInfo.php`.

Regerar sempre que alterar rotas/requests:

```powershell
docker compose exec app php artisan l5-swagger:generate
```
