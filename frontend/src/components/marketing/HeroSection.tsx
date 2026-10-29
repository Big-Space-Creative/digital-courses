import Image from "next/image";
import Link from "next/link";
import { MdOutlinePlayCircle, MdStar } from "react-icons/md";

type HeroSectionProps = {
  isAuthenticated: boolean;
  primaryHref: string;
};

const stats = [
  { label: "Aulas objetivas", value: "+120" },
  { label: "Módulos ativos", value: "18" },
  { label: "Prática guiada", value: "100%" },
  { label: "Suporte didático", value: "Sempre" },
];

/**
 * Hero Section — Pullse Bento Grid.
 * - H1 typography: text-[var(--text-hero)] clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)
 * - Radius: 28px max (rounded-[var(--radius-hero)])
 * - Contrast AA: Ink text (#1D1E1F) over orange #FF6B07 (never white over orange)
 * - Semantic surfaces: panel / panel-elevated (no fixed bg-ink)
 * - Photo /02.jpg preserved verbatim
 */
export default function HeroSection({
  isAuthenticated,
  primaryHref,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-24 pb-14 md:px-8 md:pt-32 md:pb-20">
        <div
          className="reveal grid gap-5 md:grid-cols-[1.4fr_1fr] md:gap-6"
          style={{
            gridTemplateAreas: "'headline photo' 'accent photo' 'stats photo'",
          }}
        >
          {/* Headline tile */}
          <div
            className="rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--panel)] p-7 shadow-[var(--shadow-panel)] md:p-10"
            style={{ gridArea: "headline" }}
          >
            <h1 className="text-text leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-[var(--text-hero)]">
              Domine o violão com uma trilha clara, do primeiro acorde à
              apresentação
            </h1>
            <p className="text-text-muted mt-4 max-w-lg text-sm leading-relaxed text-pretty md:text-base">
              Aulas em vídeo organizadas por módulo, prática guiada e
              acompanhamento de progresso — para você tocar com confiança, no
              seu ritmo.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="focus-visible:ring-accent inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#FF6B07] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <MdOutlinePlayCircle size={20} aria-hidden="true" />
                {isAuthenticated ? "Ir para minha área" : "Começar agora"}
              </Link>
              <Link
                href="/login"
                className="border-control-border text-text hover:bg-canvas focus-visible:ring-accent inline-flex min-h-[44px] items-center rounded-full border bg-[var(--panel)] px-5 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Accent tile — High contrast: ink text and stars over orange (#FF6B07) */}
          <div
            className="rounded-[var(--radius-hero)] bg-[#FF6B07] p-6 shadow-sm md:p-8"
            style={{ gridArea: "accent" }}
          >
            <div className="flex items-center gap-1 text-[var(--on-accent)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <MdStar key={index} size={18} aria-hidden="true" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed font-semibold text-[var(--on-accent)] md:text-base">
              Método aprovado por alunos iniciantes e avançados.
            </p>
          </div>

          {/* Stats tile — Semantic surface (panel-elevated) */}
          <div
            className="rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--panel-elevated)] p-6 shadow-[var(--shadow-panel)] md:p-8"
            style={{ gridArea: "stats" }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-text text-xl font-semibold md:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-text-muted mt-1 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo tile — Photo /02.jpg preserved */}
          <div
            className="relative min-h-[280px] overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border)] bg-[var(--media)] shadow-[var(--shadow-panel)] md:min-h-0"
            style={{ gridArea: "photo" }}
          >
            <Image
              src="/02.jpg"
              alt="Aluno tocando guitarra elétrica ao vivo, sorrindo"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "32% 38%" }}
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16">
              <p className="text-sm font-medium text-white">
                Alunos reais, resultado real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
