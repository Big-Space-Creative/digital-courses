# Product

## Register

brand

Nota: este é o registro padrão para a superfície de marketing (home/landing, `app/page.tsx`). As rotas autenticadas `/admin/*` e `/aluno/*` são registro **product** (dashboard/app-shell) — comandos do impeccable que apontarem para essas rotas devem tratar o registro como product, não brand, mesmo com este arquivo definindo "brand" como padrão do projeto.

## Users

- **Alunos (student)**: aprendizes buscando cursos em vídeo estruturados por módulo/aula; dois níveis — free preview (acesso limitado) e premium (acesso completo). Contexto de uso: sessões de estudo focadas, provavelmente fora do horário de trabalho, em desktop ou mobile.
- **Admin / Instructor**: publicam e gerenciam cursos, módulos, aulas e materiais; acompanham progresso de alunos. Contexto de uso: sessões de trabalho mais longas, foco em produtividade.
- **Visitante não autenticado**: chega pela landing page, precisa ser convencido a criar conta.

## Product Purpose

Plataforma paga de cursos em vídeo (Pullse). A landing page existe para converter visitantes em contas registradas; a plataforma autenticada existe para entregar as aulas com progresso rastreável, materiais de apoio e uma experiência de estudo sem fricção.

## Brand Personality

**Energética e precisa.** O laranja pulsante (`#FF6B07`) carrega a energia da marca mas aparece raramente — a base é técnica e geométrica (Lexend), então a marca lê como confiante e precisa, não gritante. A "pulsação" (motivo do `PulseWave`) é o fio condutor: a marca deveria parecer viva, respondendo sutilmente à presença do usuário (movimento do mouse/toque), não estática.

Direção visual explícita para a home (a ser detalhada no `shape` desta tarefa):
- Navbar flutuante, translúcida e fosca (frosted glass, estilo iOS) — compatível com a regra existente do DESIGN.md de que glass é reservado a overlays (sticky headers já é um caso previsto).
- Micro-animações de pulsação sutis na tela inicial, não decorativas — ligadas ao motivo `PulseWave`.
- Interatividade leve ao movimento do mouse/toque — a página deve reagir, não ser estática.
- Cores fortes onde aparecem, mas sem abandonar a Regra do Laranja Raro (≤10-15% da tela) — a força vem de saturação/contraste no momento em que a cor aparece, não de cobertura.
- Bordas arredondadas generosas (já documentado como a assinatura do sistema bento).

## Anti-references

Nenhuma anti-referência explícita de site/app foi apontada. Aplicar por padrão os banimentos do impeccable (texto em gradiente, glassmorphism decorativo fora de overlays reais, grids de cards idênticos, eyebrows/números de seção genéricos) e evitar o clichê "SaaS genérico" (cards uniformes, gradiente azul-roxo) por serem incompatíveis com a personalidade "energética e precisa" acima.

## Design Principles

1. **A marca pulsa, não é estática** — motion é parte da identidade (PulseWave, micro-interações ao mouse/toque), não um enfeite opcional.
2. **Laranja raro, mas intenso quando aparece** — ≤10-15% da tela, nunca cor de fundo geral.
3. **Vidro é para overlays de verdade** — navbar flutuante, modais, banners; nunca tratamento padrão de card.
4. **Precisão técnica sustenta a energia** — tipografia geométrica (Lexend) e hierarquia por escala, não por decoração, mantêm a marca confiável apesar da energia visual.
5. **A sessão de trabalho fica calma** — admin/aluno permanecem no `--color-surface` claro; o canvas escuro/pulsante é território de marketing (home), não do app autenticado.

## Accessibility & Inclusion

WCAG 2.1 AA. Atenção especial a `prefers-reduced-motion` dado o forte componente de animação/pulsação da marca — toda animação decorativa precisa de alternativa estática ou crossfade.
