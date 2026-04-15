# 00_START_HERE — Frontend

Arquivo principal para qualquer agente de IA antes de alterar o frontend.

## Ordem de Leitura
1. 00_START_HERE.md (este arquivo)
2. 01_STACK_AND_DESIGN.md
3. 02_ROUTES_AND_PAGES.md
4. 03_COMPONENTS_AND_PATTERNS.md
5. 04_API_INTEGRATION.md
6. 05_PENDING_WORK.md

## Estado Atual do Frontend
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4 (com tokens no globals.css via @theme)
- Fonte: Lexend (Google Fonts)
- Autenticação JWT com cookie httpOnly (lida server-side via actions)
- Dois contextos de usuario: admin (sidebar dark) e aluno (layout simples)
- Design system: laranja (#F0620F primary) + azul-marinho (#171F34 secondary)
- Todos os dados ainda sao mock (sem integração real com a API)

## Regra de Ouro
- Nunca usar inline styles; usar classes Tailwind com tokens do @theme
- Nunca hardcodar cores hex no JSX; usar bg-primary, text-secondary, etc.
- Manter consistência visual: border-radius xl/2xl, sombras sm, espaçamentos p-4/p-6
- Novos componentes compartilhados vão em src/components/
- Novos serviços de API vão em src/services/api/
