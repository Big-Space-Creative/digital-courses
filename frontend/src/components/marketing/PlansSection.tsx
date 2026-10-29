import { MdCheck } from "react-icons/md";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";

type PlansSectionProps = {
  primaryHref: string;
};

const freeFeatures = [
  "Aulas de amostra em cada módulo",
  "Visualização da trilha completa",
  "Upgrade para Premium a qualquer momento",
];

const premiumFeatures = [
  "Acesso completo a todas as aulas e módulos",
  "Material de apoio (PDFs e guias) em cada aula",
  "Acompanhamento de progresso completo",
  "Acesso a novos instrumentos assim que forem lançados",
];

/**
 * PlansSection — Honest pricing cards.
 * - Premium card uses semantic elevated panel with an accent border and "Mais escolhido" badge (no solid orange background).
 * - High contrast buttons (ink text on #FF6B07 for primary).
 * - Real plan data; no invented billing switches or artificial tiers.
 */
export default function PlansSection({ primaryHref }: PlansSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal">
          <h2 className="text-text text-[length:var(--text-h2)] font-semibold tracking-[-0.02em]">
            Planos simples, sem letra miúda
          </h2>
          <p className="text-text-muted mt-2 text-sm md:text-base">
            Escolha como quer começar sua jornada musical
          </p>
        </div>

        <div className="reveal mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Gratuito */}
          <div className="flex flex-col justify-between rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--panel)] p-7 shadow-[var(--shadow-panel)] md:p-9">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-text text-sm font-semibold tracking-wider uppercase">
                  Gratuito
                </p>
                <Badge variant="neutral">Básico</Badge>
              </div>
              <p className="text-text mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                R$ 0
              </p>
              <p className="text-text-muted mt-1 text-sm">
                para conhecer a plataforma
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <MdCheck
                      size={18}
                      className="text-accent-text mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <ButtonLink
              href={primaryHref}
              variant="secondary"
              size="md"
              className="mt-8 w-full rounded-full"
            >
              Começar grátis
            </ButtonLink>
          </div>

          {/* Premium — Elevated panel with accent highlight and badge, no solid orange flood */}
          <div className="relative flex flex-col justify-between rounded-[var(--radius-panel)] border-2 border-[#FF6B07] bg-[var(--panel-elevated)] p-7 shadow-[var(--shadow-overlay)] md:p-9">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-accent-text text-sm font-semibold tracking-wider uppercase">
                  Premium
                </p>
                <Badge variant="accent">Mais escolhido</Badge>
              </div>
              <p className="text-text mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                R$ 39,90
                <span className="text-text-muted text-base font-normal">
                  /mês
                </span>
              </p>
              <p className="text-text-muted mt-1 text-sm">
                ou R$ 348/ano — economize 2 meses
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <MdCheck
                      size={18}
                      className="text-accent-text mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-text text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <ButtonLink
              href={primaryHref}
              variant="primary"
              size="md"
              className="mt-8 w-full rounded-full shadow-sm"
            >
              Assinar Premium
            </ButtonLink>
          </div>
        </div>

        <p className="text-text-muted reveal mt-6 text-xs">
          Cancele quando quiser, direto na sua área de aluno. Sem taxa de
          cancelamento ou fidelidade.
        </p>
      </div>
    </section>
  );
}
