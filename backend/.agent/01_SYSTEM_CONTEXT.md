# 01_SYSTEM_CONTEXT

## Indice Interno
- Produto
- Stack
- Modulos de Dominio
- Estrutura do Projeto
- Infra Local
- Estado de Implementacao

## Produto
Digital Courses Backend: plataforma de cursos online com autenticacao JWT, controle por role e conteudo hospedado no MinIO.

## Stack
- Laravel 12
- PHP 8.2+
- PostgreSQL 16
- Redis
- MinIO (S3)
- L5 Swagger
- Pest + Pint
- Docker Compose

## Modulos de Dominio
- Usuarios: autenticacao, perfil, roles, subscription.
- Cursos: catalogo e publicacao.
- Modulos: estrutura de curso.
- Lessons: video + metadados + acesso free/premium.
- Materiais: pdf/imagem/video vinculados a lesson.
- Admin: dashboard, gestao de usuarios e cursos.

## Estrutura do Projeto
- app/Http/Controllers: endpoints da API.
- app/Http/Requests: validacoes.
- app/Policies: autorizacao por role/recurso.
- app/Models: entidades de dominio.
- routes/api.php: definicao de rotas.
- config/l5-swagger.php: geracao OpenAPI.

## Infra Local
Servicos Docker:
- app, nginx, db, redis, minio, pgadmin, frontend

URLs:
- API: http://localhost:8000
- Swagger: http://localhost:8000/api/documentation
- MinIO Console: http://localhost:9001
- PgAdmin: http://localhost:8080

## Estado de Implementacao
- Rotas API /api/v1 ativas e versionadas.
- Upload unico de lesson com materiais implementado.
- Policies para Module, Lesson e Material aplicadas.
- Swagger gerado a partir de annotations.
