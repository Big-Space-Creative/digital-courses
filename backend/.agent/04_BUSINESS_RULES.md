# 04_BUSINESS_RULES

## Indice Interno
- Perfis de Usuario
- Regras de Acesso ao Conteudo
- Regras de Publicacao
- Regras de Upload
- Regras Administrativas

## Perfis de Usuario
- student: consumo de conteudo.
- instructor: gestao de modulos/aulas/materiais.
- admin: controle total da plataforma.

## Regras de Acesso ao Conteudo
- Aula free preview: acessivel para student free.
- Aula nao free preview: exige student premium.
- Instructor/Admin: acesso total ao conteudo.

## Regras de Publicacao
- Curso pode existir como rascunho (is_published false).
- Publicacao define visibilidade no catalogo conforme regra de negocio vigente.

## Regras de Upload
- Upload de lesson e materiais deve persistir URL final no banco.
- Tipos aceitos para material: pdf, imagem, video.
- Upload unificado deve ser atomico no banco.
- Em erro de processo: rollback DB + tentativa de remover arquivos enviados.

## Regras Administrativas
- Apenas admin pode gerenciar usuarios via /admin/users e /users.
- Apenas admin altera role/subscription no painel admin.
- Operacoes de curso (create/update/delete) seguem regra atual de admin no backend.
