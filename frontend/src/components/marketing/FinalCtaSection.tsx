import Image from "next/image";
import Link from "next/link";
import { MdGroups } from "react-icons/md";

type FinalCtaSectionProps = {
  isAuthenticated: boolean;
  primaryHref: string;
};

/**
 * Bookends the hero: the page's second and last dark accent-ink canvas,
 * closing the Pulse Bento system it opened with. One photo tile, one
 * headline+CTA tile — not a third visual system.
 */
export default function FinalCtaSection({
  isAuthenticated,
  primaryHref,
}: FinalCtaSectionProps) {
  return (
    <section className="bg-accent-ink relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="reveal grid gap-5 md:grid-cols-[1fr_1.3fr] md:gap-6">
          <div className="rounded-bento-xl relative min-h-[220px] overflow-hidden md:min-h-0">
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

          <div className="rounded-bento-xl bg-surface-soft p-8 md:p-12">
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.01em] text-balance md:text-3xl">
              Pronto para transformar sua prática musical?
            </h2>
            <p className="text-ink/70 mt-3 max-w-md text-sm leading-relaxed md:text-base">
              Entre na plataforma e siga uma rotina consistente com aulas,
              materiais e progresso acompanhável.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="gradient-animate inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                style={{ backgroundImage: "var(--gradient-pulse)" }}
              >
                <MdGroups size={18} />
                {isAuthenticated ? "Ir para minha área" : "Criar conta grátis"}
              </Link>
              <Link
                href="/login"
                className="border-ink/15 text-ink hover:bg-ink/5 focus-visible:ring-accent inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
