import { MdFormatQuote } from "react-icons/md";

const testimonials = [
  {
    quote:
      "Eu tentei aprender sozinha por anos e sempre travava no mesmo ponto. Aqui os módulos me levaram do zero até tocar minhas músicas favoritas sem pular etapa nenhuma.",
    name: "Mariana Duarte",
    detail: "29 anos, aluna há 8 meses",
    initials: "MD",
  },
  {
    quote:
      "Uso a Pullse nos 20 minutos que sobram depois do trabalho. As aulas curtas cabem na minha rotina de um jeito que nenhum curso antes conseguiu.",
    name: "Rafael Costa",
    detail: "34 anos",
    initials: "RC",
  },
  {
    quote:
      "Comecei no plano gratuito só pra testar e migrei pro Premium na primeira semana. O material de apoio de cada aula fez toda diferença pra fixar o conteúdo.",
    name: "Beatriz Andrade",
    detail: "19 anos",
    initials: "BA",
  },
];

/**
 * TestimonialsSection — Uniform grid with initials avatars.
 * Preserves the exact 3 existing student accounts without invented testimonials or fake faces.
 */
export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="wave-reading-surface reveal w-fit rounded-[var(--radius-panel)] p-6 sm:p-8">
          <h2 className="text-text text-[length:var(--text-h2)] font-semibold tracking-[-0.02em]">
            O que dizem os alunos
          </h2>
          <p className="text-text-muted mt-2 text-sm md:text-base">
            Depoimentos de quem transformou a prática de violão no dia a dia
          </p>
        </div>

        <div className="reveal mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow-panel)]"
            >
              <div>
                <MdFormatQuote
                  size={28}
                  className="text-accent-text"
                  aria-hidden="true"
                />
                <p className="text-text mt-3 text-sm leading-relaxed">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-4">
                <span
                  aria-hidden="true"
                  className="bg-accent/15 text-accent-text flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                >
                  {item.initials}
                </span>
                <div>
                  <p className="text-text text-sm font-semibold">{item.name}</p>
                  <p className="text-text-muted text-xs">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
