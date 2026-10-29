# Pullse — Sistema de design

Fundação v2. Direção: produto premium, preciso e sóbrio. Paleta e Lexend preservadas. Estas decisões substituem o sistema anterior de bento com raio de 40px. O plano de execução é a referência para a migração das telas.

## Cores e temas

Use tokens semânticos e suas utilities Tailwind (`bg-panel`, `text-text-muted`, `border-border`). Os valores são definidos em `src/app/globals.css`.

| Token                        | Claro            | Escuro            |
| ---------------------------- | ---------------- | ----------------- |
| `--canvas`                   | #F5F7F8          | #141617           |
| `--panel`                    | #FEFEFE          | #1D2022           |
| `--panel-elevated`           | #FFFFFF          | #272B2E           |
| `--border`                   | #929BA1          | #535B60           |
| `--text`                     | #1D1E1F          | #F5F7F8           |
| `--text-muted`               | #535B60          | #BAC2C7           |
| `--accent-text`              | #582807          | #FFAD76           |
| `--success` / `--on-success` | #166534 / branco | #86EFAC / #10291A |
| `--warning` / `--on-warning` | #854D0E / branco | #FCD34D / #332604 |
| `--danger` / `--on-danger`   | #B91C1C / branco | #FCA5A5 / #3A1111 |

