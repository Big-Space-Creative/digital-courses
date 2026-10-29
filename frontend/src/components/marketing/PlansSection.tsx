import Link from "next/link";
import { MdCheck } from "react-icons/md";

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
 * Illustrative pricing — simulated values (confirmed with the product owner,
 * no real billing plans exist yet). The one accent-fill bento tile in this
 * composition marks Premium as the recommended plan (Rare Orange Rule: one
 * accent tile per composition).
 */
export default function PlansSection({ primaryHref }: PlansSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <h2 className="reveal text-ink text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
          Planos simples, sem letra miúda
        </h2>

        <div className="reveal mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
          <div className="rounded-bento-xl bg-surface-soft border-ink/10 border p-8 md:p-10">
            <p className="text-ink text-sm font-semibold tracking-wide uppercase">
              Gratuito
            </p>
            <p className="text-ink mt-3 text-3xl font-semibold tracking-[-0.01em]">
              R$ 0
            </p>
            <p className="text-ink/60 mt-1 text-sm">
              para conhecer a plataforma
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <MdCheck
                    size={18}
                    className="text-accent mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-ink/75 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={primaryHref}
              className="border-ink/15 text-ink hover:bg-ink/5 focus-visible:ring-accent mt-7 inline-flex w-full items-center justify-center rounded-full border px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Começar grátis
            </Link>
          </div>

          <div className="rounded-bento-xl bg-accent p-8 md:p-10">
            <p className="text-sm font-semibold tracking-wide text-white uppercase">
              Premium
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.01em] text-white">
              R$ 39,90<span className="text-base font-medium">/mês</span>
            </p>
            <p className="mt-1 text-sm text-white/80">
              ou R$ 348/ano — economize 2 meses
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <MdCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-white"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-white/90">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={primaryHref}
              className="bg-ink hover:bg-ink/85 text-surface mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-accent)] focus-visible:outline-none"
            >
              Assinar Premium
            </Link>
          </div>
        </div>

        <p className="text-ink/50 reveal mt-6 text-xs">
          Cancele quando quiser, direto na sua área de aluno. Sem fidelidade.
        </p>
      </div>
    </section>
  );
}
