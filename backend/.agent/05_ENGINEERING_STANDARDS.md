# 05_ENGINEERING_STANDARDS

## Indice Interno
- Padrao de Implementacao
- Contrato de API
- Testes
- Swagger e README
- Checklist de Entrega

## Padrao de Implementacao
- Controller enxuto, validacao em FormRequest.
- Regra de acesso em middleware/policy.
- Respostas JSON consistentes com message + data quando aplicavel.
- Evitar logica de negocio complexa em route file.

## Contrato de API
- API versionada em /api/v1.
- Placeholders oficiais: {course}, {module}, {lesson}.
- Uploads devem usar multipart/form-data quando houver arquivo.

## Testes
- Rodar no container app:
  - docker-compose exec app php artisan test
- Validar rotas alteradas:
  - docker-compose exec app php artisan route:list --path=api/v1

## Swagger e README
Sempre que alterar endpoint/payload:
1. Atualizar annotations no controller.
2. Regenerar swagger:
   - docker-compose exec app php artisan l5-swagger:generate
3. Atualizar README principal e 02_API_REFERENCE.md.

## Checklist de Entrega
- [ ] Rota implementada e protegida
- [ ] Request validado
- [ ] Policy/middleware aplicado
- [ ] Persistencia correta no banco
- [ ] Swagger atualizado
- [ ] README atualizado
- [ ] Testes executados
