# 05_PENDING_WORK — Frontend

## O que já está Pronto (UI)
- [x] Login e Register (com integração real de auth)
- [x] Sidebar admin (desktop + mobile hamburguer)
- [x] Dashboard admin (cards de stats, tabela de cursos - mock)
- [x] Gerenciar Cursos (tabela, busca, paginação - mock)
- [x] Criar Curso (form info + módulos + aulas - UI completa, sem submit API)
- [x] Editar Curso (mesma estrutura do criar - UI completa, sem carregar dados API)
- [x] Gestão de Alunos (tabela, filtro, ações - mock)
- [x] Home do Aluno (banner progresso, accordion de módulos - mock)
- [x] Página de Aula (video + sidebar módulo + tabs resumo/dicas/materiais - mock)
- [x] Componentes: Toast, ProgressBar, VideoPlayer, Input, Sidebar, DeleteConfirmModal, ModuleNameModal, LessonTabs

## O que Falta (Prioridade Alta)

### Páginas Faltantes
- [ ] /admin/configuracoes — apenas stub, precisa de conteúdo (perfil da plataforma, senha, etc.)
- [ ] /admin/perfil — página de perfil do admin (não existe)
- [ ] /aluno/perfil — página de perfil do aluno (não existe)

### Integração com API (sem dados reais ainda)
- [ ] /admin/cursos/gerenciar → buscar courses da API
- [ ] /admin/cursos/criar → submeter form para API (POST course + módulos + upload)
- [ ] /admin/cursos/editar/[id] → carregar dados do curso + submeter alterações
- [ ] /admin/alunos → buscar usuários da API (/admin/users)
- [ ] /admin/dashboard → buscar métricas reais
- [ ] /aluno/home → buscar cursos matriculados do aluno
- [ ] /aluno/aula/[id] → buscar dados da lesson + vídeo URL assinada do MinIO

### Melhorias de UX
- [ ] Página de aula: player de vídeo real (substituir stub VideoPlayer)
- [ ] Página de aula: marcar aula como concluída (botão já existe, sem lógica)
- [ ] Form criar/editar curso: upload real de vídeo (multipart → /lessons/upload)
- [ ] Form criar/editar curso: upload real de materiais por aula
- [ ] Sidebar aluno: implementar navegação (atualmente sem sidebar no layout do aluno)
- [ ] Proteção de rotas: middleware.ts para redirecionar não autenticados
- [ ] Loading states: skeleton loaders nas páginas com dados async
- [ ] Error boundaries: tratamento de erro global

### Funcionalidades Novas
- [ ] Página de catálogo de cursos (pública ou para aluno não matriculado)
- [ ] Enrollment: botão de matricular em curso
- [ ] Busca de cursos/alunos com debounce + chamada real à API
- [ ] Paginação real (não mock)

## Notas de Design Importantes
- O campo "Link do video (Vimeo/Youtube)" nas cards de aula no admin
  na verdade deve ser um UPLOAD de arquivo (multipart) → endpoint /lessons/upload
  O design está bem; só a semântica do campo precisa mudar para file input
- VideoPlayer.tsx é stub — integrar com biblioteca tipo react-player para Vimeo/YouTube
  ou usar <video> nativo para vídeos do MinIO com URL assinada
- A cor #1A1F36 usada na sidebar não é um token — unificar com bg-secondary se possível

## Convenção de Novos Arquivos
- Página nova no admin: src/app/(privada)/admin/[rota]/page.tsx
- Componente compartilhado admin: src/app/(privada)/admin/components/[Nome].tsx
- Service de API: src/services/api/[dominio].ts
- Tipo TypeScript: src/types/[dominio].ts (criar pasta se necessário)
