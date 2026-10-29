import { MdFormatQuote } from "react-icons/md";

const featured = {
  quote:
    "Eu tentei aprender sozinha por anos e sempre travava no mesmo ponto. Aqui os módulos me levaram do zero até tocar minhas músicas favoritas sem pular etapa nenhuma.",
  name: "Mariana Duarte",
  detail: "29 anos, aluna há 8 meses",
};

const rest = [
  {
    quote:
      "Uso a Pullse nos 20 minutos que sobram depois do trabalho. As aulas curtas cabem na minha rotina de um jeito que nenhum curso antes conseguiu.",
    name: "Rafael Costa",
    detail: "34 anos",
  },
  {
    quote:
      "Comecei no plano gratuito só pra testar e migrei pro Premium na primeira semana. O material de apoio de cada aula fez toda diferença pra fixar o conteúdo.",
    name: "Beatriz Andrade",
    detail: "19 anos",
  },
];

/**
 * Illustrative testimonials — no real alumni feedback exists yet (confirmed
 * with the product owner). Replace with real quotes as they come in.
 * One featured ink bento tile + two smaller surface-soft cards, matching the
 * bento fill roles without repeating HighlightsSection's exact topology.
 */
export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="reveal text-ink text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
          O que dizem os alunos
        </h2>

        <div className="reveal mt-8 grid gap-5 md:grid-cols-[1.1fr_1fr] md:gap-6">
          <div className="rounded-bento-lg bg-ink flex flex-col justify-between p-8 md:p-10">
            <MdFormatQuote
              size={32}
              className="text-surface/40"
              aria-hidden="true"
            />
            <p className="text-surface mt-4 text-lg leading-relaxed md:text-xl">
              {featured.quote}
            </p>
            <p className="text-surface/60 mt-6 text-sm">
              <span className="text-surface font-semibold">
                {featured.name}
              </span>
              {" · "}
              {featured.detail}
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {rest.map((item) => (
              <div
                key={item.name}
                className="rounded-bento-lg bg-surface-soft border-ink/10 border p-6"
              >
                <p className="text-ink/80 text-sm leading-relaxed md:text-base">
                  {item.quote}
                </p>
                <p className="text-ink/50 mt-4 text-xs">
                  <span className="text-ink/80 font-semibold">{item.name}</span>
                  {" · "}
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
