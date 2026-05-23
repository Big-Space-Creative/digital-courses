# 02_API_REFERENCE

## Indice Interno
- Base
- Auth
- Usuarios
- Cursos
- Modulos
- Lessons
- Uploads MinIO
- Admin

## Base
- Base URL: http://localhost:8000/api/v1
- Header protegido: Authorization: Bearer <token>

## Auth
- POST /register  → Cria conta e envia e-mail de verificação (nao retorna tokens)
- POST /login     → Exige email_verified_at preenchido (HTTP 403 se nao verificado)
- POST /logout
- POST /refresh
- GET  /me
- POST /me

## E-mail Verification
- GET  /email/verify/{id}/{hash}  (middleware: signed) — link do e-mail, redireciona para FRONTEND_URL/email-verified?status=...
- POST /email/resend               (sem autenticacao) — body: { "email": "..." }

## Usuarios
- GET /users (admin)
- PUT /users/{id} (admin)

## Cursos
- GET /courses
- GET /courses/{course}
- POST /courses (admin)
- PUT /courses/{course} (admin)
- DELETE /courses/{course} (admin)

## Modulos
- POST /courses/{course}/modules (admin,instructor)
- PUT /courses/{course}/modules/{module} (admin,instructor)
- DELETE /courses/{course}/modules/{module} (admin,instructor)

## Lessons
- GET /lessons/{lesson}
- POST /modules/{module}/lessons (admin,instructor)
- PUT /lessons/{lesson} (admin,instructor)
- DELETE /lessons/{lesson} (admin,instructor)

## Uploads MinIO
### 1) Criacao unificada de lesson
- POST /modules/{module}/lessons/upload
- Content-Type: multipart/form-data
- Campos:
  - title (obrigatorio)
  - description (opcional)
  - duration_in_minutes (opcional)
  - is_free_preview (opcional)
  - video_file (obrigatorio)
  - materials[] (opcional)
  - material_titles[] (opcional)
- Resultado:
  - cria lesson no banco
  - sobe video e materiais no MinIO
  - grava video_url e file_path
  - rollback transacional em falha

### 2) Upload avulso de material
- POST /lessons/{lesson}/materials/upload
- Content-Type: multipart/form-data
- Campos:
  - title (obrigatorio)
  - file (obrigatorio)

## Admin
- GET /admin/dashboard
- GET /admin/users
- GET /admin/users/{id}
- PATCH /admin/users/{id}/role
- PATCH /admin/users/{id}/subscription
- GET /admin/courses
- GET /admin/courses/{id}

## Observacoes de Consistencia
- Os placeholders oficiais seguem routes/api.php: {course}, {module}, {lesson}.
- Sempre confirmar em runtime:
  - docker-compose exec app php artisan route:list --path=api/v1
