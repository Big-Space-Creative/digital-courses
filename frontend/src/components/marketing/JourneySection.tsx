"use client";

import { useReveal } from "@/hooks/useReveal";
import { Badge } from "@/components/ui/Badge";

const steps = [
  {
    number: "1",
    title: "Crie sua conta",
    description: "Cadastre-se em minutos e acesse sua área exclusiva de aluno.",
  },
  {
    number: "2",
    title: "Acesse seu curso",
    description:
      "Entre direto no conteúdo estruturado e organizado para o seu nível atual.",
  },
  {
    number: "3",
    title: "Estude e pratique",
    description:
      "Aulas em vídeo com material complementar para fixar cada módulo.",
  },
];

/**
 * JourneySection with student-focused copy and responsive connectors (horizontal on desktop, vertical on mobile).
 * High-contrast step indicators (ink text over #FF6B07).
 */
export default function JourneySection() {
  const lineRef = useReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div className="wave-reading-surface rounded-[var(--radius-panel)] p-6 sm:p-8">
            <h2 className="text-text text-[length:var(--text-h2)] font-semibold tracking-[-0.02em]">
              Como funciona sua jornada
            </h2>
            <p className="text-text-muted mt-2 text-sm md:text-base">
              Três passos simples para começar a tocar violão
            </p>
          </div>
          <Badge variant="accent">Simples e progressivo</Badge>
        </div>

        <div
          ref={lineRef}
          className="wave-reading-surface journey-line relative mt-8 rounded-[var(--radius-panel)] p-6 sm:p-8"
        >
          {/* Desktop horizontal connector track */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-13 right-12 left-12 hidden h-0.5 border-t-2 border-dashed border-[#FF6B07]/40 md:block"
          />

          <ol className="relative grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <li
                key={step.number}
                className="relative flex items-start gap-4 md:block"
              >
                {/* Mobile vertical connector */}
                {index < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-10 bottom-0 left-5 -ml-px w-0.5 border-l-2 border-dashed border-[#FF6B07]/40 md:hidden"
                  />
                )}

                <div className="flex items-center gap-4 md:block">
                  <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6B07] text-sm font-bold text-[var(--on-accent)] shadow-sm">
                    {step.number}
                  </span>
                  <h3 className="text-text text-base font-semibold md:mt-4 md:text-lg">
                    {step.title}
                  </h3>
                </div>
                <p className="text-text-muted mt-1 text-sm leading-relaxed md:mt-2">
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
