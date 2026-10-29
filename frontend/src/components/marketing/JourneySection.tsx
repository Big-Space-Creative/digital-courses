"use client";

import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    number: "1",
    title: "Crie sua conta",
    description: "Cadastre-se em minutos e acesse sua área do aluno.",
  },
  {
    number: "2",
    title: "Escolha o curso destaque",
    description:
      "O administrador publica os cursos e você entra direto no que importa.",
  },
  {
    number: "3",
    title: "Estude e pratique",
    description: "Aulas em vídeo + material extra para fixar cada módulo.",
  },
];

/**
 * The one deliberate numbered sequence on the page — earned because this
 * genuinely is an ordered 3-step flow. Expressed as a connected pulse line
 * (draws on reveal) instead of the banned "01 · eyebrow on a bordered card"
 * pattern.
 */
export default function JourneySection() {
  const lineRef = useReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-ink text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
            Como funciona sua jornada
          </h2>
          <span className="bg-accent/10 text-accent rounded-full px-3.5 py-1.5 text-xs font-medium">
            Simples e progressivo
          </span>
        </div>

        <div ref={lineRef} className="journey-line relative mt-12">
          <svg
            viewBox="0 0 900 60"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[19px] hidden h-[2px] w-full md:block"
          >
            <path
              d="M60,30 C260,-10 340,70 450,30 C560,-10 640,70 840,30"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              className="journey-path"
            />
          </svg>

          <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((step) => (
              <li key={step.number}>
                <div className="flex items-center gap-4 md:block">
                  <span className="bg-accent grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white">
                    {step.number}
                  </span>
                  <h3 className="text-ink text-lg font-semibold md:mt-4">
                    {step.title}
                  </h3>
                </div>
                <p className="text-ink/65 mt-2 text-sm leading-relaxed md:mt-2">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