Bordas dos controles usam `--control-border` (#78838A claro / #7C878E escuro), com contraste mínimo de 3:1. Bordas de painéis usam `--border`.

`--on-accent: #1D1E1F` e `--media: #101112` são fixos nos dois temas. Laranja #FF6B07 recebe texto ink; branco não deve aparecer sobre laranja. Accent-ink #582807 sobre laranja é permitido somente em texto grande (24px, ou 18,66px em negrito). Texto laranja em fundo claro deve usar `--accent-text`. Texto auxiliar usa cor sólida, sem opacity.

Público e aluno suportam wrappers `.theme-dark` / `[data-theme="dark"]`; o tema padrão é claro. Admin é exclusivamente claro: mantenha o wrapper escuro fora da árvore do admin. `.theme-light` / `[data-theme="light"]` podem delimitar uma superfície clara. Não use `bg-ink` para uma superfície escura fixa: use `bg-media` em vídeo. Os nomes antigos de cores continuam disponíveis; `surface`, `surface-soft`, `ink` acompanham o wrapper escuro. Não aplique opacity a esses aliases para texto novo.

## Forma, tipografia e profundidade

Raios: `--radius-xs` 8px; `--radius-control` 12px; `--radius-panel` 16px; `--radius-dialog` 20px; `--radius-hero` 28px; `--radius-pill` full. Aliases bento-sm/md/lg/xl: 12/16/20/28px.

Lexend, pesos 400/500/600. Página 24–28px / 32–36px, seção 18/24px, corpo 14–16/20–24px, auxiliar 12–13/18px. Um h1 por página. `--text-hero: clamp(2.25rem,1.75rem + 2.5vw,3.75rem)`, entrelinha 1.08, tracking -0.03em; `--text-h2: clamp(1.5rem,1.25rem + 1.2vw,2.25rem)` para marketing.

Painéis opacos com borda 1px; elevação leve de duas camadas `--shadow-panel`; `--shadow-overlay` apenas em modais, popovers e headers. `.glass`, `.glass-strong`, `.glass-accent` antigos agora são painéis opacos. `.glass-header` usa 94% de fundo e blur 16px. Cookie banner deve ser opaco.

Motion: 160/180/200ms, `cubic-bezier(0.16,1,0.3,1)`, somente transform/opacity. Nada de pulsação contínua em CTA. `.reveal` é visível sem JS; `useReveal` arma o estado inicial apenas após criar o observer. Reduced motion remove transform e mantém conteúdo visível. Skeleton é estático para evitar animação decorativa contínua.

## API dos primitivos

Imports diretos em `@/components/ui/<Nome>`. Componentes têm exports nomeados; Button e Dialog também default. Campos estão centralizados em Field.tsx e reexportados em arquivos individuais; o antigo `@/components/form/Input` permanece compatível.

- `Button`: props nativas de button (incluindo ref no React 19), `variant="primary|secondary|ghost|danger"`, `size="sm|md|lg"`, `loading`. Default: primary/md/type button. Loading desabilita e define aria-busy; mantenha o texto da ação. Alvos mínimos 44px em todos os tamanhos.
- `Input`, `Textarea`, `Select`: props nativas, `label` obrigatório, `help?: ReactNode`, `error?: string`, ref encaminhada. Input mantém `icon?: IconType`. ID pode ser fornecido ou gerado. Label, erro e ajuda são associados automaticamente; aria-describedby existente é preservado. Select recebe options como children.
- `Checkbox`: props de input exceto type; `label`, `help`, `error`, ref. Label aceita ReactNode, por exemplo texto com link para termos.
- `Field`: `id`, `label`, `help?`, `error?`, `children`, `className?`. Para controles personalizados: associe o controle ao id e a `${id}-help` / `${id}-error`, conforme o caso.
- `Dialog`: `open`, `onClose`, `title`, `description?`, `children`, `initialFocusRef?`, `className?`. Modal nativo (`showModal`), foco inicial no ref fornecido, primeiro campo disponível ou no container, trap nativo, Escape, fundo inert, scroll lock e retorno ao gatilho. Monte-o dentro do wrapper de tema. Para exclusões, forneça initialFocusRef no botão Cancelar. O chamador controla pending e decide quando fechar após salvar.
- `Badge` / `StatusPill`: props de span e `variant="neutral|success|warning|danger|accent"`. O texto deve comunicar o estado independentemente da cor.
- `EmptyState`: `title`, `description?`, `icon?`, `action?`, `className?`.
- `ErrorState`: mesmos props, title opcional, `onRetry?`, `loading?`; ação padrão “Tentar novamente”. Para retry assíncrono, o chamador controla loading.
- `Skeleton`: props de div, aria-hidden, altura mínima de 1rem. Configure dimensões por className; marque a região pai aria-busy e forneça texto de carregamento acessível.
- `PageHeader`: `title` (h1), `description?`, `actions?`, `eyebrow?`, `className?`.
- `Tabs`: `label`, `items: {value,label,content,disabled?}[]`, `value?`, `defaultValue?`, `onValueChange?`, `className?`. Controlled ou uncontrolled, setas/Home/End, roving tabindex, painéis associados. Mantenha values únicos e ao menos uma aba habilitada; valor controlado deve existir e estar habilitado.
- `DataList<T>`: `items`, `columns: {key,label,render(item)}[]`, `getKey(item)`, `getItemLabel?(item)` (identidade acessível do menu), `label`, `actions?: {label,onClick(item),disabled?(item),danger?}[]`, `empty?`, `className?`. Tabela no desktop, linhas com labels abaixo de 768px. Menu nativo details com controles de 44px. Keys e labels de ações devem ser únicos. Forneça identidade do registro no conteúdo da primeira coluna.
- `toast(title, {description?,variant?,duration?})`: API existente; retorna `{id,dismiss}`. `ToastProvider` deve ser montado uma vez. Bottom-right, máximo de três; timeout em milissegundos, <=0 persiste; pausa preservando tempo restante no hover ou foco. Erros usam alert, demais status. Fechar tem alvo de 44px. Evite informações essenciais somente em toast.
- `GradientButton`: wrapper compatível de Button primary; mantém type submit como o botão legado; sem sweep contínuo.

## Conteúdo e acessibilidade

Copy em português com acentos. WCAG 2.1 AA: foco visível, labels persistentes, teclado, contraste e estados legíveis nos dois temas. Nenhum dado fictício: progresso só quando houver API; ausência de dado precisa de explicação honesta. Não inventar preços, planos ou prova social.

Validação da fundação: `npx tsc --noEmit` e ESLint nos arquivos do escopo. Build é responsabilidade do Maestro.
