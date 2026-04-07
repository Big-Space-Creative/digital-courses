# 00_START_HERE

Arquivo principal para qualquer agente de IA antes de alterar o projeto.

## Indice Interno
- Objetivo
- Ordem de Leitura
- Mapa dos Arquivos
- Estado Atual do Backend
- Fluxo Recomendado para Mudancas

## Objetivo
Centralizar contexto operacional rapido para desenvolvimento seguro no backend.

## Ordem de Leitura
1. 00_START_HERE.md (este arquivo)
2. 01_SYSTEM_CONTEXT.md
3. 02_API_REFERENCE.md
4. 03_ARCHITECTURE.md
5. 04_BUSINESS_RULES.md
6. 05_ENGINEERING_STANDARDS.md

## Mapa dos Arquivos
- 00_START_HERE.md: entrada principal, como navegar e o que validar antes de editar.
- 01_SYSTEM_CONTEXT.md: visao geral do produto, stack, dominios e estado atual.
- 02_API_REFERENCE.md: rotas reais do backend, payloads e respostas-chave.
- 03_ARCHITECTURE.md: estrutura de codigo, fluxo de request e integracoes (MinIO/JWT).
- 04_BUSINESS_RULES.md: regras de acesso e comportamento esperado da plataforma.
- 05_ENGINEERING_STANDARDS.md: padroes de implementacao, testes e checklist de entrega.
- 99_HISTORY.md: historico resumido de reorganizacao/documentacao.

## Estado Atual do Backend
- API versionada em /api/v1
- Autenticacao JWT com roles: student, instructor, admin
- CRUD de cursos, modulos e lessons ativo
- Upload unificado de lesson + materiais no MinIO ativo
- Swagger habilitado em /api/documentation
- Docker como ambiente padrao de execucao

## Fluxo Recomendado para Mudancas
1. Confirmar regra de negocio no 04_BUSINESS_RULES.md.
2. Confirmar rota/contrato no 02_API_REFERENCE.md.
3. Implementar respeitando 03_ARCHITECTURE.md e 05_ENGINEERING_STANDARDS.md.
4. Validar rotas no container app:
   - docker-compose exec app php artisan route:list --path=api/v1
5. Atualizar Swagger e docs:
   - docker-compose exec app php artisan l5-swagger:generate

## Regra de Ouro
Qualquer alteracao de endpoint deve atualizar juntos:
- Controller/Request/Policy
- 02_API_REFERENCE.md
- README principal
- Swagger
