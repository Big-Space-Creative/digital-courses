# 04_API_INTEGRATION — Frontend

## Base
- API Base URL: http://localhost:8000/api/v1
- Proxy Next.js: src/proxy.ts (rewrites /api/* → backend)
- Auth: Bearer token JWT guardado em cookie httpOnly
- Erro padrão da API: { message: string, errors?: object }

## Serviços Existentes (src/services/api/)
- auth.ts — login, register, logout, me

## Server Actions Existentes (src/app/actions/)
- auth.ts — loginAction, logoutAction (leem/escrevem cookie)
- user.ts — getUserFromToken (decodifica JWT do cookie para root layout)

## Como Chamar a API (padrão)
```ts
// src/services/api/courses.ts
import { getCookieToken } from "@/libs/cookie";

export async function getCourses() {
  const token = await getCookieToken();
  const res = await fetch("/api/v1/courses", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Falha ao buscar cursos");
  return res.json();
}
```

## Endpoints Disponíveis no Backend

### Auth
- POST /api/v1/login              → { token, user }
- POST /api/v1/register           → { token, user }
- POST /api/v1/logout             → void
- GET  /api/v1/me                 → user atual

### Cursos
- GET  /api/v1/courses            → lista de cursos
- GET  /api/v1/courses/{course}   → curso + módulos + lessons
- POST /api/v1/courses            → cria curso (admin)
- PUT  /api/v1/courses/{course}   → edita curso (admin)
- DELETE /api/v1/courses/{course} → remove curso (admin)

### Módulos
- POST /api/v1/courses/{course}/modules              → cria módulo
- PUT  /api/v1/courses/{course}/modules/{module}     → edita
- DELETE /api/v1/courses/{course}/modules/{module}   → remove

### Lessons
- GET  /api/v1/lessons/{lesson}            → dados da aula + materiais
- POST /api/v1/modules/{module}/lessons    → cria lesson (JSON)
- PUT  /api/v1/lessons/{lesson}            → edita
- DELETE /api/v1/lessons/{lesson}          → remove

### Upload Unificado (Aula + Vídeo + Materiais)
- POST /api/v1/modules/{module}/lessons/upload
  - multipart/form-data
  - Campos: title, description?, duration_in_minutes?, is_free_preview?, video_file, materials[]?, material_titles[]?
  - Retorna: lesson criada com video_url e materiais com file_path

### Upload Avulso de Material
- POST /api/v1/lessons/{lesson}/materials/upload
  - multipart/form-data
  - Campos: title, file

### Admin
- GET /api/v1/admin/users                   → lista usuários
- PATCH /api/v1/admin/users/{id}/role       → muda role
- PATCH /api/v1/admin/users/{id}/subscription → muda plano

## Roles de Usuário
- student: acesso ao conteúdo (free apenas aulas is_free_preview)
- instructor: gestão de módulos/aulas/materiais
- admin: controle total

## Próximas Integrações Prioritárias
1. Listar cursos reais na página de gerenciar cursos (admin)
2. Submit real do form de criar curso → POST /courses + módulos + upload lessons
3. Listar aulas reais do curso na página do aluno
4. Carregar lesson real na página /aluno/aula/[lessonId]
5. Listar usuários reais na página de alunos (admin)
