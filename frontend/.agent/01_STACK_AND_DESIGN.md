# 01_STACK_AND_DESIGN — Frontend

## Stack Técnica
- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.3
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS v4 (postcss plugin)
- **Fonte**: Lexend (next/font/google, variável CSS --font-lexend)
- **Ícones**: react-icons v5 (subpacote md — Material Design)
- **Formulários**: react-hook-form + zod + @hookform/resolvers
- **Auth**: jwt-decode + cookie (server actions Next.js)
- **State global**: React Context (UserContext)

## Design System — Tokens (@theme em globals.css)
```css
--color-primary: #f0620f        /* laranja principal */
--color-primary-dark: #d1520a   /* laranja hover */
--color-secondary: #171f34      /* azul-marinho escuro */
--color-secondary-light: #273357 /* azul-marinho mais claro */
--color-background: #f8f6f5     /* fundo geral creme */
--color-white-soft: #f9f7f7     /* branco suave */
```

## Paleta de Classes Tailwind em Uso
- `bg-primary` / `hover:bg-primary-dark` — botões CTA
- `text-secondary` — headings principais
- `bg-secondary` / `bg-secondary-light` — sidebar e módulos do aluno
- `bg-background` — fundo das páginas admin
- Bordas: `border-gray-200`, focus `focus:border-orange-300`
- Cards: `rounded-xl border border-gray-200 bg-white shadow-sm`
- Badges premium: `bg-orange-100 text-orange-600`
- Badges free: `bg-slate-200 text-slate-600`

## Convenções Visuais
- **Sidebar admin**: bg `#1A1F36`, borda esquerda laranja no item ativo
- **Cards de módulo (aluno)**: bg-secondary com hover bg-secondary-light
- **Aulas bloqueadas**: bg-zinc-700 (módulo) / cursor-not-allowed
- **Tabelas**: min-w para scroll horizontal, header bg-gray-100 uppercase text-xs
- **Modais**: overlay + dialog centralizado, animação de entrada
- **Botão primário**: `bg-primary hover:bg-primary-dark text-white rounded-lg`
- **Botão secundário**: `border border-gray-200 bg-white text-gray-600 rounded-lg`

## Responsividade
- Mobile-first; breakpoints sm: e lg: para layout colunas
- Sidebar admin: oculta em mobile, abre via hamburguer overlay
- Layout aluno: coluna única, max-w-4xl centralizado
