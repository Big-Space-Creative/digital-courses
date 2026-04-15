# 02_ROUTES_AND_PAGES — Frontend

## Estrutura de Rotas (App Router Next.js)

```
src/app/
├── page.tsx                         → redireciona (vazio)
├── layout.tsx                       → root layout (Lexend, UserProvider, ToastProvider)
├── globals.css                      → tokens Tailwind @theme
│
├── (public)/
│   ├── login/page.tsx               ✅ IMPLEMENTADO (form, react-hook-form+zod, toast)
│   └── register/page.tsx            ✅ IMPLEMENTADO
│
└── (privada)/
    ├── admin/
    │   ├── layout.tsx               → Sidebar + main wrapper
    │   ├── components/
    │   │   ├── Sidebar.tsx          ✅ IMPLEMENTADO (desktop/mobile, nav ativa)
    │   │   ├── DeleteConfirmModal.tsx ✅ IMPLEMENTADO
    │   │   └── ModuleNameModal.tsx  ✅ IMPLEMENTADO
    │   ├── dashboard/page.tsx       ✅ IMPLEMENTADO (cards stats, tabela cursos mock)
    │   ├── cursos/
    │   │   ├── page.tsx             → redireciona para /gerenciar (stub)
    │   │   ├── gerenciar/page.tsx   ✅ IMPLEMENTADO (tabela + busca + paginação mock)
    │   │   ├── criar/page.tsx       ✅ IMPLEMENTADO (form curso + módulos + aulas UI)
    │   │   └── editar/[courseId]/page.tsx ✅ IMPLEMENTADO (mesma estrutura do criar)
    │   ├── alunos/page.tsx          ✅ IMPLEMENTADO (tabela alunos, plano, status, ações)
    │   ├── configuracoes/page.tsx   ⚠️  STUB (apenas placeholder)
    │   └── perfil/                  ⚠️  NÃO EXISTENTE
    │
    └── aluno/
        ├── layout.tsx               → wrapper simples (sem sidebar ainda)
        ├── home/page.tsx            ✅ IMPLEMENTADO (banner, progresso, módulos accordion)
        ├── aula/[lessonId]/
        │   ├── page.tsx             ✅ IMPLEMENTADO (video+sidebar módulo+tabs)
        │   └── LessonTabs.tsx       ✅ IMPLEMENTADO (resumo/dicas/materiais)
        └── perfil/                  ⚠️  NÃO EXISTENTE
```

## Status por Página

| Rota | Status | Observação |
|------|--------|-----------|
| /login | ✅ Funcional | Integrado com loginAction |
| /register | ✅ Funcional | Integrado com registerAction |
| /admin/dashboard | ✅ UI pronta | Dados mock, sem API |
| /admin/cursos/gerenciar | ✅ UI pronta | Dados mock, sem API |
| /admin/cursos/criar | ✅ UI pronta | Sem submit real para API |
| /admin/cursos/editar/[id] | ✅ UI pronta | Não carrega curso existente |
| /admin/alunos | ✅ UI pronta | Dados mock, sem API |
| /admin/configuracoes | ⚠️ Stub | Só placeholder |
| /admin/perfil | ❌ Faltando | Não criado |
| /aluno/home | ✅ UI pronta | Dados mock, sem API |
| /aluno/aula/[id] | ✅ UI pronta | Dados mock, sem API |
| /aluno/perfil | ❌ Faltando | Não criado |

## Navegação Admin (Sidebar)
- Dashboard → /admin/dashboard
- Gerenciar Cursos → /admin/cursos/gerenciar
- Alunos → /admin/alunos
- Configurações → /admin/configuracoes

## Navegação Aluno (sem sidebar - layout direto)
- Home → /aluno/home
- Aula → /aluno/aula/[lessonId]
