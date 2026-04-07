# 03_ARCHITECTURE

## Indice Interno
- Camadas Principais
- Fluxo de Request
- Autorizacao
- Upload MinIO
- Persistencia
- Pontos de Extensao

## Camadas Principais
- Controllers: orquestram request/response.
- Requests: validacao de payload.
- Policies: autorizacao por role/recurso.
- Models: regras e relacionamentos de dominio.
- Services: utilitarios especializados (ex.: MinIO URL service).

## Fluxo de Request
1. Route em routes/api.php
2. Middleware (auth/admin/role)
3. FormRequest (validacao)
4. Controller (logica de caso de uso)
5. Model/DB
6. Response JSON padronizado

## Autorizacao
- auth:api para autenticacao JWT
- admin para operacoes exclusivas
- role:admin,instructor para gestao de conteudo
- Policies aplicadas: Course, Module, Lesson, Material

## Upload MinIO
- Disco utilizado: s3 (config/filesystems.php)
- Upload de lesson unificado:
  - POST /api/v1/modules/{module}/lessons/upload
- Upload de material avulso:
  - POST /api/v1/lessons/{lesson}/materials/upload
- Estrategia de seguranca:
  - validacao de extensao/mime
  - rollback DB em erro
  - cleanup de arquivos enviados no MinIO em falha

## Persistencia
Entidades principais:
- users
- courses
- modules
- lessons
- materials
- enrollments

Relacionamentos:
- Course hasMany Module
- Module hasMany Lesson
- Lesson hasMany Material

## Pontos de Extensao
- Adicionar novos endpoints em routes/api.php
- Criar FormRequest dedicado para payloads complexos
- Criar Policy antes de expor operacoes sensiveis
- Atualizar OpenAPI annotations e README apos qualquer mudanca de contrato
