import Image from "next/image";
import Link from "next/link";
import { MdGroups } from "react-icons/md";

type FinalCtaSectionProps = {
  isAuthenticated: boolean;
  primaryHref: string;
};

/**
 * FinalCtaSection — Closing CTA with semantic surfaces.
 * Photo /03.jpg preserved. High-contrast buttons (ink over #FF6B07 for primary).
 */
export default function FinalCtaSection({
  isAuthenticated,
  primaryHref,
}: FinalCtaSectionProps) {
  return (
    <section className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--canvas)]">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal grid gap-6 md:grid-cols-[1fr_1.3fr] md:gap-8">
          {/* Photo tile — Photo /03.jpg preserved */}
          <div className="relative min-h-[240px] overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--media)] shadow-[var(--shadow-panel)] md:min-h-0">
            <Image
              src="/03.jpg"
              alt="Aluna praticando violão clássico ao ar livre"
              fill
              sizes="(min-width: 768px) 35vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
              loading="lazy"
            />
          </div>

          {/* Headline + Actions tile */}
          <div className="rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow-panel)] md:p-12">
            <h2 className="text-text text-2xl font-semibold tracking-tight text-balance md:text-3xl">
              Pronto para transformar sua prática musical?
            </h2>
            <p className="text-text-muted mt-3 max-w-md text-sm leading-relaxed md:text-base">
              Entre na plataforma e siga uma rotina consistente com aulas,
              materiais e progresso acompanhável.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="focus-visible:ring-accent inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#FF6B07] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <MdGroups size={20} aria-hidden="true" />
                {isAuthenticated ? "Ir para minha área" : "Criar conta grátis"}
              </Link>
              <Link
                href="/login"
                className="border-control-border text-text hover:bg-canvas focus-visible:ring-accent inline-flex min-h-[44px] items-center rounded-full border bg-[var(--panel)] px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
